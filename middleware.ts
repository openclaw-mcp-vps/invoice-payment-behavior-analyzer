import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "invoice_behavior_paid";

export function middleware(request: NextRequest): NextResponse {
  const hasAccess = request.cookies.get(ACCESS_COOKIE)?.value === "active";

  if (!hasAccess) {
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("paywall", "1");
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*"]
};
