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
- Complete — Feature 08: Editor Workspace Shell
  (`context/feature-specs/08-editor-workspace-shell.md`)
- Complete — Feature 09: Share Dialog
  (`context/feature-specs/09-share-dialog.md`)
- Complete — Feature 10: Liveblocks Setup
  (`context/feature-specs/10-liveblocks-setup.md`)
- Complete — Feature 11: Base Canvas
  (`context/feature-specs/11-base-canvas.md`)
- Complete — Feature 12: Shape Panel
  (`context/feature-specs/12-shape-panel.md`)
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

- Feature 12 complete. The next feature is not specified yet.

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
- Feature 08: Editor Workspace Shell
  (`context/feature-specs/08-editor-workspace-shell.md`).
  - `app/editor/[projectId]/page.tsx` (the room ID is the project ID) stays a
    server component: a static frame plus a `ProjectWorkspace` async child in
    `<Suspense>`. It calls `auth.protect()`, then `authorizeProjectAccess()`; a
    denied or missing project renders `AccessDenied`, and an authorized one
    renders `WorkspaceShell` with the owned and shared project lists.
  - `lib/project-access.ts` gained `authorizeProjectAccess()`, which returns
    `unauthenticated` / `denied` / `authorized` (`viewer` plus `project`). It
    reuses `findProjectForViewer()`, so owner and collaborator access resolve
    through the same query, and a missing project is indistinguishable from a
    forbidden one.
  - `components/editor/access-denied.tsx`: centered lock chip, a short
    explanation and a secondary `Back to projects` link to `/editor`.
  - `EditorNavbar` takes optional `title` (centered, truncating) and `actions`
    (rendered before `UserButton`). `/editor` passes neither, so its navbar is
    unchanged.
  - `ProjectList` / `ProjectSidebar` take `activeProjectId` and highlight the
    open room with `bg-accent-dim` / `text-brand` and `aria-current="page"`.
  - `components/editor/workspace-shell.tsx` owns the project sidebar and AI
    sidebar state plus the create / rename / delete dialogs
    (`useProjectActions({ activeProjectId })`), so deleting the open project
    still redirects to `/editor`.
  - `components/editor/ai-sidebar.tsx`: right-hand overlay placeholder using the
    same floating surface as the project sidebar and the `moderate` spring. The
    canvas area is a dark, centered placeholder that fills the remaining space.
  - Navbar actions follow the spec: a disabled share button (no sharing
    behaviour yet) and the AI sidebar toggle with `aria-expanded` /
    `aria-controls`. No canvas logic, Liveblocks or AI chat added.
  - Checks: `npx tsc --noEmit`, `npx eslint` on every touched file and
    `NODE_ENV=production npm run build` pass; `/editor/[projectId]` remains
    partially prerendered.
- Feature 09: Share Dialog (`context/feature-specs/09-share-dialog.md`).
  - `components/editor/share-project-dialog.tsx`: the workspace navbar's Share
    button opens a `StackedDialog` (`max-w-md`) with the project link (copy with
    a two-second `Copied!` confirmation), an invite form for owners, and the
    collaborator list. Each row shows the Clerk display name and avatar, falling
    back to the stored email with a generic user icon when the email has no
    Clerk account. Collaborators see the same list without the invite form or
    remove buttons, plus a note that only the owner manages access.
  - `hooks/use-collaborators.ts` fetches the list when the dialog opens (never
    on workspace load), then keeps it in sync from the POST / DELETE responses.
    It tracks loading, invite, per-row removal and error state; API errors are
    read with the new `lib/api-error.ts` helper.
  - `app/api/projects/[projectId]/collaborators/route.ts`: `GET` returns
    `{ collaborators }` for the owner and collaborators (401 unauthenticated,
    404 for missing or denied); `POST` invites an owner only (401 / 404 / 403 /
    400 for an invalid or own email / 409 duplicate) and returns
    `201 { collaborator }`. `.../[collaboratorId]/route.ts` `DELETE` removes an
    owner only and replies `204`, or 404 when the row is not in this project.
  - `lib/collaborators.ts` owns the Prisma calls (invitations stored trimmed and
    lowercased under the existing unique `projectId` / `email` pair) and enriches
    rows through `clerkClient().users.getUserList({ emailAddress })`, matching
    any of a user's addresses; Clerk failures are logged and degrade to email
    only. No local user table was added.
  - `lib/project-input.ts` gained `parseInviteCollaboratorInput` (non-empty
    string, max 254 characters, simple email shape). `lib/project-store.ts`
    selects `ownerId` only so `authorizeProjectAccess()` can return a `role`;
    `ProjectSummary` still never carries `ownerId` to the client, which receives
    only `isOwner`.
  - The workspace route stays `[projectId]`; the collaborator routes nest under
    it.
  - Checks: `npx tsc --noEmit`, `npx eslint` on every touched file and
    `NODE_ENV=production npm run build` pass, with both collaborator routes
    listed as dynamic.
