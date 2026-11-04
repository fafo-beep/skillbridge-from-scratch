import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import Link from "next/link";
import { CATEGORIES, COURSES } from "@/lib/catalog";
import { oauthProviders } from "@/auth";
import AuthLauncher from "@/components/AuthLauncher";
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
        <form action="/catalog" className="relative hidden flex-1 max-w-md sm:block">
          <label htmlFor="site-search" className="sr-only">
            Search courses
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="What do you want credit for?"
            className="h-11 w-full rounded-full border border-border bg-background pl-5 pr-14 text-sm placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-accent active:translate-y-[calc(-50%+1px)]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
        </form>
        <nav className="flex items-center gap-5 text-sm font-semibold">
          <Link href="/catalog" className="hover:text-primary">
            Catalog
          </Link>
          <Link href="/dashboard" className="hover:text-primary">
            My learning
          </Link>
          <AuthLauncher providers={[...oauthProviders]} />
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-accent text-accent-foreground">
      <div className="mx-auto max-w-6xl overflow-hidden px-6 pb-8 pt-16">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-3">
          <nav aria-label="Explore">
            <p className="font-bold">Explore</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/catalog" className="hover:underline">Course catalog</Link></li>
              <li><Link href="/dashboard" className="hover:underline">My learning</Link></li>
              <li><Link href="/catalog" className="hover:underline">Start a credit check</Link></li>
            </ul>
          </nav>
          <nav aria-label="Fields">
            <p className="font-bold">Fields</p>
            <ul className="mt-3 space-y-2 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/catalog?category=${c.slug}`} className="hover:underline">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Pathways">
            <p className="font-bold">Pathways</p>
            <ul className="mt-3 space-y-2 text-sm">
              {COURSES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/courses/${c.slug}`} className="hover:underline">
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-14 select-none text-[14vw] font-bold leading-none tracking-tight lg:text-[150px]" aria-hidden="true">
          SkillBridge
        </p>
        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-3 text-sm">
          <p>Courses, and credit for what you already know.</p>
          <p>Only colleges award credit — check your school&apos;s PLA policy.</p>
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
