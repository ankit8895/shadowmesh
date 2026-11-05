# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete — Feature 01: Design System
- Complete — Feature 02: Editor Chrome
- Complete — Feature 03: Auth
- Complete — Feature 04: Project Dialogs
- Complete — Feature 05: Prisma (`context/feature-specs/05-prisma.md`)
- Complete — Feature 06: Project APIs (`context/feature-specs/06-project-apis.md`)
- Complete — Feature 07: Wire Editor Home (`context/feature-specs/07-wire-editor-home.md`)
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

- Feature 07 complete. Feature 08 is not specified yet.

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
- Feature 04: Project Dialogs (`context/feature-specs/04-project-dialogs.md`).
  - `lib/mock-projects.ts`: `Project` type plus `MOCK_PROJECTS` (two owned
    projects and one shared project). No API calls or persistence.
  - `lib/project-slug.ts`: `toProjectSlug()` derives the slug preview.
  - `lib/use-project-dialogs.ts`: dedicated hook owning dialog state, form
    state (`name`, derived `slug`), the active project, and `isSubmitting`.
    Submits run on a short mock timer and mutate the local project list.
  - `components/editor/editor-home.tsx`: minimal centered home content (heading,
    description, `New Project` button) with no card wrapper.
  - `components/editor/create-project-dialog.tsx`: name input plus a live slug
    preview that updates as the user types.
  - `components/editor/rename-project-dialog.tsx`: prefilled, auto-focused name
    input, current name in the description, Enter submits through the form.
  - `components/editor/delete-project-dialog.tsx`: destructive confirmation with
    no input; content uses `variant="danger"` and the confirm button
    `variant="destructive"`.
  - `components/editor/project-list.tsx`: mock project rows; rename and delete
    actions render only for `isOwner` projects, so the Shared tab has none.
  - `components/editor/project-sidebar.tsx`: renders the owned and shared lists
    in their tabs, wires `New Project`, and adds a mobile-only backdrop scrim
    (`lg:hidden`) that closes the sidebar when tapped.
  - `components/editor/editor-shell.tsx`: owns sidebar state and the dialogs
    hook, and wires home create, sidebar create, rename and delete.
- Feature 05: Prisma (`context/feature-specs/05-prisma.md`).
  - `prisma/models/project.prisma`: `ProjectStatus` enum (`DRAFT`, `ARCHIVED`),
    `Project` (cuid `id`, `ownerId` holding the Clerk user ID, `name`, optional
    `description`, `status` defaulting to `DRAFT`, optional `canvasJsonPath`,
    `createdAt` / `updatedAt`, indexes on `ownerId` and `createdAt`) and
    `ProjectCollaborator` (`project` relation with cascade delete, `email`,
    `createdAt`, unique `projectId` / `email`, indexes on `email` and
    `projectId` / `createdAt`).
  - `lib/prisma.ts`: one cached `PrismaClient`. `DATABASE_URL` starting with
    `prisma+postgres://` goes through Accelerate (`accelerateUrl`); any other
    URL goes through `@prisma/adapter-pg`. The instance is cached on `global`
    outside production so hot reloads reuse it.
  - Migration `prisma/migrations/20261105120033_init_project_models` created and
    applied; client generated to `app/generated/prisma`.
  - No queries, API routes or UI were wired to the schema — the spec covers the
    data layer only.
