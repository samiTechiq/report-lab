import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STORAGE_KEY } from "./lib/utils";

export function middleware(request: NextRequest) {
  // Get the userDetail from cookies
  const userDetail = request.cookies.get(STORAGE_KEY)?.value;

  // If userDetail is not present, redirect to the homepage
  if (!userDetail) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If userDetail is present, allow the request to continue
  return NextResponse.next();
}

// Specify the paths where the middleware should run
export const config = {
  matcher: ["/reports/:path*", "/supervisors/:path*", "/users/:path*"],
};
