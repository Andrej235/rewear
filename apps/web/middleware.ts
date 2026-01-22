import { NextRequest, NextResponse } from "next/server";

const unprotectedPages = [
  "/",
  "/login",
  "/register",
  "/confirm-email",
  "/reset-password",
];

export async function middleware(request: NextRequest) {
  if (unprotectedPages.includes(request.nextUrl.pathname)) return;

  const hasCookie = request.cookies.has(".AspNetCore.Identity.Application");
  return hasCookie
    ? NextResponse.next()
    : NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
