# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete — Feature 01: Design System
- Complete — Feature 02: Editor Chrome
- Complete — Feature 03: Auth
- Replace `lucide-react` with `lucide-animated` across the entire project.
  All icon imports updated to use `lucide-animated` names (with `Icon` suffix).
- UI updated to match the 50/50 split-screen sign-in layout: teal-tinted left
  branding panel against the near-black right panel, with the centered Clerk
  form on the right.
- `--teal-dark` token (`#0b1315`, mapped to `bg-teal-dark`) differentiates the
  left panel from the `bg-base` right panel.
- `AuthLayout` renders a brand mark, headline, description, three icon-chip
  feature rows and a copyright line on the left (hidden below `lg`).
- Typography follows `ui-context.md`: Geist Sans (`--font-geist-sans`) for UI
  text and Geist Mono (`--font-geist-mono`) for code, loaded with
  `next/font/google` in `app/layout.tsx` and mapped to `--font-sans` /
  `--font-mono` in `globals.css`. Clerk's appearance already referenced those
  variables, so its UI now resolves them.
- Application name is Shadowmesh everywhere (`metadata.title`, auth panels).
- Verified all `framer-motion` using components have `"use client"` directive;
  Fixed `useAnimation()` from `framer-motion` error on Server Components by wrapping Clerk `SignIn`/`SignUp` in `next/dynamic` with `{ ssr: false }`;
  Production build now passes completely.

## Current Goal

- Feature 04 is not specified yet.

## Completed

- Project scaffold (Next.js 16 + TypeScript + Tailwind).
- Context files for Shadowmesh.
- Feature 01: Design System (`context/feature-specs/01-design-system.md`).
  - matos-ui installed and configured through the shadcn registry
    (`components.json`, `@matos` namespace).
  - matos-ui primitives: `Button`, `Input`, `Textarea`, `Field`,
    `SpotlightCard`, `StackedDialog`, `MotionTabs`, plus the `Elevated` surface
    primitive and the `surface-context` / `surface-classes` / `motion-tokens`
    libs.
  - shadcn/ui primitive: `ScrollArea` (matos-ui publishes no scroll-area).
  - Card, dialog and tabs now come from matos-ui; shadcn `card`, `dialog` and
    `tabs` were removed.
  - `lucide-react` installed.
  - `lib/utils.ts` exports a reusable `cn()` helper.
  - Dark theme in `app/globals.css`: palette tokens, shadcn semantic tokens,
    `color-scheme: dark`, typography, `hover-lift`, and the eight-step
    elevation ladder (`--surface-1..8`, `--shadow-1..8`).
- Feature 02: Editor Chrome (`context/feature-specs/02-editor.md`).
  - `components/editor/editor-navbar.tsx`: fixed-height top bar with left,
    center and right sections; the left section holds the sidebar toggle
    (`PanelLeftOpen` when closed, `PanelLeftClose` when open) with
    `aria-expanded` / `aria-controls` wiring. The right section is empty.
  - `components/editor/project-sidebar.tsx`: floating overlay fixed below the
    navbar (`fixed`, `z-30`, `w-80`, dark translucent surface). Accepts
    `isOpen` / `onClose`, slides in from the left with the `moderate` spring
    (opacity-only under reduced motion), and does not push page content.
  - Sidebar header is `Projects` with a close button; `MotionTabs` (`size="sm"`)
    provides `My Projects` / `Shared`, both rendering an empty placeholder; the
    footer holds a full-width `New Project` button with a `Plus` icon.
  - Dialog pattern documented in `context/ui-context.md` (`StackedDialog`
    composition for title, description and footer actions). No dialog instances
    were built, per the spec.
