/* eslint-disable */

import { Address, encodeFunctionData, Hex, parseUnits } from "viem";

import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { UNISWAP } from "@/constants/protocols/uniswap";
import { ERC20_ABI, NFT_MANAGER_ABI } from "@/constants/abis";
import { getDeadline } from "@/utils/strategies";
import { GetProtocolChains } from "@/types/strategies";
import { Position } from "@/types/position";
import { UniswapV3Swap } from "@/classes/swap";
import { Token } from "@/types/blockchain";
import { getTokenAddress } from "@/utils/coins";

export type UniswapV3InvestParams = {
  // Core token configuration
  assetName: string;
  pairToken: Token;
  
  // Pool configuration
  fee?: number;           // Fee tier: 100, 500, 3000, 10000 (default: 3000)
  tickLower?: number;     // Lower tick (default: -887220 for full range)
  tickUpper?: number;     // Upper tick (default: 887220 for full range)
  
  // Risk management
  slippage?: number;      // Slippage tolerance in basis points (default: 50)
  swapSlippage?: number;  // Separate slippage for initial swap (default: same as slippage)
  deadline?: number;      // Deadline in seconds from now (default: 1200 = 20 minutes)
};

export type UniswapV3RedeemParams = {
  // Position identification
  tokenId: bigint;        // NFT position ID
  
  // Liquidity management
  liquidityPercent?: number;  // Percentage to remove 1-100 (default: 100)
  liquidityAmount?: bigint;   // Exact liquidity amount (overrides percent)
  
  // Token addresses for validation
  token0: Address;        // First token address (sorted)
  token1: Address;        // Second token address (sorted)
  
  // Risk management
  slippage?: number;      // Slippage tolerance in basis points (default: 50)
  deadline?: number;      // Deadline in seconds from now (default: 1200)
  
  // Collection preferences
  collectFees?: boolean;  // Collect accumulated fees (default: true)
  burnNFT?: boolean;      // Burn NFT if removing 100% (default: false)
  
  // Output preference (optional)
  convertToSingleToken?: {
    targetToken: Address;     // Convert all output to this token
    swapSlippage?: number;    // Slippage for conversion (default: 100)
  };
};

// Legacy type for backward compatibility
export type UniswapV3AddLiquidityParams = {
  swapCalldata: Hex;
  swapAsset: Address;
  fee: number;
  amount0Desired: bigint;
  amount1Desired: bigint;
  slippage: number;
};

type NFTPositionInfo = {
  tokenId: bigint;
  operator: Address;
  token0: Address;
  token1: Address;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  feeGrowthInside0LastX128: bigint;
  feeGrowthInside1LastX128: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
};

type LiquidityAmounts = {
  amount0: bigint;
  amount1: bigint;
};

/**
 * Compares two addresses lexicographically
 * @param addressA First address
 * @param addressB Second address
 * @returns negative if addressA < addressB, positive if addressA > addressB, 0 if equal
 */
