import NextAuth from "next-auth"
import authConfig from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (session.user && token?.sub) {
        (session.user as { id?: string }).id = token.sub;
      }

      const googleIdToken = (token as typeof token & { googleIdToken?: string }).googleIdToken;
      if (googleIdToken) {
        (session as typeof session & { googleIdToken?: string }).googleIdToken = googleIdToken;
      }

      return session;
    },
  },
})