- Feature 03: Auth (`context/feature-specs/03-auth.md`).
  - `@clerk/ui` installed; `lib/clerk-appearance.ts` builds Clerk's appearance
    on the `dark` theme with every variable mapped to a `globals.css` token
    (`--accent-primary`, `--bg-surface`, `--text-primary`, `--radius`, ...).
    No literal colors are defined in the config.
  - `app/layout.tsx` wraps the app in `ClerkProvider` with that appearance and
    `ui={ui}`, so Clerk's UI is bundled instead of loaded from the CDN.
  - `components/auth/auth-layout.tsx`: two-panel auth shell — compact logo,
    tagline and a text-only feature list on the left, centered form on the
    right. The left panel is hidden below `lg`, leaving only the form.
  - `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx`
    render Clerk's `SignIn` / `SignUp` inside that layout, wrapped in
    `Suspense` (required by Cache Components).
  - `proxy.ts` at the project root uses `clerkMiddleware` and protects every
    path except the sign-in and sign-up routes, which are read from
    `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` through
    `lib/auth-routes.ts`.
  - `/` (`app/page.tsx`) redirects authenticated users to `/editor` and
    unauthenticated users to the sign-in route.
  - `app/editor/page.tsx`: protected editor route; calls `auth.protect()` and
    renders `components/editor/editor-shell.tsx`, the client shell that owns
    sidebar state.
  - `EditorNavbar` right section now renders Clerk's `UserButton` with its
    default menu and profile flows untouched.
  - `app/loading.tsx`: root fallback required because `/` and `/editor` read
    request auth under Cache Components.

## In Progress

- None.

## Next Up

- Feature 04 (not yet specified).

## Open Questions

- None yet.

## Architecture Decisions

- Editor chrome is presentational: `EditorNavbar` and `ProjectSidebar` receive
  sidebar state through props; `EditorShell` is the single owner of that state
  for the `/editor` route.
- Design system foundation is matos-ui (source-first shadcn registry) on top of
  Tailwind CSS v4.
- Card = `SpotlightCard`, dialog = `StackedDialog`, tabs = `MotionTabs`. These
  are not API-compatible drop-ins for shadcn's `Card` / `Dialog` / `Tabs`, so
  app code imports the matos-ui components by name.
- Generated component files are treated as protected foundation components and
  must not be edited after installation.
- The matos-ui registry declares its dependencies by bare name (`elevated`,
  `motion-tokens`), which the shadcn CLI resolves against the shadcn registry
  and fails on. Those components were copied from the registry JSON directly,
  which is the documented manual-install path.
- Elevation tokens are defined at `:root` with dark values only, derived from
  the project palette, because the project has no `.dark` class toggle.
- One compatibility edit in the generated `stacked-dialog.tsx`: Base UI 1.9
  types `Popup.style` as `CSSProperties | (state) => CSSProperties`, which the
  registry's `getMotionStyle` call does not accept, so `style` is cast at that
  one call site.
- Route protection is declared once in `proxy.ts` (public routes come from the
  Clerk sign-in / sign-up env vars) and repeated with `auth.protect()` inside
  protected pages, so a proxy misconfiguration cannot expose a page.
- Clerk's appearance is defined in one module (`lib/clerk-appearance.ts`) and
  consumes app CSS variables only, so auth screens follow the design system
  without duplicating palette values.

## Session Notes

- Entry 2026-11-03 (auth polish):
  - Auth logo mark uses `BoxesIcon` from `lucide-animated` again (cyan circle,
    cyan-on-dark icon) instead of a text letter.
  - Feature-row icons are sized with the `icon` `size` prop (`size={18}`)
    instead of a `size-*` class. `lucide-animated` icons render a wrapper `div`
    with the SVG at its own intrinsic size, so class-based sizing left the SVG
    overflowing the wrapper and pushed the glyph off-center inside the chip.
    The chip now also carries `text-brand` so the icon inherits its color.
    Rows use `items-start` with `min-w-0` text to stop the two-line
    descriptions from re-centering the icon.
  - Montserrat replaced Geist project-wide for a single typeface: loaded as
    `--font-montserrat` in `app/layout.tsx`, mapped to both `--font-sans` and
    `--font-mono`, and used by `lib/clerk-appearance.ts`.
- Latest change (auth layout + typography):
  - `components/auth/auth-layout.tsx` rebuilt as a 50/50 split: teal-tinted
    left panel with the Shadowmesh brand mark, headline, description, three
    icon-chip feature rows (`SparklesIcon`, `UsersIcon`, `FileTextIcon`) and a
    copyright footer; `bg-base` right panel with the centered form.
  - `--teal-dark` retuned from `#005f6b` to `#0b1315` and exposed as the
    `teal-dark` theme color so the left panel is a tint of the dark background
    rather than a saturated block. The previous `bg-[--teal-dark]` arbitrary
    value produced no color in Tailwind v4 and was replaced with `bg-teal-dark`.
  - Replaced Montserrat with Geist Sans + Geist Mono (`app/layout.tsx`,
    `globals.css`) to match the typography rules in `context/ui-context.md`.
    `lib/clerk-appearance.ts` already used the Geist variables.
  - Renamed all `Ghost AI` copy to `Shadowmesh` and set the page metadata.
  - `npx tsc --noEmit` passes.