export function compareAddresses(addressA: Address, addressB: Address): number {
  // Convert to lowercase to ensure consistent comparison
  const a = addressA.toLowerCase();
  const b = addressB.toLowerCase();

  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Returns addresses sorted in ascending order
 * @param addressA First address
 * @param addressB Second address
 * @returns [smallerAddress, largerAddress]
 */
export function sortAddresses(
  addressA: Address,
  addressB: Address
): [Address, Address] {
  return compareAddresses(addressA, addressB) < 0
    ? [addressA, addressB]
    : [addressB, addressA];
}

export class UniswapV3AddLiquidity extends BaseStrategy<typeof UNISWAP> {
  // Default configuration constants
  static readonly DEFAULT_SLIPPAGE = 50;        // 0.5% in basis points
  static readonly DEFAULT_FEE = 3000;           // 0.3% fee tier
  static readonly DEFAULT_DEADLINE = 1200;      // 20 minutes in seconds
  static readonly FULL_RANGE_LOWER = -887220;   // Full range lower tick
  static readonly FULL_RANGE_UPPER = 887220;    // Full range upper tick
  
  // Supported fee tiers
  static readonly SUPPORTED_FEES = [100, 500, 3000, 10000] as const;

  public swapStrategy?: UniswapV3Swap;

  constructor(
    chainId: GetProtocolChains<typeof UNISWAP>,
    swapStrategy?: UniswapV3Swap
  ) {
    super(chainId, UNISWAP, "UniswapV3AddLiquidity");
    if (swapStrategy) this.swapStrategy = swapStrategy;
  }

  async investCalls(
    amount: bigint,
    user: Address,
    asset: Address,
    params: UniswapV3InvestParams
  ): Promise<StrategyCall[]> {
    // Validate required parameters
    if (!params.assetName || !params.pairToken) {
      throw new Error("UniswapV3AddLiquidity: assetName and pairToken are required");
    }

    if (!this.swapStrategy) {
      throw new Error("UniswapV3AddLiquidity: Swap strategy not implemented");
    }

    // Apply defaults and validate parameters
    const config = this.validateAndApplyDefaults(params);
    
    const halfAmount = amount / BigInt(2);
    const swapSlippage = config.swapSlippage || config.slippage;

    // Get swap calls with configurable slippage
    const { calls: swapCalls, quoteAmount } = await this.swapStrategy.getSwapCalls(
      params.assetName,
      params.pairToken.name,
      halfAmount,
      user
    );

    const nftManager = this.getAddress("nftManager");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + config.deadline);
    const pairTokenAddress = getTokenAddress(params.pairToken, this.chainId);

    const [token0, token1] = sortAddresses(asset, pairTokenAddress);

    // Calculate token amounts based on sorted order
    let amount0Desired = halfAmount;
    let amount1Desired = parseUnits(quoteAmount, params.pairToken.decimals);

    if (token1 === asset) {
      amount0Desired = parseUnits(quoteAmount, params.pairToken.decimals);
      amount1Desired = halfAmount;
    }

    // Calculate minimum amounts with slippage protection
    const amount0Min = (amount0Desired * BigInt(10000 - config.slippage)) / BigInt(10000);
    const amount1Min = (amount1Desired * BigInt(10000 - config.slippage)) / BigInt(10000);

    return [
      ...swapCalls,
      {
        to: token0,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [nftManager, amount0Desired],
        }),
      },
      {
        to: token1,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [nftManager, amount1Desired],
        }),
      },
      {
        to: nftManager,
        data: encodeFunctionData({
          abi: NFT_MANAGER_ABI,
          functionName: "mint",
          args: [
            {
              token0,
              token1,
              fee: config.fee,
              tickLower: config.tickLower,
              tickUpper: config.tickUpper,
              amount0Desired,
              amount1Desired,
              amount0Min,
              amount1Min,
              recipient: user,
              deadline,
            },
          ],
        }),
      },
    ];
  }

  async redeemCalls(
    amount: bigint,
    user: Address,
    asset?: Address,
    params?: UniswapV3RedeemParams
  ): Promise<StrategyCall[]> {
    if (!params) {
      throw new Error("UniswapV3AddLiquidity: Redeem parameters are required");
    }

    // Validate required parameters
    if (!params.tokenId || !params.token0 || !params.token1) {
      throw new Error("UniswapV3AddLiquidity: tokenId, token0, and token1 are required");
    }

    // Validate token addresses
    if (!this.isValidAddress(params.token0) || !this.isValidAddress(params.token1)) {
      throw new Error("UniswapV3AddLiquidity: Invalid token addresses");
    }

    // Apply defaults
    const config = this.validateAndApplyRedeemDefaults(params);
    
    const nftManager = this.getAddress("nftManager");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + config.deadline);
    const calls: StrategyCall[] = [];
    
    // If liquidityAmount is not provided, query the NFT position to get current liquidity
    if (!config.liquidityAmount) {
      const positionInfo = await this.getNFTPositionInfo(config.tokenId);
      config.liquidityAmount = (positionInfo.liquidity * BigInt(config.liquidityPercent)) / BigInt(100);
      
      // Validate that the position actually exists and has liquidity
      if (positionInfo.liquidity === BigInt(0)) {
        throw new Error(`NFT position ${config.tokenId} has no liquidity to remove`);
      }
      
      // Validate token addresses match the position
      if (positionInfo.token0 !== config.token0 || positionInfo.token1 !== config.token1) {
        throw new Error(`Token addresses don't match NFT position. Expected: ${positionInfo.token0}, ${positionInfo.token1}`);
      }
    }

    // Step 1: Decrease liquidity
    calls.push({
      to: nftManager,
      data: encodeFunctionData({
        abi: NFT_MANAGER_ABI,
    
        functionName: "decreaseLiquidity",
        args: [
          {
            tokenId: config.tokenId,
            liquidity: config.liquidityAmount,
            amount0Min: await this.calculateMinAmount0(config.tokenId, config.liquidityAmount, config.slippage),
            amount1Min: await this.calculateMinAmount1(config.tokenId, config.liquidityAmount, config.slippage),
            deadline,
          },
        ],
      }),
    });

    // Step 2: Collect tokens and fees
    if (config.collectFees) {
      calls.push({
        to: nftManager,
        data: encodeFunctionData({
          abi: NFT_MANAGER_ABI,
          functionName: "collect",
          args: [
            {
              tokenId: config.tokenId,
              recipient: user,
              amount0Max: BigInt("0xffffffffffffffffffffffffffffffff"), // uint128 max
              amount1Max: BigInt("0xffffffffffffffffffffffffffffffff"), // uint128 max
            },
          ],
        }),
      });
    }

    // Step 3: Burn NFT if requested and removing 100%
    if (config.burnNFT && config.liquidityPercent === 100) {
      calls.push({
        to: nftManager,
        data: encodeFunctionData({
          abi: NFT_MANAGER_ABI,
          functionName: "burn",
          args: [config.tokenId],
        }),
      });
    }

    // Step 4: Convert to single token if requested
    if (config.convertToSingleToken && this.swapStrategy) {
      // This would require additional logic to swap one token to another
      // For now, we'll add a TODO comment for future implementation
      // TODO: Implement single token conversion after liquidity removal
    }

    return calls;
  }

  async getProfit(user: Address, position: Position): Promise<number> {
    try {
      // For now, implement a basic time-based calculation
      // In a real implementation, this would query the NFT position and calculate
      // the current value of tokens + fees vs initial investment
      
      const daysElapsed = this.getDaysElapsed(position.createAt);
      const estimatedAPY = 0.35; // 35% estimated APY for liquidity provision
      
      // Simple compound interest calculation
      const profit = position.amount * (Math.pow(1 + estimatedAPY / 365, daysElapsed) - 1);
      
      return Math.max(0, profit); // Ensure non-negative profit
    } catch (error) {
      console.error("Error calculating UniswapV3 profit:", error);
      return 0;
    }
  }

  /**
   * Validates and applies default values for invest parameters
   */
  private validateAndApplyDefaults(params: UniswapV3InvestParams) {
    const fee = params.fee ?? UniswapV3AddLiquidity.DEFAULT_FEE;
    const slippage = params.slippage ?? UniswapV3AddLiquidity.DEFAULT_SLIPPAGE;
    const deadline = params.deadline ?? UniswapV3AddLiquidity.DEFAULT_DEADLINE;
    const tickLower = params.tickLower ?? UniswapV3AddLiquidity.FULL_RANGE_LOWER;
    const tickUpper = params.tickUpper ?? UniswapV3AddLiquidity.FULL_RANGE_UPPER;

    // Validate fee tier
    if (!UniswapV3AddLiquidity.SUPPORTED_FEES.includes(fee as any)) {
      throw new Error(`UniswapV3AddLiquidity: Unsupported fee tier ${fee}. Supported: ${UniswapV3AddLiquidity.SUPPORTED_FEES.join(', ')}`);
    }

    // Validate slippage
    if (slippage < 0 || slippage > 5000) { // Max 50% slippage
      throw new Error("UniswapV3AddLiquidity: Slippage must be between 0 and 5000 basis points");
    }

    // Validate tick range
    if (tickLower >= tickUpper) {
      throw new Error("UniswapV3AddLiquidity: tickLower must be less than tickUpper");
    }

    return {
      ...params,
      fee,
      slippage,
      deadline,
      tickLower,
      tickUpper,
      swapSlippage: params.swapSlippage ?? slippage,
    };
  }

  /**
   * Validates and applies default values for redeem parameters
   */
  private validateAndApplyRedeemDefaults(params: UniswapV3RedeemParams) {
    const slippage = params.slippage ?? UniswapV3AddLiquidity.DEFAULT_SLIPPAGE;
    const deadline = params.deadline ?? UniswapV3AddLiquidity.DEFAULT_DEADLINE;
    const liquidityPercent = params.liquidityPercent ?? 100;
    const collectFees = params.collectFees ?? true;
    const burnNFT = params.burnNFT ?? false;

    // Validate liquidity percentage
    if (liquidityPercent < 1 || liquidityPercent > 100) {
      throw new Error("UniswapV3AddLiquidity: liquidityPercent must be between 1 and 100");
    }

    // Use exact liquidity amount if provided, otherwise calculate from percentage
    const liquidityAmount = params.liquidityAmount ?? BigInt(0); // This would need to be calculated from the NFT position

    // Validate slippage
    if (slippage < 0 || slippage > 5000) {
      throw new Error("UniswapV3AddLiquidity: Slippage must be between 0 and 5000 basis points");
    }

    return {
      tokenId: params.tokenId,
      liquidityPercent,
      liquidityAmount,
      token0: params.token0,
      token1: params.token1,
      slippage,
      deadline,
      collectFees,
      burnNFT,
      convertToSingleToken: params.convertToSingleToken ?? false,
      outputToken: params.outputToken,
    };
  }

  /**
   * Validates if an address is a valid Ethereum address
   */
  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Calculates days elapsed since position creation
   */
  private getDaysElapsed(createAt: string): number {
    const creationDate = new Date(createAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - creationDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Fetches NFT position information from the blockchain
   */
  private async getNFTPositionInfo(tokenId: bigint): Promise<NFTPositionInfo> {
    const nftManager = this.getAddress("nftManager");
    
    // Create a public client for the current chain
    const publicClient = createPublicClient({
      chain: this.chainId === 1 ? mainnet : base,
      transport: http()
    });
    
    try {
      const positionData = await publicClient.readContract({
        address: nftManager,
        abi: NFT_MANAGER_ABI,
        functionName: 'positions',
        args: [tokenId]
      }) as [bigint, Address, Address, Address, number, number, number, bigint, bigint, bigint, bigint, bigint];
      
      return {
        tokenId,
        operator: positionData[1],
        token0: positionData[2],
        token1: positionData[3],
        fee: positionData[4],
        tickLower: positionData[5],
        tickUpper: positionData[6],
        liquidity: positionData[7],
        feeGrowthInside0LastX128: positionData[8],
        feeGrowthInside1LastX128: positionData[9],
        tokensOwed0: positionData[10],
        tokensOwed1: positionData[11]
      };
    } catch (error) {
      console.error("Error fetching NFT position info:", error);
      throw new Error(`Failed to fetch NFT position info for tokenId ${tokenId}`);
    }
  }
  
  /**
   * Calculates expected token amounts for a given liquidity amount
   */
  private async calculateExpectedAmounts(
    positionInfo: NFTPositionInfo,
    liquidityToRemove: bigint
  ): Promise<LiquidityAmounts> {
    // This is a simplified calculation. In a real implementation,
    // you would need to calculate the exact amounts based on current pool state
    // and tick math. For now, we'll use a basic proportional calculation.
    
    if (positionInfo.liquidity === BigInt(0)) {
      return { amount0: BigInt(0), amount1: BigInt(0) };
    }
    
    // Calculate the proportion of liquidity being removed
    const proportion = (liquidityToRemove * BigInt(1000000)) / positionInfo.liquidity;
    
    // For simplicity, estimate amounts based on liquidity proportion
    // In production, this would use proper tick math and pool state
    const estimatedAmount0 = (liquidityToRemove * BigInt(100)) / BigInt(1000000);
    const estimatedAmount1 = (liquidityToRemove * BigInt(100)) / BigInt(1000000);
    
    return {
      amount0: estimatedAmount0,
      amount1: estimatedAmount1
    };
  }
  
  /**
   * Calculates minimum amount0 with slippage protection
   */
  private async calculateMinAmount0(
    tokenId: bigint,
    liquidityAmount: bigint,
    slippage: number
  ): Promise<bigint> {
    try {
      const positionInfo = await this.getNFTPositionInfo(tokenId);
      const expectedAmounts = await this.calculateExpectedAmounts(positionInfo, liquidityAmount);
      return (expectedAmounts.amount0 * BigInt(10000 - slippage)) / BigInt(10000);
    } catch (error) {
      console.warn("Failed to calculate minimum amount0, using 0:", error);
      return BigInt(0);
    }
  }
  
  /**
   * Calculates minimum amount1 with slippage protection
   */
  private async calculateMinAmount1(
    tokenId: bigint,
    liquidityAmount: bigint,
    slippage: number
  ): Promise<bigint> {
    try {
      const positionInfo = await this.getNFTPositionInfo(tokenId);
      const expectedAmounts = await this.calculateExpectedAmounts(positionInfo, liquidityAmount);
      return (expectedAmounts.amount1 * BigInt(10000 - slippage)) / BigInt(10000);
    } catch (error) {
      console.warn("Failed to calculate minimum amount1, using 0:", error);
      return BigInt(0);
    }
  }
}
