import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/verify-token";
import {
    ADMIN_PREFIX,
    ADMIN_ROLE,
    AUTH_COOKIE,
    AUTH_PATH_PREFIX,
    HOME_PATH,
    LOGIN_PATH,
    PROTECTED_PREFIXES,
    REDIRECT_PARAM,
} from "@/lib/constants";
import type { NextRequest } from "next/server";
import type { SessionClaims } from "@/lib/types";

const startsWithAny = (
    pathname: string,
    prefixes: readonly string[],
): boolean =>
    prefixes.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );

const readSession = async (
    request: NextRequest,
): Promise<SessionClaims | null> => {
    const token = request.cookies.get(AUTH_COOKIE)?.value;
    const publicKey = process.env.AUTH_JWT_PUBLIC_KEY;

    if (!token || !publicKey) return null;

    return verifySessionToken(token, publicKey);
};

export async function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const isProtected = startsWithAny(pathname, PROTECTED_PREFIXES);

    if (!isProtected && !pathname.startsWith(AUTH_PATH_PREFIX)) {
        return NextResponse.next();
    }

    const claims = await readSession(request);

    if (pathname.startsWith(AUTH_PATH_PREFIX)) {
        return claims
            ? NextResponse.redirect(new URL(HOME_PATH, request.url))
            : NextResponse.next();
    }

    if (!claims) {
        const target = new URL(LOGIN_PATH, request.url);

        target.searchParams.set(REDIRECT_PARAM, `${pathname}${search}`);

        return NextResponse.redirect(target);
    }

    if (startsWithAny(pathname, [ADMIN_PREFIX]) && claims.role !== ADMIN_ROLE) {
        return NextResponse.redirect(new URL(HOME_PATH, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
