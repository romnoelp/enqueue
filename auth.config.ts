import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

// Edge-compatible config (no database adapter)
// Used in proxy.ts middleware which runs on edge runtime
export default {
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "select_account",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        // Only allow verified @neu.edu.ph emails
        return !!(profile?.email_verified && profile?.email?.endsWith("@neu.edu.ph"))
      }
      return true // Do different verification for other providers
    },
    async jwt({ token, account }) {
      // Persist the Google ID token so the client can exchange it for a Firebase ID token.
      if (account?.provider === "google" && account.id_token) {
        (token as typeof token & { googleIdToken?: string }).googleIdToken = account.id_token
      }
      return token
    },
  },
} satisfies NextAuthConfig
