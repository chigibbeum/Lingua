# Firebase SDK Guidelines

Your analysis is correct. The project uses two distinct strategies for credential loading, which is a security best practice.

---

## 1. Client SDK (Public)

**Source:** `src/lib/firebase/client.ts`

- **Credentials:** Uses public configuration values (`apiKey`, `authDomain`, etc.) loaded from your `.env` file via `import.meta.env.VITE_LINGUA_FIREBASE_*`.
- **Mechanism:** These are bundled into the client-side JavaScript. They are public and intended to be exposed.
- **Access Control:** Security is enforced by **Firestore Security Rules** and **Storage Security Rules** on the server side, not by hiding these keys.

---

## 2. Admin SDK (Privileged)

**Source:** `src/lib/firebase/admin.ts`

- **Credentials:** Uses **Application Default Credentials (ADC)**. It does not use a private key string or JSON file path from your `.env`.
- **Mechanism:**
  - **Local Development:** You must authenticate via the CLI command `gcloud auth application-default login`. This places a credential file in a well-known location on your machine that the SDK automatically discovers.
  - **Production (Cloud Run):** The code automatically acquires credentials from the metadata server of the service account attached to the Cloud Run instance.
- **Why this way?** This avoids managing long-lived service account keys (JSON files) which are a security risk if leaked.
- **Configuration vs. Auth:** While it doesn't get _credentials_ from `.env`, it does get _configuration_ from there (like `FIREBASE_PROJECT_ID` and bucket names) to know _which_ project to connect to.

---

## Summary Table

| SDK    | Scope               | Auth Source                     | Config Source                |
| ------ | ------------------- | ------------------------------- | ---------------------------- |
| Client | Browser / Public    | Public API Key (`.env`)         | `.env` (`VITE_*`)            |
| Admin  | Server / Privileged | ADC (gcloud or Metadata Server) | `.env` (Project ID, Buckets) |

---

## To Fix Local Admin Issues

If you are seeing errors locally, ensure you have run:

```bash
gcloud auth application-default login
```

And make sure your `.env` has the correct `FIREBASE_PROJECT_ID` matching that login.

---

## Required Environment Variables

### For Client SDK (`.env`)

These variables are **required** for the client-side Firebase SDK:

```env
VITE_LINGUA_FIREBASE_API_KEY=your-api-key
VITE_LINGUA_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_LINGUA_FIREBASE_PROJECT_ID=your-project-id
VITE_LINGUA_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_LINGUA_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_LINGUA_FIREBASE_APP_ID=your-app-id
```

### For Admin SDK (`.env`)

These variables are **required** for the server-side Firebase Admin SDK:

```env
FIREBASE_PROJECT_ID=your-project-id
GCS_USER_UPLOADS_BUCKET=your-uploads-bucket
GCS_BRANDING_BUCKET=your-branding-bucket
```

### Variables to REMOVE (No Longer Used)

If you have any of these legacy variables, they are no longer needed:

```env
# REMOVE THESE - Admin SDK now uses ADC instead:
# FIREBASE_ADMIN_CREDENTIALS_JSON=...
# FIREBASE_ADMIN_CREDENTIALS_PATH=...
# FIREBASE_ADMIN_CREDENTIALS=...
# GOOGLE_APPLICATION_CREDENTIALS=...
```