- Feature 10: Liveblocks Setup (`context/feature-specs/10-liveblocks-setup.md`).
  - `liveblocks.config.ts` now types the global `Liveblocks` namespace:
    `Presence` holds `cursor` (`{ x, y }` or `null`) and `isThinking`, and
    `UserMeta` holds the Clerk user ID plus `info.name`, `info.avatar` and
    `info.cursorColor`.
  - `lib/liveblocks.ts` exports `getLiveblocks()`, the cached
    `@liveblocks/node` client. It is created on first use and cached on
    `globalThis`, so requests and hot reloads share one instance; construction
    is deferred so a build without the secret still succeeds and the route can
    answer with JSON instead of a module-load crash.
  - `lib/cursor-color.ts` maps a user ID to one of eight palette colors with a
    stable string hash, so a user keeps the same cursor color across rooms and
    reloads without storing it.
  - `app/api/liveblocks-auth/route.ts` (`POST /api/liveblocks-auth`) parses the
    Liveblocks `{ room }` callback body, resolves it with
    `authorizeProjectAccess()` (the project ID is the room ID), returns `401`
    unauthenticated and `403` for a project the caller cannot open, then calls
    `getOrCreateRoom(room, { defaultAccesses: [] })` and
    `prepareSession()` with the Clerk name, avatar and generated cursor color.
    `session.allow(room, ["*:write"])` scopes write access to that one room and
    the token is returned in Liveblocks' expected `{ token }` body.
  - `lib/project-input.ts` gained `parseLiveblocksAuthInput`, which requires a
    non-empty, trimmed room ID matching the project ID pattern (max 64);
    `lib/project-access.ts` now returns `name` and `avatar` on
    `AuthenticatedViewer` from the same Clerk read, so the auth route does not
    fetch the profile twice.
  - `@liveblocks/node@3.25.0` was added; the previously installed Liveblocks
    packages did not include the server SDK the auth route needs.
  - Checks: `npx tsc --noEmit`, `npx eslint` on every touched file and
    `NODE_ENV=production npm run build` pass, with `/api/liveblocks-auth`
    listed as dynamic.
- Feature 11: Base Canvas (`context/feature-specs/11-base-canvas.md`).
  - `types/canvas.ts` holds the shared canvas contract: the eight
    `NODE_COLORS` fill/text pairs and six `NODE_SHAPES` from `ui-context.md`,
    `CanvasNodeData` (`label`, `color`, `shape`) and the `CanvasNode` /
    `CanvasEdge` types named `canvasNode` / `canvasEdge`.
  - `components/editor/canvas-room.tsx` is the client room wrapper:
    `LiveblocksProvider authEndpoint="/api/liveblocks-auth"`, `RoomProvider`
    with the project ID as room ID and initial presence
    `{ cursor: null, isThinking: false }`, and `ClientSideSuspense` with a loading
    state. A small error boundary around the providers catches failed handshakes
    (which `ClientSideSuspense` does not) and renders a retry panel.
  - `components/editor/canvas.tsx` binds React Flow to the room with
    `useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true })`, passing the
    synced `nodes`, `edges`, `onNodesChange`, `onEdgesChange`, `onConnect` and
    `onDelete` into `ReactFlow`. The canvas starts empty and uses
    `ConnectionMode.Loose`, `fitView`, a dot-pattern `Background` and a `MiniMap`
    tinted through theme tokens.
  - `components/editor/workspace-shell.tsx` renders `CanvasRoom` in place of the
    placeholder text; the page and its server-side access and data loading are
    unchanged.
  - Scope limits respected: no controls, custom node / edge rendering,
    persistence or AI behaviour.
  - Checks: `npx tsc --noEmit`, `npx eslint` on every touched file and
    `NODE_ENV=production npm run build` pass.