- Feature 06: Project APIs (`context/feature-specs/06-project-apis.md`).
  - `GET /api/projects` returns `{ projects }` for the signed-in owner, newest
    first. `POST /api/projects` returns `{ project }` with `201` and defaults a
    missing, null or blank name to `Untitled Project`; IDs come from the schema's
    `cuid()` default.
  - `PATCH /api/projects/[projectId]` renames and `DELETE` removes the project
    (`204`, empty body). Both check auth first (`401`), then existence (`404`),
    then ownership (`403`) before touching the row.
  - `lib/project-input.ts`: body parsing and validation with no new dependency.
    Unreadable/non-object JSON, non-string `name`/`description` and a blank
    rename name return `400` with a message.
  - `lib/project-access.ts`: `getAuthenticatedUserId()` plus
    `authorizeProjectOwner()`, which compares the stored `ownerId` with the Clerk
    user ID. `lib/project-store.ts` holds the four Prisma calls and the shared
    select that keeps `ownerId` out of responses. `lib/api-response.ts` is the
    single `{ error }` shape.
  - `proxy.ts` no longer calls `auth.protect()` for `/api`, so unauthenticated
    API calls reach the handlers and get a JSON `401` instead of a sign-in
    redirect. Middleware still runs for API paths, which is what supplies the
    Clerk auth context the handlers read.
  - `GET /api/projects` lists owned projects only; projects shared with the
    signed-in email are resolved through the editor page (Feature 07).
- Feature 07: Wire Editor Home (`context/feature-specs/07-wire-editor-home.md`).
  - `app/editor/page.tsx` renders a prerenderable frame and streams the signed-in
    view: the `EditorProjects` server component calls `auth.protect()`,
    `getAuthenticatedViewer()` and a `Promise.all` of `listProjectsForOwner` /
    `listSharedProjects`, then renders `EditorShell` with `ownedProjects` /
    `sharedProjects`. No client-side fetching for the initial load.
  - `lib/project-access.ts` gained `getAuthenticatedViewer()` (`userId` plus the
    Clerk primary email, which collaborator invitations match).
    `lib/project-store.ts` gained `listSharedProjects()` (collaborator match,
    owner excluded, case-insensitive) and `findProjectForViewer()`.
  - `hooks/use-project-actions.ts`: owns dialog kind, active project, name,
    loading and error state for create / rename / delete. Create generates a
    six-character base-36 suffix, builds `slugify(name)-suffix` as the room ID and
    project ID, then navigates to `/editor/{id}`; rename PATCHes and refreshes;
    delete DELETEs and redirects to `/editor` when the open workspace was
    removed, otherwise refreshes.
  - `POST /api/projects` accepts an optional `roomId` (lowercase letters, digits
    and single hyphens, max 64) and stores it as the project `id`, so the project
    ID and Liveblocks room ID cannot drift. A taken room ID returns `409` from the
    Prisma `P2002` unique-constraint error; omitting `roomId` keeps the `cuid()`
    default.
  - Dialogs: create shows the live room ID preview and any API error, rename
    pre-fills the current name, delete names the project; all three render the
    hook's `error`. Rename no longer validates a slug, since renaming does not
    change the room ID.
  - `components/editor/project-sidebar.tsx` takes the two lists directly and
    `project-list.tsx` shows each project's ID (the Prisma model has no slug
    field) and offers rename / delete only when handlers are passed, so the
    Shared tab stays read-only.
  - Added a minimal `app/editor/[projectId]/page.tsx`: protects the route, loads
    the project for an owner or collaborator, `notFound()` otherwise, and shows
    the project name and room ID until the canvas exists.
  - Removed `lib/mock-projects.ts` and `lib/use-project-dialogs.ts`.

## In Progress

- None.

## Next Up

- Feature 08 (not yet specified).

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
- The Prisma schema is multi-file: models live under `prisma/models/` and
  `prisma7.config.ts` points `schema` at the whole `prisma/` directory. New
  models get their own file there instead of being added to `schema.prisma`.
- The generated client output is `app/generated/prisma` (gitignored) and is
  imported as `@/app/generated/prisma/client`. `prisma generate` must run after
  schema changes and before a build on a fresh checkout.
- `lib/prisma.ts` is the single place a client is constructed, and it picks the
  transport from the URL prefix, so local/Prisma Postgres direct URLs and
  Accelerate URLs share one import.
- Project API contract: success payloads are `{ projects }` or `{ project }`,
  every error is `{ error: string }`, and `DELETE` replies `204` with no body.
  Responses never include `ownerId`.
- API authorization lives in the handlers (`auth()` plus the stored `ownerId`),
  not in `proxy.ts`. The proxy exempts `/api` deliberately so 401/403 can be
  real JSON responses rather than redirects; any new API route must therefore
  authenticate itself.
