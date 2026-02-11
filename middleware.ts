import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_PREFIXES = ["/dashboard", "/user", "/admin"];
const REDIRECT_IF_AUTHENTICATED = ["/", "/auth/login"];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const isProtected = startsWithAny(pathname, PROTECTED_PREFIXES);
  const shouldRedirectAuthed = REDIRECT_IF_AUTHENTICATED.includes(pathname);

  // If logged in and user goes back to home/login -> send to dashboard
  if (isLoggedIn && shouldRedirectAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // If not logged in and trying protected route -> send login with callbackUrl
  if (!isLoggedIn && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth/login",
    "/dashboard/:path*",
    "/user/:path*",
    "/admin/:path*",
  ],
};
