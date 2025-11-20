# Firestore Database Schema

## Collections

### `users`
Stores minimal user profile data.
```json
{
  "uid": "string (firebase auth uid)",
  "email": "string",
  "displayName": "string",
  "createdAt": "number (timestamp)"
}
```

### `coins`
List of supported cryptocurrencies.
```json
{
  "id": "btc",
  "coinName": "Bitcoin",
  "symbol": "BTC",
  "price": 64000.50,
  "available": true,
  "updatedAt": 1715000000
}
```

### `buyRequests`
Records of users buying crypto from the platform.
```json
{
  "id": "auto-id",
  "userId": "string",
  "userEmail": "string",
  "coinId": "btc",
  "amount": 0.5,
  "totalPrice": 32000.25,
  "paymentMethod": "Bank Transfer",
  "paymentNumber": "+123456789",
  "userScreenshotURL": "https://i.ibb.co/...",
  "adminScreenshotURL": "https://i.ibb.co/... (added on approval)",
  "status": "pending | approved | rejected",
  "timestamp": 1715000000
}
```

### `sellRequests`
Records of users selling crypto to the platform.
```json
{
  "id": "auto-id",
  "userId": "string",
  "coinId": "eth",
  "amount": 2.0,
  "totalPrice": 5000.00,
  "walletAddress": "0x123...",
  "userScreenshotURL": "string",
  "status": "pending | approved | rejected",
  "timestamp": 1715000000
}
```

### `admins`
Whitelist of admin emails.
```json
{
  "email": "helo@gm.com",
  "role": "super",
  "createdAt": 1715000000
}
```

### `logs`
Audit trail.
```json
{
  "actorEmail": "admin@bittred.com",
  "actionType": "APPROVE_BUY",
  "detail": "Approved order ID 123",
  "timestamp": 1715000000
}
```
