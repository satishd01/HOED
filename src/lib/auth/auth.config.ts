import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js configuration.
 * This file contains only configuration that can run in Edge Runtime
 * (no database imports, no Node.js-specific modules).
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ["/documents", "/settings"];
      const isProtected = protectedPaths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );

      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL("/login", nextUrl.origin);
        redirectUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(redirectUrl);
      }

      // Redirect logged-in users away from auth pages
      const authPaths = ["/login", "/register"];
      const isAuthPage = authPaths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/documents", nextUrl.origin));
      }

      return true;
    },
  },
  providers: [], // Populated in auth.ts
};
