# Canonical API Contract Reference

**Repository:** `crypto-omnichain-tracker-web` (Mirror of canonical backend contract)  
**Contract Version:** 1.1.0  
**Ownership:** Backend (`crypto-omnichain-tracker-api`) owns the canonical specification.  
**Implementation Status:** Active — Transaction Story (ERC-20 transfers, approvals, deterministic narrative, and status reconciliation).

---

## 1. Migration & Evolution Notes (v1.0.0 -> v1.1.0)

> [!WARNING]
> **Consumer Changes:**
>
> 1. **Nullable Timestamp:** `data.timestamp` is typed as `string | null`.
> 2. **Status 'unknown':** `data.status` includes `'unknown'` alongside `'confirmed'`, `'failed'`, and `'pending'`.
> 3. **Search History Separation:** In `GET /v1/history`, `txStatus` is introduced as `'confirmed' | 'failed' | 'pending' | 'unknown'`. Older history records default to `'unknown'`.

---

## 2. Supported EVM Chains

| Enum Value | Network Name     | Native Symbol | Expected Chain ID |
| :--------- | :--------------- | :------------ | :---------------- |
| `ethereum` | Ethereum Mainnet | ETH           | 1 (`0x1`)         |
| `bsc`      | BNB Smart Chain  | BNB           | 56 (`0x38`)       |
| `polygon`  | Polygon PoS      | POL (MATIC)   | 137 (`0x89`)      |

---

## 3. Transaction Lookup Endpoint

### `POST /v1/transactions/lookup`

```json
{
  "data": {
    "transactionHash": "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "chain": "ethereum",
    "status": "confirmed",
    "from": "0x1234567890abcdef1234567890abcdef12345678",
    "to": "0xabcdef1234567890abcdef1234567890abcdef12",
    "value": {
      "raw": "1500000000000000000",
      "formatted": "1.5",
      "symbol": "ETH"
    },
    "fee": {
      "raw": "2100000000000000",
      "formatted": "0.0021",
      "symbol": "ETH"
    },
    "blockNumber": "12345678",
    "timestamp": "2026-09-06T05:00:00.000Z",
    "explorerUrl": "https://etherscan.io/tx/0x0123...",
    "fetchedAt": "2026-09-23T14:40:00.000Z",
    "explanation": "Transferred 1.5 ETH from 0x1234... to 0xabcd....",
    "coverage": "complete",
    "coverageReasons": [],
    "actions": [],
    "tokenTransfers": [],
    "approvals": []
  },
  "meta": {
    "requestId": "c1f516d0-a35b-4c27-91fa-bf1447dbb13b",
    "cache": {
      "hit": false
    }
  }
}
```

---

## 4. History Endpoint

### `GET /v1/history`

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "transactionHash": "0x0123...",
      "chain": "ethereum",
      "outcome": "success",
      "txStatus": "confirmed",
      "cacheHit": true,
      "searchedAt": "2026-09-23T14:40:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "sessionId": "a8f5..."
  }
}
```