- The project ID is the Liveblocks room ID. Create generates
  `<slug>-<random suffix>` in the browser and sends it as `roomId`;
  `POST /api/projects` stores it as `Project.id`. There is no separate room
  column, so the two identifiers cannot diverge.
- The editor's initial project data is fetched in the server component and passed
  down as props; client code never fetches project lists. Mutations call the API
  and then `router.refresh()` (or `router.push` after create), so the server
  render stays the single source of truth.
- Shared projects are matched on the viewer's Clerk primary email against
  `ProjectCollaborator.email`, case-insensitively, with the owner excluded so an
  owner never sees their own project twice.
- The editor routes stream their session and database reads from an async child
  inside a page-level `<Suspense>`. Cache Components reports a top-level `await`
  on `currentUser()` as uncached data, which blocks prerendering and instant
  navigation, so the frame must stay free of request-time reads.

## Session Notes

- Entry 2026-11-05 (Cache Components — editor routes):
  - `/editor` failed instant-navigation validation: `getAuthenticatedViewer()`
    ran at the page's top level, so `currentUser()` was uncached data outside
    `<Suspense>` and the route could not prerender.
  - Both editor pages now render a static frame plus an async child
    (`EditorProjects`, `ProjectWorkspace`) inside `<Suspense>`, following the
    Cache Components authentication guide. Authorization and data behaviour are
    unchanged; unauthenticated visitors are still redirected by Clerk.
  - Checks: `npx tsc --noEmit`, `npx eslint` on both pages and
    `NODE_ENV=production npm run build` pass; `/editor` and
    `/editor/[projectId]` remain partially prerendered.
  - Not exercised: the signed-in render needs a browser session, so the dev
    overlay itself was not re-observed after the change.
- Entry 2026-11-05 (Feature 07 — wire editor home):
  - `/editor` fetches owned and shared projects on the server and passes both to
    `EditorShell`; the sidebar renders them without client fetching.
  - The project ID is the Liveblocks room ID: create slugifies the name, appends
    a random six-character suffix, previews it and sends it as `roomId` to
    `POST /api/projects`, which stores it as `Project.id` and answers `409` on a
    duplicate instead of `500`.
  - Added `hooks/use-project-actions.ts` and
    `app/editor/[projectId]/page.tsx`; removed `lib/mock-projects.ts` and
    `lib/use-project-dialogs.ts`. Rename refreshes in place; delete redirects to
    `/editor` when it removes the open workspace and refreshes otherwise.
  - Checks: `npx tsc --noEmit`, `npx eslint` on the touched files and
    `NODE_ENV=production npm run build` pass.
  - Not exercised: authenticated create / rename / delete and the collaborator
    list, which need a signed-in session and a second user.
- Entry 2026-11-05 (Feature 06 — project API routes):
  - Added `app/api/projects/route.ts` (GET, POST) and
    `app/api/projects/[projectId]/route.ts` (PATCH, DELETE), with the shared
    helpers `lib/project-access.ts`, `lib/project-input.ts`,
    `lib/project-store.ts` and `lib/api-response.ts`.
  - `proxy.ts` now skips `auth.protect()` for `/api`. Before this, an
    unauthenticated `PATCH /api/projects/[id]` returned a 307 to `/sign-in` and
    `GET /api/projects` returned a 404 page, so the specified 401 could never be
    returned. Verified after the change: both answer `401` with
    `{"error":"Unauthorized."}`.
  - Checks: `npx tsc --noEmit`, `npx eslint` on the new route/lib files and
    `NODE_ENV=production npm run build` (routes listed as dynamic) all pass.
  - Not exercised: authenticated list/create/rename/delete and the 403 path,
    which need a signed-in session and a second user.
