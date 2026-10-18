import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  // Auth.js session cookie is checked in route handlers / server components.
  // Keep middleware focused on locale routing.
  return intlMiddleware(req) ?? NextResponse.next();
}

export const config = {
  matcher: ["/", "/(ru|en|zh|tr|fa|ar)/:path*"],
};
