
# BitTred - Secure Crypto Exchange (Bangla Version)

A production-ready cryptocurrency buy/sell web application built with React, Firebase, and Imgbb. This application is fully translated into **Bengali (Bangla)** and features a modern **Glassmorphism UI**.

## 🚀 Tech Stack

- **Frontend**: React 18 (SPA)
- **Styling**: TailwindCSS (Dark Neon Crypto Theme + Glassmorphism)
- **Auth & DB**: Firebase Authentication & Firestore
- **Storage**: Imgbb API (for audit-compliant screenshot hosting)
- **Language**: Bengali (Hind Siliguri Font)
- **Hosting**: Vercel (Recommended)

## 🛠️ Setup Guide (Local)

### 1. Prerequisites

- Node.js 18+
- A Firebase Project (Blaze plan recommended for external API calls, but Spark works for basic Firestore)
- An Imgbb Account (for API Key)

### 2. Installation

```bash
npm install
npm start
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
IMGBB_API_KEY=your_imgbb_key
```

---

## 📦 Deployment Guide: Manual Upload to GitHub & Vercel

If you do not want to use the command line, follow these steps to deploy your app to production.

### Step 1: Prepare the Files
1.  Download all the files generated for this project.
2.  Ensure you have a `package.json`. If not, run `npm init -y` and install dependencies (`react`, `react-dom`, `react-router-dom`, `firebase`, `lucide-react`, `tailwindcss`).
3.  *Optional*: If using a bundler like Vite (recommended), ensure your `vite.config.js` is set up.

### Step 2: Upload to GitHub (Manual Method)
1.  Go to **[GitHub.com](https://github.com)** and sign in.
2.  Click the **+** icon in the top right and select **New repository**.
3.  Name it `bittred-exchange` and click **Create repository**.
4.  Look for the link that says **"uploading an existing file"**.
5.  Drag and drop all your project files (excluding `node_modules` and `.env.local`) into the browser window.
6.  In the "Commit changes" box, type "Initial commit" and click **Commit changes**.

### Step 3: Connect to Vercel
1.  Go to **[Vercel.com](https://vercel.com)** and sign in (you can use your GitHub account).
2.  Click **"Add New..."** > **"Project"**.
3.  You will see your GitHub repositories. Find `bittred-exchange` and click **Import**.

### Step 4: Configure Environment Variables (Crucial)
**Do not skip this step.** Your app will not work without these keys.

1.  In the Vercel deployment screen, look for **"Environment Variables"**.
2.  Add the following keys (get values from your Firebase Console and Imgbb Dashboard):
    *   `NEXT_PUBLIC_FIREBASE_API_KEY` : (Your Firebase Web API Key)
    *   `FIREBASE_AUTH_DOMAIN` : (e.g., bittred.firebaseapp.com)
    *   `FIREBASE_PROJECT_ID` : (Your Project ID)
    *   `IMGBB_API_KEY` : (Your Imgbb API Key)
3.  Click **Add** for each one.

### Step 5: Deploy
1.  Click **Deploy**.
2.  Vercel will build your site. This takes about 1-2 minutes.
3.  Once complete, you will get a production URL (e.g., `https://bittred-exchange.vercel.app`).

---

## 🔒 Security & Production Rules

1.  **API Keys**: Never commit `.env` files or real keys to GitHub public repos. Always use Vercel Environment Variables.
2.  **Imgbb Security**:
    - The current React demo uploads images directly from the client.
    - **For High Security**: Use a Next.js API route or Firebase Cloud Function to proxy the upload so the `IMGBB_API_KEY` is never exposed to the browser.
3.  **Validation**: Admin must verify user payment screenshots against actual bank receipts before approving.
4.  **Audit Logs**: All critical actions (Buy, Sell, Approve, Reject) are logged to the `logs` collection in Firestore.

## 👤 Admin Setup (Initial Seed)

The default admin is **helo@gm.com**.

1.  Sign up via the live App's Signup page with `helo@gm.com`.
2.  Go to your **Firebase Console** > **Firestore Database**.
3.  Start a collection named `admins`.
4.  Add a Document:
    -   **Document ID**: (Auto ID is fine)
    -   **Field**: `email` (string) -> `helo@gm.com`
    -   **Field**: `role` (string) -> `super`
5.  Refresh your app, and the "অ্যাডমিন" (Admin) link will appear in the menu.

---
*Built for production. Fake details prohibited.*
