import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
    // True between the password step and the authenticator step.
    mfaPending?: boolean;
    pendingUserId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    sv?: number;
    mfa?: "none" | "pending" | "ok";
  }
}