- Entry 2026-11-05 (Feature 05 — Prisma data layer):
  - Added `prisma/models/project.prisma` with `ProjectStatus`, `Project` and
    `ProjectCollaborator`. Field set follows the spec exactly; the only addition
    beyond the listed fields is `status @default(DRAFT)` and the `id` primary
    keys Prisma requires.
  - Added `lib/prisma.ts` with the URL-prefix branch (Accelerate via
    `accelerateUrl`, otherwise `@prisma/adapter-pg`) and the dev-only `global`
    cache.
  - `npx prisma validate` passes, `npx prisma migrate dev --name
    init_project_models` created and applied
    `20261105120033_init_project_models` against the configured Prisma Postgres
    database, and `npx prisma generate` emitted the client.
  - `npx tsc --noEmit` and `NODE_ENV=production npm run build` both pass.
  - `prisma7.config.ts` (not `prisma.config.ts`) is the config file the CLI
    loads in this project; it already pointed `schema` at `prisma/` and reads
    `DATABASE_URL` through `dotenv/config`. No config changes were needed.
- Entry 2026-11-04 (dialog close flicker, icon alignment, slug validation):
  - Close flicker: Base UI ends the portal as soon as the *popup's CSS*
    animations finish, so the framer exit never played while the backdrop's CSS
    `exit` animation ran on its own — the black scrim outlived the content and
    read as a black flash. `StackedDialogContent` now renders the portal with
    `keepMounted`, overrides Base UI's `hidden` on popup and backdrop, and drives
    both with framer from the same `open` flag (backdrop fades with the popup).
    Exits use `tier.exit` so they finish inside `exitFallbackMs` instead of being
    cut off by the spring tail.
  - Verified in headless Chrome with a temporary public probe route (removed
    again, `proxy.ts` restored): a per-frame DOM sampler shows backdrop and popup
    opacity tracking each other from 1 → 0 over ~360ms and unmounting together.
  - Close-button `XIcon` used `className="size-4"`, which sized the wrapper `div`
    to 16px while the SVG stayed at its 28px default — the glyph sat off-center.
    All remaining class-sized `lucide-animated` icons now use the `size` prop
    (`stacked-dialog`, `input` status icons, `editor-navbar`, `project-list`).
    Measured after the fix: a 16px SVG centered in the 32px button.
  - `FieldError` / `FieldSuccess` rendered a `motion.p` containing the icon's
    wrapper `div` (invalid nesting, React hydration error) with the same class
    sizing; both are now `motion.div` with `size={14}` icons.
  - Empty-slug validation: create and rename show
    `Use at least one letter or number in the project name.` and disable submit
    when the name trims to something that slugifies to `""`;
    `useProjectDialogs.submit` guards the same case. `rename-project-dialog`
    takes a `slug` prop.
  - `npx tsc --noEmit`, `npx eslint` on the touched files and
    `NODE_ENV=production npx next build` all pass.
- Entry 2026-11-03 (Feature 04 — project dialogs):
  - Added `lib/mock-projects.ts`, `lib/project-slug.ts`,
    `lib/use-project-dialogs.ts`, `components/editor/editor-home.tsx`,
    `components/editor/project-list.tsx` and the create / rename / delete dialog
    components; updated `components/editor/project-sidebar.tsx` and
    `components/editor/editor-shell.tsx`. Navbar and sidebar open/close
    behaviour are unchanged.
  - Dialog state is centralized in `useProjectDialogs`; the shell only maps
    `openDialog` to each dialog and forwards `closeDialog` from `onOpenChange`.
  - `lucide-animated` exposes no `Pencil` / `Trash2`, so the rename and delete
    actions use `SquarePenIcon` and `DeleteIcon` with the icon `size` prop.
  - `npx tsc --noEmit` passes; `NODE_ENV=production npm run build` passes.
  - `npx eslint components/editor lib/use-project-dialogs.ts lib/mock-projects.ts
    lib/project-slug.ts` is clean. `npm run lint` still reports the pre-existing
    `react-hooks/set-state-in-effect` error in the protected generated
    `lib/motion-tokens.ts` (`useExitAnimation`); it was not edited.
  - `toProjectSlug` verified against five inputs (spacing, punctuation,
    accents, all-symbol names, casing) by compiling the module and running it
    under Node.
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
