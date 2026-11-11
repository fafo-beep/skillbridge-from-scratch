import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import { acceptInviteSignedIn } from "@/lib/actions";
import InviteAcceptForm from "@/components/InviteAcceptForm";

export const metadata: Metadata = { title: "Invitation" };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = dbConfigured ? await db.invite.findUnique({ where: { token } }) : null;
  const valid = invite && !invite.acceptedAt && invite.expiresAt > new Date();
  const session = dbConfigured ? await auth() : null;
  const me = session?.user?.id ? await db.user.findUnique({ where: { id: session.user.id } }) : null;
  const roleName = invite?.role === "ADMIN" ? "admin" : "evaluator";

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      {!valid ? (
        <>
          <h1 className="text-4xl font-bold leading-tight">This invitation is no longer valid</h1>
          <p className="mt-3 leading-relaxed">Ask the SkillBridge admin who invited you for a new link.</p>
        </>
      ) : me && me.email === invite.email ? (
        <>
          <h1 className="text-4xl font-bold leading-tight">You&apos;re invited as an {roleName}</h1>
          <p className="mt-3 leading-relaxed">Accept to add the {roleName} role to your existing account ({me.email}).</p>
          <form action={acceptInviteSignedIn.bind(null, token)} className="mt-8">
            <button className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px">
              Accept Invitation
            </button>
          </form>
        </>
      ) : me ? (
        <>
          <h1 className="text-4xl font-bold leading-tight">Wrong account</h1>
          <p className="mt-3 leading-relaxed">
            This invitation is for {invite.email}, but you are signed in as {me.email}. Sign out and open the link again.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold leading-tight">You&apos;re invited as an {roleName}</h1>
          <p className="mt-3 leading-relaxed">
            Create your SkillBridge {roleName} account for <span className="font-semibold">{invite.email}</span>.
          </p>
          <div className="mt-8"><InviteAcceptForm token={token} /></div>
          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account with this email?{" "}
            <Link href="/signin" className="font-semibold text-primary hover:text-accent">Sign In</Link>, then open this link again.
          </p>
        </>
      )}
    </div>
  );
}
