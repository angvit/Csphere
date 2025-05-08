import { match } from "assert";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  const isHomePage = request.nextUrl.pathname.startsWith("/home");

  if (!token && isHomePage) {
    return NextResponse.redirect(new URL("/login", request.url));
  } else if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/home", request.url));
  }
  // } else if (token) {
  //   return NextResponse.redirect(new URL("/home", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/dashboard/:path*"],
};
