// Deprecated shim: keep this module path working, but avoid a second Auth.js instance.
// The canonical NextAuth instance lives at the project root in `auth.ts`.
export { handlers, auth, signIn, signOut } from "@/auth";
