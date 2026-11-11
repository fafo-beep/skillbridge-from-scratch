import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { normalizeVerifyCode } from "@/lib/credential";

export const metadata: Metadata = {
  title: "Verify a credit recommendation",
  description: "Confirm that a SkillBridge credit recommendation is genuine by entering the verification code printed on it.",
};

// Where a registrar lands without a code: a single field. The code is
// printed on the first and last page of every approved recommendation.
async function lookUp(formData: FormData) {
  "use server";
  const code = normalizeVerifyCode(String(formData.get("code") ?? ""));
  redirect(code ? `/credential/${code}` : "/credential?invalid=1");
}

export default async function CredentialLookupPage({ searchParams }: { searchParams: Promise<{ invalid?: string }> }) {
  const { invalid } = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-6 py-14">
      <p className="text-sm font-semibold text-muted-foreground">For registrars and prior learning offices</p>
      <h1 className="mt-1 text-4xl font-bold leading-tight">Verify a credit recommendation</h1>
      <p className="mt-4 leading-relaxed">
        Every approved recommendation carries a sixteen-character verification code, printed under the decision on its first page and again in the footer. Enter it here to confirm the document is genuine and unchanged.
      </p>
      <form action={lookUp} className="mt-8">
        <label htmlFor="code" className="mb-1.5 block text-sm font-semibold">Verification code</label>
        <input
          id="code"
          name="code"
          required
          autoComplete="off"
          spellCheck={false}
          placeholder="ABCD-EFGH-JKMN-PQRS"
          className="h-12 w-full rounded-md border border-border bg-background px-4 font-semibold uppercase tracking-wider placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground"
        />
        {invalid && (
          <p role="alert" className="mt-2 text-sm font-semibold text-destructive">
            That is not a valid code. It has sixteen letters and digits, with no O, I or L.
          </p>
        )}
        <button className="mt-4 h-12 w-full rounded-md bg-primary font-semibold text-primary-foreground hover:bg-accent active:translate-y-px">
          Check the Code
        </button>
      </form>
      <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
        SkillBridge records a faculty evaluator&apos;s recommendation against stated course outcomes. Only the receiving college awards credit, under its own prior learning policy.
      </p>
    </div>
  );
}
