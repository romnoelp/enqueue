import { createAuthClient } from "better-auth/client";
const authClient = createAuthClient();

const signIn = async () => {
  const data = await authClient.signIn.social({
    provider: "google",
    callbackURL: "/employees",
    errorCallbackURL: "/error",
    // newUserCallbackURL: "/welcome",
  });
};

export default signIn;
