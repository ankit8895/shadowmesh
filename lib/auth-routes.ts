/**
 * Public auth routes are configured through Clerk's standard sign-in and
 * sign-up environment variables. The literals are fallbacks for environments
 * where those variables are not set.
 */
export const SIGN_IN_PATH =
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";

export const SIGN_UP_PATH =
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

/** Normalizes an env-configured route (path or absolute URL) to a pathname. */
export function toPathname(route: string): string {
  return new URL(route, "http://localhost").pathname;
}
