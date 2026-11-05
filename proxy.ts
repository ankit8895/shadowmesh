import { clerkMiddleware } from "@clerk/nextjs/server";

import { SIGN_IN_PATH, SIGN_UP_PATH, toPathname } from "@/lib/auth-routes";

const PUBLIC_PATHS = [SIGN_IN_PATH, SIGN_UP_PATH].map(toPathname);
const API_PREFIX = "/api";

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (publicPath) =>
      pathname === publicPath || pathname.startsWith(`${publicPath}/`),
  );
}

function isApiPath(pathname: string): boolean {
  return pathname === API_PREFIX || pathname.startsWith(`${API_PREFIX}/`);
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // API routes authenticate themselves so that they can answer with a 401
  // instead of a sign-in redirect. The middleware still runs for them, which is
  // what gives their handlers a Clerk auth context.
  if (isPublicPath(pathname) || isApiPath(pathname)) {
    return;
  }

  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