- Previous change (Feature 03 — auth):
  - Added `proxy.ts`, `lib/auth-routes.ts`, `lib/clerk-appearance.ts`,
    `components/auth/auth-layout.tsx`, `components/editor/editor-shell.tsx`,
    `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`,
    `app/editor/page.tsx` and `app/loading.tsx`; updated `app/layout.tsx`,
    `app/page.tsx` and `components/editor/editor-navbar.tsx`.
  - Added Clerk's standard `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` and
    `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up` to `.env.local` (only the
    publishable and secret keys existed before; no variables were renamed).
  - `npx tsc --noEmit` passes.
  - `NODE_ENV=production npm run build` passes: `/` and `/editor` are partial
    prerender, the sign-in / sign-up catch-alls are partial prerender, and the
    proxy is detected. NOTE: this shell exports `NODE_ENV=development`, which
    makes `next build` fail with a React hydration error on `/_global-error`;
    the build must run with `NODE_ENV=production` (pre-existing behaviour).
  - Verified against the dev server: `/` → 307 `/sign-in?redirect_url=/`,
    `/editor` → 307 `/sign-in?redirect_url=/editor`, an unknown path → 307
    `/sign-in`, while `/sign-in`, `/sign-up` and `/sign-in/sso-callback` return 200.
  - Verified in headless Chrome with the dumped DOM: the Clerk sign-in form
    renders (email field + Continue) inside the two-panel layout, and the
    appearance variables resolve to `var(--accent-primary)`, `var(--bg-surface)`,
    `var(--text-primary)` and `var(--radius)` rather than literal colors.
  - `npm run lint` still reports only the pre-existing
    `react-hooks/set-state-in-effect` error in `lib/motion-tokens.ts`.
  - Clerk skills installed under `.agents/skills/` (`clerk`,
    `clerk-backend-api`, `clerk-custom-ui`, `clerk-nextjs-patterns`,
    `clerk-setup`) with `skills-lock.json`; they are agent tooling, not app code.
- Previous change (Feature 02 — editor chrome):
  - Added `components/editor/editor-navbar.tsx` and
    `components/editor/project-sidebar.tsx`.
  - Verified on a temporary `/editor-check` harness with headless Chrome and the
    DevTools protocol: 23 checks covering initial closed state, icon and ARIA
    swap on toggle, fixed navbar height/background/border, sidebar overlay
    positioning above the canvas, both tab empty states, full-width New Project
    button, and close-button behaviour. All passed; the harness was deleted.
  - `npx tsc --noEmit` passes. `npm run lint` still reports only the pre-existing
    `react-hooks/set-state-in-effect` error in `lib/motion-tokens.ts`.
- Previous change (card / dialog / tabs swap):
  - Added `components/matos-ui/spotlight-card.tsx`, `stacked-dialog.tsx`,
    `motion-tabs.tsx`, `elevated.tsx`, plus `lib/surface-context.tsx` and
    `lib/surface-classes.ts`.
  - Removed `components/ui/card.tsx`, `components/ui/dialog.tsx` and
    `components/ui/tabs.tsx`.
  - `app/globals.css` gained the elevation ladder tokens and their
    `@theme inline` mappings (`bg-surface-N`, `shadow-surface-N`).
  - `components/ui/button.tsx` is a one-line re-export of the matos-ui Button
    that only the removed shadcn dialog imported. It is unused now but was
    kept so any future shadcn-generated component that imports
    `@/components/ui/button` still resolves.
  - Verified by rendering all three components on a temporary `/design-check`
    route: SSR HTML contained `spotlight-card`, `motion-tabs` (list, trigger,
    indicator, panel) and, after hydration in headless Chrome, the portalled
    `stacked-dialog` at surface 5, tabs surface 2 and indicator/panel surface 3. The route was deleted afterwards.
  - `components/ui/field.tsx`, `label.tsx` and `separator.tsx` are also unused
    leftovers from the initial install; they are not imported anywhere.
- `npm run lint` still reports one error —
  `react-hooks/set-state-in-effect` in the generated `lib/motion-tokens.ts`
  (`useExitAnimation`). It is third-party generated source and was left
  untouched; `tsc --noEmit` and `NODE_ENV=production npm run build` both pass.
