# Migration & Seeding

Since this is a client-side app, the safest way to seed the database is to use a temporary script or the Firebase Console.

## 1. Create Initial Admin (Crucial)

1.  Go to Firebase Console > Authentication.
2.  Create a user with email: `helo@gm.com` and a password.
3.  Go to Firestore Database.
4.  Start collection `admins`.
5.  Add Document:
    -   **Document ID**: (Leave Auto-ID OR use `helo@gm.com` for easier rules matching)
    -   **Field**: `email` (string) = `helo@gm.com`
    -   **Field**: `role` (string) = `super`

## 2. Seed Coins (Script)

You can run this code snippet in your browser console while on the `localhost` version of the app (since `db` service is exposed in the bundle, or temporarily import this function in `Home.tsx` inside a `useEffect`).

```javascript
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase'; // Adjust import path

const seedCoins = async () => {
  const coins = [
    { id: 'btc', coinName: 'Bitcoin', symbol: 'BTC', price: 64230.50, available: true },
    { id: 'eth', coinName: 'Ethereum', symbol: 'ETH', price: 3450.12, available: true },
    { id: 'usdt', coinName: 'Tether', symbol: 'USDT', price: 1.00, available: true },
    { id: 'sol', coinName: 'Solana', symbol: 'SOL', price: 145.20, available: true },
    { id: 'bnb', coinName: 'Binance Coin', symbol: 'BNB', price: 590.00, available: true },
  ];

  for (const coin of coins) {
    // Using setDoc with specific ID to ensure clean URLs/references
    await setDoc(doc(db, 'coins', coin.id), {
      ...coin,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    console.log(`Seeded ${coin.coinName}`);
  }
};

// Execute
seedCoins();
```

## 3. Seed Site Settings

Create a collection `siteSettings` -> document `general`:

```json
{
  "currency": "USD",
  "paymentMethods": ["Bank Transfer", "PayPal", "Wise", "Crypto Transfer"],
  "fees": 0.5,
  "minimumBuy": 10
}
```
