import type { Metadata } from "next";
import ResetForm from "@/components/ResetForm";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-4xl font-bold leading-tight">Set a new password</h1>
      <p className="mt-3 leading-relaxed">Choose a new password for your SkillBridge account.</p>
      <div className="mt-8">
        <ResetForm token={token} />
      </div>
    </div>
  );
}
