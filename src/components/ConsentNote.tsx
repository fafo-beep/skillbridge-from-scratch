import Link from "next/link";

export default function ConsentNote({ action = "signing up" }: { action?: string }) {
  const link = "font-semibold text-primary underline underline-offset-4";
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      By {action}, you agree to our{" "}
      <Link href="/terms" className={link}>Terms</Link>,{" "}
      <Link href="/acceptable-use" className={link}>Acceptable Use</Link>, and{" "}
      <Link href="/privacy" className={link}>Privacy Policy</Link>.
    </p>
  );
}