- Feature 12: Shape Panel (`context/feature-specs/12-shape-panel.md`).
  - `components/editor/shape-panel.tsx` renders a floating pill toolbar at the
    bottom centre of the canvas with one draggable button per shape. Each drag
    sets the `application/x-shadowmesh-shape` payload
    (`{ shape, width, height }`) through `createShapeDragPayload`.
  - `lib/canvas-drag.ts` owns the payload type, the MIME constant and the
    default sizes: rectangle `160x100`, pill `160x72`, circle `120x120`,
    diamond `180x180` (larger so labels fit), cylinder `140x120` and hexagon
    `160x140`. `parseShapeDragPayload` re-validates the payload, since drag data
    is external input.
  - `components/editor/canvas.tsx` wraps the surface in a `ReactFlowProvider`
    and handles `dragover` / `drop`: the drop reads and validates the payload,
    converts the pointer to canvas coordinates with `screenToFlowPosition`,
    centres the node on the drop point and calls
    `onNodesChange([{ type: "add", item: node }])`. New nodes use an empty
    label, `DEFAULT_NODE_COLOR` and the dragged shape, with IDs built from the
    shape name, a timestamp and a per-session counter.
  - `components/editor/canvas-node.tsx` is the basic `canvasNode` renderer:
    every shape is a bordered rectangle with the centered label, tinted from
    `NODE_COLORS`, plus four hover-revealed connection handles. It is registered
    through `nodeTypes`, so dragged nodes use the custom canvas node type.
  - `types/canvas.ts` gained `DEFAULT_NODE_COLOR` (the neutral dark pair) and
    `NODE_COLORS` is now a const tuple so the default has a concrete type.
  - Checks: `npx tsc --noEmit`, `npx eslint` on every touched file and
    `NODE_ENV=production npm run build` pass.
- Project list navigation: each row in `components/editor/project-list.tsx` is a
  `next/link` to `/editor/{projectId}`, so the sidebar opens owned and shared
  projects from the home page and switches projects inside a workspace. The
  link's `::after` layer stretches over the row, while the rename and delete
  buttons sit above it.

## In Progress

- None.

## Next Up

- The next feature (not yet specified).

## Open Questions

- None.

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
- Workspace access is decided by one helper outside the page
  (`authorizeProjectAccess`); the page only maps its status to a redirect,
  `AccessDenied` or the shell. Denied and not-found intentionally share a
  status so the route cannot be used to enumerate room IDs.
- The workspace chrome stays presentational: `EditorNavbar` accepts an optional
  title and actions, while `WorkspaceShell` owns the sidebar / AI sidebar state.
  `/editor` and `/editor/[projectId]` therefore share the chrome without a
  shared global store.
- Collaborator invitations are keyed by email (trimmed, lowercased) and are not
  user rows. Display names and avatars are read from Clerk on demand and never
  stored, so profile changes show up the next time the dialog opens; an email
  without a Clerk account is still a valid invitation and renders as the email
  only.
- The share dialog fetches collaborators client-side when it opens, unlike the
  project lists, which are server-rendered. The list needs Clerk Backend API
  enrichment and is only visible inside the dialog, so loading it with every
  workspace would slow project opens for data most viewers never look at. The
  API re-checks ownership on invite and remove; `isOwner` only shapes the UI.
- The collaboration role is derived from the project's `ownerId` inside
  `authorizeProjectAccess()` and exposed as an `ownerId`-free `role`; the client
  receives only `isOwner`, keeping `ownerId` on the server.
- The Liveblocks node client is a lazy, `globalThis`-cached singleton rather
  than a module-level instance, so importing the auth route never requires
  `LIVEBLOCKS_SECRET_KEY` at build time; a missing secret or Liveblocks API
  failure becomes a JSON 500 from the handler.
- Room IDs and project IDs are the same value: the auth route validates the
  requested room with the project ID pattern, checks project access before
  calling `getOrCreateRoom`, and creates rooms with `defaultAccesses: []`. Rooms
  are therefore private and only ever created for a verified owner or
  collaborator.
