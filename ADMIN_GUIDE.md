# BitTred Admin Guide

## Accessing the Panel
Login with an account that has been added to the `admins` Firestore collection.
Navigate to `/admin`.

## Managing Transactions

### 1. Buy Requests
- **Review**: Check the `amount`, `totalPrice`, and the `paymentNumber`.
- **Verify**: Click "View User Proof" to open their payment screenshot in a new tab.
- **Validate**: Check your bank/wallet records to confirm receipt of funds from that number.
- **Action**:
    - **Approve**: Click Approve. You *must* upload a screenshot (e.g., of the coin transfer to their wallet note or internal ledger update).
    - **Reject**: Click Reject if funds were not received or details are fake. This is final.

### 2. Sell Requests
- **Review**: Check the `walletAddress` where the user wants to receive money.
- **Process**: Send the fiat currency to their provided details.
- **Action**:
    - **Approve**: Upload a screenshot of your bank transfer to them as proof.
    - **Reject**: If the crypto transfer to the platform wallet was never received.

## Data Export
Click the "Export CSV" button in the sidebar to download a full history of all transactions for accounting purposes.

## Site Settings
Currently, coin prices are updated directly in the Firestore `coins` collection.
- To update a price: Go to Firestore Console > `coins` > [coin_id] > Update `price` field.
- The frontend updates automatically via `fetchCoins` (refresh required in current version, real-time listener recommended for v2).

## Troubleshooting
- **Image Upload Fails**: Check if the Imgbb API Key is valid or if the daily limit is reached.
- **Auth Errors**: Ensure the user's email is exactly matching the one in the `admins` collection.
