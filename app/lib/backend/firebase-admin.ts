import * as admin from "firebase-admin";

const projectId = process.env.AUTH_FIREBASE_PROJECT_ID;
const clientEmail = process.env.AUTH_FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.AUTH_FIREBASE_PRIVATE_KEY;
const resolvedDatabaseURL =
  process.env.FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "Firebase Admin credentials are missing. Check AUTH_FIREBASE_* env vars."
  );
}

if (!resolvedDatabaseURL) {
  throw new Error(
    "Firebase Realtime Database URL is missing. Set FIREBASE_DATABASE_URL."
  );
}

const existingApp = admin.apps.find(
  (firebaseApp) => firebaseApp?.name === "enqueue-admin"
);

const app =
  existingApp ||
  admin.initializeApp(
    {
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
      databaseURL: resolvedDatabaseURL,
    },
    "enqueue-admin"
  );

// Export services (auth handled by Better Auth)
export const adminAuth = app.auth();
export const realtimeDb = app.database(resolvedDatabaseURL);
export const firestoreDb = app.firestore();
export const fcm = app.messaging();
