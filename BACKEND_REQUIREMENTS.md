# Backend Requirements for Position Metadata Storage

## Overview
The backend needs to support enhanced position metadata storage to enable proper redemption of complex DeFi strategies, particularly UniswapV3 NFT positions. This document outlines the database schema changes and API modifications required.

## Database Schema Changes

### Position Table Enhancement
The existing `Position` table needs to be enhanced with a `metadata` field to store strategy-specific data:

```sql
ALTER TABLE positions ADD COLUMN metadata JSONB;
```

### Position Metadata Structure
The `metadata` field should store JSON objects with the following structure based on strategy type:

#### UniswapV3AddLiquidity Strategy
```json
{
  "nftTokenId": "string",           // NFT token ID from Uniswap V3 position
  "token0": "string",               // Address of token0 in the pair
  "token1": "string",               // Address of token1 in the pair
  "fee": "number",                  // Fee tier (500, 3000, 10000)
  "liquidityAmount": "string",      // Liquidity amount as string (BigInt)
  "tickLower": "number",            // Lower tick of the position
  "tickUpper": "number"             // Upper tick of the position
}
```

#### Other Strategy Types
```json
{
  // Strategy-specific metadata as key-value pairs
  // Structure depends on strategy requirements
}
```

## API Modifications

### Position Creation/Update Endpoint
**Endpoint:** `POST /position` and `PATCH /positions/{id}`

**Enhanced Request Body:**
```json
{
  "address": "string",
  "amount": "number",
  "token_name": "string",
  "chain_id": "number",
  "strategy": "string",
  "metadata": {
    // Strategy-specific metadata object
  }
}
```

### Position Retrieval Endpoint
**Endpoint:** `GET /positions/{address}`

**Enhanced Response:**
```json
[
  {
    "id": "string",
    "address": "string",
    "amount": "number",
    "token_name": "string",
    "chain_id": "number",
    "strategy": "string",
    "status": "string",
    "metadata": {
      // Strategy-specific metadata object
    }
  }
]
```

## Required Backend Changes

### 1. Database Migration
- Add `metadata` JSONB column to positions table
- Create indexes on commonly queried metadata fields if needed:
  ```sql
  CREATE INDEX idx_positions_metadata_nft_token_id 
  ON positions USING gin ((metadata->>'nftTokenId'));
  ```

### 2. API Controller Updates
- Update position creation logic to accept and store metadata
- Update position retrieval to include metadata in responses
- Add validation for metadata structure based on strategy type

### 3. Data Validation
Implement validation rules for metadata based on strategy:

#### UniswapV3AddLiquidity
- `nftTokenId`: Required string (represents BigInt)
- `token0`: Required valid Ethereum address
- `token1`: Required valid Ethereum address
- `fee`: Required number (500, 3000, or 10000)
- `liquidityAmount`: Optional string (represents BigInt)
- `tickLower`: Optional number (default: -887220)
- `tickUpper`: Optional number (default: 887220)

### 4. Error Handling
- Return appropriate error messages for invalid metadata
- Handle cases where metadata is missing for strategies that require it
- Gracefully handle legacy positions without metadata

## Example Implementation

### Position Model (Example in TypeScript/Prisma)
```typescript
model Position {
  id          String   @id @default(cuid())
  address     String
  amount      Float
  token_name  String
  chain_id    Int
  strategy    String
  status      String
  metadata    Json?    // JSONB field for strategy-specific data
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
}
```

### API Route Handler (Example)
```typescript
// POST /position
async function createPosition(req: Request, res: Response) {
  const { address, amount, token_name, chain_id, strategy, metadata } = req.body;
  
  // Validate metadata based on strategy
  if (strategy === 'UniswapV3AddLiquidity') {
    validateUniswapV3Metadata(metadata);
  }
  
  const position = await prisma.position.create({
    data: {
      address,
      amount,
      token_name,
      chain_id,
      strategy,
      metadata,
    },
  });
  
  return res.json(position);
}
```

## Data Migration Strategy

### For Existing Positions
1. Set metadata to `null` for all existing positions
2. Add migration script to populate metadata for positions that can be reconstructed
3. Add warning system for positions that cannot be redeemed due to missing metadata

### For New Positions
1. All new positions must include metadata when applicable
2. Frontend validation should ensure required metadata is provided before submission

## Security Considerations
- Validate all metadata fields to prevent injection attacks
- Ensure metadata size limits to prevent database bloat
- Sanitize all string fields in metadata before storage

## Testing Requirements
- Unit tests for metadata validation
- Integration tests for position creation/retrieval with metadata
- Migration tests for existing data
- Performance tests for metadata queries

## Monitoring and Logging
- Log metadata validation failures
- Monitor metadata field usage patterns
- Track positions that fail redemption due to missing metadata