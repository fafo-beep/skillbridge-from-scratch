import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "SkillBridge — Courses and credit for what you already know",
    template: "%s · SkillBridge",
  },
  description:
    "Career courses with a difference: every pathway can also recognize the experience you already have, through Prior Learning Assessment. Learn what's new, get credit for what isn't.",
  openGraph: {
    type: "website",
    siteName: "SkillBridge",
  },
};

function Header() {
  return (
    <header className="bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          SkillBridge
        </Link>
        <form action="/catalog" className="hidden flex-1 max-w-md sm:block">
          <label htmlFor="site-search" className="sr-only">
            Search courses
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="What do you want credit for?"
            className="h-10 w-full rounded-md border border-border bg-background px-4 text-sm placeholder:text-muted-foreground"
          />
        </form>
        <nav className="flex items-center gap-5 text-sm font-semibold">
          <Link href="/catalog" className="hover:text-primary">
            Catalog
          </Link>
          <Link href="/dashboard" className="hover:text-primary">
            My learning
          </Link>
          <Link
            href="/catalog"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-accent active:translate-y-px"
          >
            Join free
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-accent text-accent-foreground">
      <div className="mx-auto max-w-6xl overflow-hidden px-6 pb-8 pt-14">
        <p className="select-none text-[14vw] font-bold leading-none tracking-tight lg:text-[150px]" aria-hidden="true">
          SkillBridge
        </p>
        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-3 text-sm">
          <p>Courses, and credit for what you already know.</p>
          <nav className="flex gap-5 font-semibold">
            <Link href="/catalog" className="underline underline-offset-4">
              Catalog
            </Link>
            <Link href="/dashboard" className="underline underline-offset-4">
              My learning
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sourceSans.variable}>
      <body className="flex min-h-svh flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
