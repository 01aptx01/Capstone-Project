import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyMemberJwt } from "@/lib/auth/verifyJwt";

const TOKEN_COOKIE = "token";
const PHONE_COOKIE = "member_phone";

function clearAuthCookies(response: NextResponse) {
  response.cookies.set(TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(PHONE_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function middleware(request: NextRequest) {
  const rawToken = request.cookies.get(TOKEN_COOKIE)?.value;
  const token = rawToken ? decodeURIComponent(rawToken) : "";
  const session = token ? await verifyMemberJwt(token) : null;

  const isAuthPage = request.nextUrl.pathname.startsWith("/login");

  if (!session) {
    if (isAuthPage) {
      const res = NextResponse.next();
      if (token) clearAuthCookies(res);
      return res;
    }
    const res = NextResponse.redirect(new URL("/login", request.url));
    clearAuthCookies(res);
    return res;
  }

  if (isAuthPage) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-member-phone", session.phone_number);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$|.*\\.jpg$).*)",
  ],
};
