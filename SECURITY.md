# Security & Production Checklist

## 1. Environment Variables
- [ ] Ensure `IMGBB_API_KEY` is NOT prefixed with `NEXT_PUBLIC_` (unless you accept client-side exposure risks).
- [ ] Set proper `.env` values in Vercel, not in code.

## 2. Firebase Rules (firestore.rules)
Deploy strict rules to prevent unauthorized access.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User Profiles: Users can read/write only their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Coins: Public read, Admin write
    match /coins/{coinId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Requests: Users create, Users read own, Admins read/write all
    match /buyRequests/{reqId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || isAdmin());
      allow update: if isAdmin();
    }
    
    match /sellRequests/{reqId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || isAdmin());
      allow update: if isAdmin();
    }

    // Admins: Read-only for authenticated users (to check own role), Write denied (console only)
    match /admins/{docId} {
      allow read: if request.auth != null;
      allow write: if false; 
    }
    
    // Logs: Admin only
    match /logs/{logId} {
      allow read: if isAdmin();
      allow create: if request.auth != null; // Users log their own creation events (secured via Cloud Functions ideally)
    }

    function isAdmin() {
      return request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email)); // Note: this requires document ID to be the email
    }
  }
}
```

## 3. Identity Verification
- [ ] The app warns users "Fake details prohibited".
- [ ] Admin must strictly enforce this by rejecting requests with suspicious names or mismatched payment numbers.

## 4. Image Hosting
- [ ] Imgbb is used to offload storage. Ensure the API key has sufficient credits.
- [ ] Images are public links. Do not upload sensitive ID documents (Passport/SSN) via this channel.
