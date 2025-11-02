import NextAuth from "next-auth";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { cert } from "firebase-admin/app";
import authConfig from "@/auth.config";

const projectId =
  process.env.FIREBASE_PROJECT_ID || process.env.AUTH_FIREBASE_PROJECT_ID;
const clientEmail =
  process.env.FIREBASE_CLIENT_EMAIL || process.env.AUTH_FIREBASE_CLIENT_EMAIL;
let privateKey =
  process.env.FIREBASE_PRIVATE_KEY || process.env.AUTH_FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "Firebase credentials for Auth.js are missing. Set FIREBASE_* or AUTH_FIREBASE_* env vars."
  );
}

if (privateKey.includes("\\n")) {
  privateKey = privateKey.replace(/\\n/g, "\n");
}

// Full Auth.js instance with Firebase adapter
// Used in API routes and server components (Node.js runtime)
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: FirestoreAdapter({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  }),
  // Use JWT strategy to avoid database calls in edge runtime
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (session.user && token?.sub) {
        (session.user as { id?: string }).id = token.sub;
      }

      return session;
    },
  },
});
