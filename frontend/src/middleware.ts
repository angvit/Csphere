import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const authPagePaths = ["/login"];
  const protectedPaths = ["/home", "/setting", "/profile"];

  const pathname = request.nextUrl.pathname;

  const isAuthPage = authPagePaths.some((path) => pathname.startsWith(path));
  const isProtectedPage = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/dashboard/:path*",
    "/login",
    "/setting",
    "/profile",
  ],
};
