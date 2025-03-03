import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const authToken = req.cookies.get("auth_token")?.value;

  // If user is not authenticated, redirect to login page
  if (!authToken && req.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Define the protected routes
export const config = {
  matcher: ["/dashboard/:path*", ], // Add other protected routes here
};
