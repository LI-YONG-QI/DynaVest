# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Package Manager**: This project uses `pnpm` exclusively. All dependency management must use `pnpm`.

```bash
# Development
pnpm install          # Install dependencies
pnpm run dev         # Start development server with Turbopack
pnpm run build       # Build production version
pnpm run start       # Start production server
pnpm run lint        # Run ESLint

# The project enforces pnpm usage via preinstall script
```

**Environment Setup**: Check `env.example` for required environment variables before running the application.

# Design Principle
- Follow OCP principle, add / remove strategy will not break other strategy features
- Decouple and compatible each strategies from DeFi protocol
- Keep arguments are clear, reduce redundant config and over-design 

## Architecture Overview

### Core Strategy System

DynaVest implements a sophisticated DeFi strategy architecture built around the Strategy pattern:

**BaseStrategy Abstract Class** (`src/classes/strategies/baseStrategy.ts`):
- Defines the interface for all DeFi strategies
- Generic `BaseStrategy<T extends Protocol>` for type safety
- Required methods: `investCalls()`, `redeemCalls()`, `getProfit()`
- Returns `StrategyCall[]` arrays containing blockchain transaction data

**MultiStrategy Composition** (`src/classes/strategies/multiStrategy.ts`):
- Combines multiple strategies with percentage allocations
- Automatically splits investment amounts proportionally
- Maintains unified interface while coordinating multiple protocols

**Strategy Resolution System** (`src/hooks/useStrategy/strategyResolver.ts`):
- Handles parameter resolution and validation
- Merges compile-time configurations with runtime parameters
- Provides specialized handling for complex strategies (e.g., Uniswap V3 liquidity)
- Comprehensive validation, especially for liquidity management operations

**Configuration Management** (`src/utils/strategyConfig.ts`):
- `StrategyConfigFactory`: Creates default configurations
- `StrategyParameterResolver`: Merges defaults with runtime overrides
- `StrategyConfigRegistry`: Manages configurations with caching

### Application Architecture

**Provider Hierarchy** (in order):
1. PrivyProvider (authentication)
2. SmartWalletsProvider (account abstraction)
3. QueryClientProvider (TanStack Query)
4. WagmiProvider (blockchain interaction)
5. AssetsProvider (portfolio management)
6. ChatProvider (AI functionality)

**Core Contexts**:
- `AssetsContext`: Manages token balances, positions, portfolio value, and price tracking
- `ChatContext`: Handles AI chat functionality and message management

**Routing Structure**:
- `/` - Main chat interface for AI-powered DeFi interactions
- `/strategies` - Strategy discovery with filtering and search
- `/profile` - User portfolio and transaction history

### Blockchain Integration

**Multi-Chain Support**: Base, Arbitrum, Celo, Flow, BSC, Polygon via Alchemy
**Smart Wallet Integration**: Account abstraction with ZeroDev
**Supported Protocols**: AAVE V3, Uniswap V3, Morpho, Lido, Fluid

### Key Design Patterns

1. **Strategy Pattern**: Modular DeFi protocol implementations
2. **Composition Pattern**: MultiStrategy combines individual strategies
3. **Factory Pattern**: Dynamic strategy configuration creation
4. **Registry Pattern**: Centralized strategy configuration management
5. **Observer Pattern**: Real-time price and balance updates

## Working with Strategies

### Adding New Strategies

1. **Create Strategy Class**: Extend `BaseStrategy<ProtocolType>`
2. **Implement Required Methods**: `investCalls()`, `redeemCalls()`, `getProfit()`
3. **Add Configuration**: Update `StrategyConfigFactory` and types
4. **Register Protocol*: Add to protocol constants and metadata

### Strategy Parameters

**Investment Parameters**: Resolved through configuration system with runtime overrides
**Liquidity Strategies**: Require complex parameter validation (tokenId, liquidity amounts, token addresses)
**Error Handling**: Comprehensive validation with specific error messages for parameter issues

### Transaction Flow

1. Parameter resolution via `StrategyResolver`
2. Call generation through strategy `investCalls()`/`redeemCalls()`
3. Fee calculation and addition
4. Smart wallet batch execution
5. Position tracking and database updates

## Component Organization

**UI Components** (`src/components/`):
- Organized by feature (Profile, StrategyList, Chatroom)
- Atomic design principles with ui/ directory for primitives
- Extensive use of Radix UI components with custom styling

**Message System** (`src/classes/message/`):
- Typed message classes for different AI response types
- Handles investment forms, portfolio data, and strategy recommendations

**Asset Management**:
- Real-time price tracking with batch queries
- Portfolio profit/loss calculations
- Multi-chain balance aggregation

## Important Implementation Notes

### Type Safety

- Extensive use of TypeScript generics for protocol type safety
- Runtime parameter validation for complex operations
- Strongly typed configuration interfaces

### Error Handling

- Specific error messages for different failure scenarios
- Parameter validation before transaction execution
- Graceful handling of blockchain interaction failures

### Performance Considerations

- Configuration caching in registry pattern
- Batch token price queries
- Smart wallet transaction batching
- Lazy loading of strategy configurations

### Multi-Chain Considerations

- Chain-specific contract addresses in protocol definitions
- Cross-chain balance aggregation
- Network switching through smart wallet integration

## Development Workflow

When implementing new features:
1. Start with type definitions in `src/types/`
2. Implement business logic in `src/classes/` or `src/utils/`
3. Create React hooks in `src/hooks/` for component integration
4. Build UI components following existing patterns
5. Add comprehensive error handling and validation

The codebase emphasizes modularity, type safety, and clear separation between DeFi protocol logic and user interface concerns.

## Potential Improvements

### Strategy Refactoring Plan
- Analyze current strategy feature implementations
- Create a more flexible strategy architecture that can handle diverse protocol requirements
- Develop a generalized parameter resolution mechanism
- Implement strategy-specific configuration validators
- Ensure type safety and runtime parameter validation
- Design a more adaptable strategy composition system that can handle varying strategy argument structures


# References

## DeFi Protocols
Below is integrated protocols documents:
- Morpho: https://docs.morpho.org/overview/
- Uniswap: https://docs.uniswap.org/

## Libraries
- Viem: https://viem.sh/
- Wagmi: https://wagmi.sh/
- Privy: https://docs.privy.io/basics/get-started/about

Must inspect source of protocol documents before integrate with strategy class