- A Liveblocks token grants `["*:write"]` for the single verified room. Cursor
  colors are derived from a hash of the Clerk user ID over a fixed palette
  instead of being stored, so the same user is the same color everywhere.
- `getAuthenticatedViewer()` now includes the Clerk display name and avatar
  alongside the ID and email. The workspace page ignores them and the auth
  route attaches them to the session, so the profile is read once per request.
- The workspace page stays a server component; only `CanvasRoom` and `Canvas`
  are client components, so the Liveblocks client and React Flow bundle load
  inside a project instead of on the project home or the editor shell.
- `useLiveblocksFlow` owns the diagram in Liveblocks Storage under its default
  `flow` key, so React Flow renders the synced nodes and edges and reports
  changes back through the hook's handlers. There is no local canvas state or
  persistence layer on top of Storage.
- Canvas node data and palettes live in `types/canvas.ts`, outside the
  components, so the UI, imported templates and background tasks can share one
  node shape. `color` stores a fill from `NODE_COLORS`, whose `text` half keeps
  labels legible.
- The canvas error boundary lives in the room wrapper rather than in the canvas
  component, because a failed auth handshake throws during `RoomProvider`
  render, where `ClientSideSuspense` cannot help.
- Shape drags travel as a custom MIME payload carrying the shape and its
  default size, so the drop target never has to duplicate the size table and a
  drag from another page cannot create an unknown node shape. The drop handler
  still re-validates it before touching the room.
- New nodes are added through the Liveblocks `onNodesChange` hook with an `add`
  change instead of local state, so a dropped node is written to shared Storage
  and appears for every collaborator. IDs combine the shape, timestamp and a
  counter, which keeps rapid drops in the same millisecond distinct.
- `canvasNode` is registered once in a module-level `nodeTypes` map. The
  renderer is deliberately shape-agnostic for now: all six shapes share the
  bordered rectangle so shape-specific visuals can land without changing node
  data or storage.

## Session Notes

- Entry 2026-11-06 (project navigation + Liveblocks keys):
  - Projects were not clickable: `ProjectList` rendered each project as plain
    text, so the sidebar had no way to open a workspace. Each row now renders a
    `next/link` to `/editor/{projectId}` whose `::after` layer covers the row,
    with the rename / delete buttons raised above it and `aria-current="page"`
    moving from the list item to the link.
  - `LIVEBLOCKS_PUBLIC_KEY` and `LIVEBLOCKS_SECRET_KEY` are now set in
    `.env.local`. A `getRooms` call through `@liveblocks/node` succeeds, so the
    secret is valid and `/api/liveblocks-auth` can create rooms and issue
    tokens instead of returning a `500`.
  - `RoomProvider` in `components/editor/canvas-room.tsx` is keyed by the room
    ID, because switching projects keeps the workspace subtree mounted and a
    provider opens its room only once. The key forces a fresh connection and
    canvas store for the new project.
  - Checks: `npx tsc --noEmit`, `npx eslint` on `project-list.tsx` and
    `NODE_ENV=production npm run build` pass.
  - Not exercised: clicking a link in a signed-in browser. The URL targets are
    the same routes the create flow already navigates to.
- Entry 2026-11-06 (Feature 12 — shape panel):
  - Added `lib/canvas-drag.ts`, `components/editor/shape-panel.tsx` and
    `components/editor/canvas-node.tsx`; `components/editor/canvas.tsx` now
    wraps the surface in a `ReactFlowProvider`, owns the drop handler and
    registers `nodeTypes`.
  - `lucide-animated` has no diamond, hexagon, cylinder, pill or rectangle
    icons, so the toolbar buttons use six small inline SVG glyphs that inherit
    `currentColor`.
  - The drop handler ignores drags without the custom MIME type, so dragging a
    file or text over the canvas is unaffected.
  - Checks: `npx tsc --noEmit`, `npx eslint` on all touched files and
    `NODE_ENV=production npm run build` pass.
  - Not exercised: dragging shapes in a live room needs
    `LIVEBLOCKS_SECRET_KEY` (still unset) and a signed-in browser session, so
    only types, lint and the production build were verified.
