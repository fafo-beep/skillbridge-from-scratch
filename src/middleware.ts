import { NextResponse, type NextRequest } from "next/server";

// Security headers for every response. The Content Security Policy
// uses a per-request nonce: Next.js reads the nonce from the request
// header and stamps it on every script it emits, so inline scripts
// an attacker injects do not run. Dev needs eval for hot reload.

const DEV = process.env.NODE_ENV !== "production";

export function middleware(req: NextRequest) {
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${DEV ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com https://www.facebook.com https://appleid.apple.com https://checkout.stripe.com",
    "frame-ancestors 'none'",
    DEV ? "" : "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  if (!DEV) res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  return res;
}

export const config = {
  matcher: [
    // Everything except Next's own static assets and public files.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|photos/|robots.txt|sitemap.xml).*)",
  ],
};
