import { NextRequest, NextResponse } from "next/server";

// Domains that are NOT tenant subdomains (don't rewrite)
const ROOT_DOMAINS = ["axonmenu.com", "localhost", "vercel.app"];
const RESERVED_PATHS = ["/api", "/_next", "/favicon.ico", "/images", "/icons"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip reserved Next.js internals and static assets
  if (RESERVED_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const hostname = request.headers.get("host") ?? "";

  // Strip port in development (e.g., localhost:3000 → localhost)
  const hostWithoutPort = hostname.split(":")[0];

  // Check if this is a known root domain — if so, serve the root app normally
  const isRootDomain = ROOT_DOMAINS.some(
    (domain) => hostWithoutPort === domain || hostWithoutPort.endsWith(`.${domain}`)
  );

  if (!isRootDomain) {
    // Custom domain — treat the whole hostname as a potential slug lookup
    // e.g., lanchonete-sp.com → rewrite to /[slug] using the hostname
    const url = request.nextUrl.clone();
    url.pathname = `/${hostWithoutPort}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // Extract subdomain from axonmenu.com (e.g., lanchonete.axonmenu.com)
  const subdomain = extractSubdomain(hostWithoutPort);

  if (subdomain) {
    const url = request.nextUrl.clone();
    // Rewrite to /[slug] route while keeping the original URL in the browser
    url.pathname = `/${subdomain}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // Root domain — serve normally
  return NextResponse.next();
}

function extractSubdomain(hostname: string): string | null {
  // Remove "www." prefix if present
  const clean = hostname.replace(/^www\./, "");
  const parts = clean.split(".");

  // A subdomain exists when there are 3+ parts, e.g. ["lanchonete", "axonmenu", "com"]
  if (parts.length >= 3) {
    return parts[0];
  }
  return null;
}

export default proxy;

export const config = {
  // Match all paths except Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