- Entry 2026-11-06 (Feature 11 — base canvas):
  - Added `types/canvas.ts`, `components/editor/canvas-room.tsx` and
    `components/editor/canvas.tsx`, and replaced the placeholder canvas in
    `components/editor/workspace-shell.tsx`.
  - `useLiveblocksFlow` is imported from `@liveblocks/react-flow` (the package
    has no separate suspense entry point) and React Flow's stylesheet is
    imported by the canvas component.
  - Checks: `npx tsc --noEmit`, `npx eslint` on all touched files and
    `NODE_ENV=production npm run build` pass.
  - Not exercised: a live room connection. It needs `LIVEBLOCKS_SECRET_KEY` in
    `.env.local` (still unset) plus a browser session, so only types, lint and
    the production build were verified.
- Entry 2026-11-06 (Feature 10 — Liveblocks setup):
  - Typed `Presence` / `UserMeta` in `liveblocks.config.ts`, added
    `lib/liveblocks.ts` (cached node client) and `lib/cursor-color.ts`, extended
    `getAuthenticatedViewer()` with the Clerk name and avatar, and added
    `POST /api/liveblocks-auth` plus `parseLiveblocksAuthInput`.
  - `@liveblocks/node` was missing from `package.json` even though the other
    Liveblocks packages were installed, so the server SDK was added at the same
    version (`3.25.0`).
  - The route authorizes before it creates the room: `authorizeProjectAccess()`
    reuses `findProjectForViewer()`, so an owner and an invited collaborator get
    the same flow while everyone else is rejected with `403`.
  - Checks: `npx tsc --noEmit`, `npx eslint` on all touched files and
    `NODE_ENV=production npm run build` pass; `/api/liveblocks-auth` is dynamic.
  - Not exercised: real token issuance. `LIVEBLOCKS_SECRET_KEY` is not set in
    `.env.local`, so the route answers `500` until a secret key is added, and a
    room connection needs the canvas client, which does not exist yet.
- Entry 2026-11-06 (Feature 09 — share dialog):
  - Added `components/editor/share-project-dialog.tsx`,
    `hooks/use-collaborators.ts`, `lib/collaborators.ts`, `lib/api-error.ts`,
    the two collaborator API routes and `parseInviteCollaboratorInput`. The
    Share button in `components/editor/workspace-shell.tsx` is enabled again
    and the workspace receives `isOwner` from `authorizeProjectAccess()`.
  - Invitations store the normalized email; Clerk's `getUserList` enriches up to
    100 addresses per dialog load with a display name and avatar, and any Clerk
    failure is logged while rows fall back to email only. No local user table.
  - `StackedDialogContent` renders nothing while closed, so the project link can
    read `window.location.origin` at render time without a hydration mismatch.
  - Checks: `npx tsc --noEmit`, `npx eslint` on all touched files and
    `NODE_ENV=production npm run build` pass; both collaborator routes are
    dynamic.
  - Not exercised: signed-in invite / remove, the collaborator read-only view and
    Clerk name / avatar enrichment all need two real accounts and a browser
    session, so they were not manually verified.
- Entry 2026-11-06 (Feature 08 — editor workspace shell):
  - Replaced the placeholder `/editor/[projectId]` page with the workspace
    shell and added `components/editor/workspace-shell.tsx`,
    `components/editor/ai-sidebar.tsx` and
    `components/editor/access-denied.tsx`.
  - `lib/project-access.ts` gained `authorizeProjectAccess()`;
    `EditorNavbar` gained optional `title` / `actions`; `ProjectList` and
    `ProjectSidebar` gained `activeProjectId` for the current-room highlight.
  - The route param stays `[projectId]` rather than the spec's `[roomId]`: the
    project ID is the Liveblocks room ID by construction, so renaming the
    folder would only break existing links.
  - The project sidebar defaults to open in the workspace so the highlighted
    current room is visible; the AI sidebar defaults closed. The share button
    is disabled because sharing is out of scope.
  - Checks: `npx tsc --noEmit`, `npx eslint` on all touched files and
    `NODE_ENV=production npm run build` pass.
  - Not exercised: the signed-in workspace render (navbar title, active-room
    highlight, both sidebar toggles) needs a browser session; the access-denied
    path needs a project the viewer cannot open.
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
