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
- Complete — Feature 13: Node Shape
  (`context/feature-specs/13-node-shape.md`)
- Complete — Feature 14: Node Editing
  (`context/feature-specs/14-node-editing.md`)
- Complete — Feature 15: Node Color Toolbar
  (`context/feature-specs/15-nodes-color-toolbar.md`)
- Complete — Feature 16: Edge Behavior
  (`context/feature-specs/16-edge-behavior.md`)
- Complete — Feature 17: Canvas Ergonomics
  (`context/feature-specs/17-canvas-ergonomics.md`)
- Complete — Feature 18: Starter Template
  (`context/feature-specs/18-starter-template.md`)
- Complete — Feature 19: Presence Avatars & Cursor
  (`context/feature-specs/19-presence-avatars-cursor.md`)
- Complete — Feature 20: AI Sidebar Shell
  (`context/feature-specs/20-ai-sidebar-shell.md`)
- Complete — Feature 21: Canvas Autosave
  (`context/feature-specs/21-canvas-autosave.md`)
- Complete — Feature 22: Design Agent API
  (`context/feature-specs/22-design-agent-api.md`)
- Complete — Feature 23: Design Agent Logic
  (`context/feature-specs/23-design-agent-logic.md`)
- Complete — Feature 24: AI Presence State
  (`context/feature-specs/24-ai-presence-state.md`)
- Complete — Feature 25: Sidebar Chat Feed
  (`context/feature-specs/25-sidebar-chat-feed.md`)
- Complete — Feature 26: Design Agent Frontend
  (`context/feature-specs/26-design-agent-frontend.md`)
- Complete — Feature 27: Spec Generation Flow
  (`context/feature-specs/27-spec-generation-flow.md`)
- Complete — Feature 28: Spec Persistence & Download
  (`context/feature-specs/28-spec-persistence-download.md`)
- Complete — Feature 29: Spec UI Integration
  (`context/feature-specs/29-spec-ui-integration.md`)
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

- Feature 29 complete. The AI sidebar's Specs tab lists the project's generated specs, previews a spec's Markdown in a dialog, and downloads it through the access-checked route.

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
    `Presence` holds `cursor` (`{ x, y }` or `null`) and `thinking`, and
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
    `{ cursor: null, thinking: false }`, and `ClientSideSuspense` with a loading
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
- Feature 13: Node Shape (`context/feature-specs/13-node-shape.md`).
  - `components/editor/node-shape.tsx` is the shared shape renderer:
    rectangle, pill and circle use CSS borders / radius, while diamond, hexagon
    and cylinder render as inline SVGs with `preserveAspectRatio="none"` so
    they scale with the node. Borders use `border-subtle-border` at rest and
    `border-brand` / `stroke-brand` when selected.
  - `components/editor/canvas-node.tsx` delegates to `NodeShape` with the
    node's stored `shape` and palette fill, keeping the four hover handles.
  - `components/editor/shape-panel.tsx` shows a ghost preview while a shape is
    dragged: the drag payload's shape and default size render through
    `NodeShape` in a `pointer-events-none fixed` layer centered on the cursor,
    hidden on `drop` or `dragend` (cancel). The native drag image is suppressed
    with a 1x1 canvas so only the ghost is visible.
  - Drop handling, node creation and the shape panel layout are unchanged.
  - Checks: `npx tsc --noEmit`, `npx eslint` on every touched file and
    `NODE_ENV=production npm run build` pass.
- Feature 14: Node Editing (`context/feature-specs/14-node-editing.md`).
  - `components/editor/canvas-node.tsx` renders React Flow's `NodeResizer`
    when the node is selected: brand-coloured corner handles and edge lines,
    `minWidth` 120 / `minHeight` 72 so a node cannot collapse, and free
    (non-aspect-locked) resizing. Resizer dimension changes go through the
    existing `onNodesChange` handler, which Liveblocks applies to Storage.
  - Double-clicking a node's label area opens a centered, auto-sizing
    `<textarea>` over the label; edits are written on every keystroke through
    the new `CanvasNodeActionsProvider` (a `replace` node change built from the
    synced node), so labels stay in collaborative Storage. Blur or `Escape`
    closes the editor. Empty labels show a faint centered "Label" placeholder
    both at rest and while editing.
  - The editor textarea carries `nodrag`, `nopan` and `nowheel` so typing or
    selecting text never drags the node, pans the canvas or zooms it.
    `zoomOnDoubleClick` is disabled on the canvas so opening the editor never
    zooms the viewport.
  - Shape rendering, the shape panel, the drag preview and node creation are
    unchanged.
  - Checks: `npx tsc --noEmit`, `npx eslint` on every touched file and
    `NODE_ENV=production npm run build` pass.
- Feature 15: Node Color Toolbar
  (`context/feature-specs/15-nodes-color-toolbar.md`).
  - `types/canvas.ts` adds a human-readable `name` to each `NodeColor` pair so
    the toolbar can label its swatches; the fills and text colors are the eight
    pairs already defined from `ui-context.md`.
  - `components/editor/node-color-toolbar.tsx` renders a `NodeToolbar` above a
    selected node with one swatch per color pair. Swatches sit on the node's
    text color via `currentColor`, the active swatch gets a tight 2px ring in
    its paired text color, and hovering adds a 6px glow of that text color.
  - Swatches call the shared node-data action with `{ color }`. Since the node
    derives its text color from `NODE_COLORS`, choosing a swatch updates the
    background and text together through the existing collaborative `replace`
    flow, with no server calls.
  - The toolbar carries `nodrag`, `nopan` and `nowheel`, and React Flow portals
    it above the node, so swatch interactions cannot drag the node or pan the
    canvas.
  - Drag/drop, node selection, shape rendering and the resize/label editing
    behavior are unchanged.
  - Checks: `npx tsc --noEmit`, `npx eslint` on every touched file and
    `NODE_ENV=production npm run build` pass.
- Feature 16: Edge Behavior (`context/feature-specs/16-edge-behavior.md`).
  - `types/canvas.ts` gained `CanvasEdgeData { label }`, so a `canvasEdge` can
    carry an inline label in the same collaborative state as nodes.
  - `components/editor/canvas-edge.tsx` is the custom renderer:
    `getSmoothStepPath` right-angle routing, a thin rounded stroke that is
    dimmed at rest and brightens on hover / selection, a 24px invisible
    interaction path for easier clicking, and the edge's arrow marker.
  - `EdgeLabelRenderer` places the label at the `labelX` / `labelY` midpoint
    returned by `getSmoothStepPath`. Saved labels render as small pills;
    double-clicking the edge opens a growing input (`field-sizing-content`)
    that saves on blur, `Enter` or `Escape`. A selected edge without a label
    shows a faint hint. The label surface carries `nodrag`, `nopan` and
    `nowheel`.
  - `components/editor/canvas-edge-actions.tsx` exposes `updateEdgeLabel`;
    `canvas.tsx` applies it as a `replace` edge change through Liveblocks, the
    same collaborative path as node labels.
  - New connections no longer use the hook's plain `onConnect`. The canvas
    builds the edge with `type: "canvasEdge"`, empty label data and a closed
    arrow `markerEnd`, then adds it with an `add` edge change, so every new edge
    uses the custom renderer.
  - Node handles are now 8px white dots with a dark border, still on all four
    sides and hidden until the node is hovered.
  - Checks: `npx tsc --noEmit`, `npx eslint` on every touched file and
    `NODE_ENV=production npm run build` pass.
- Feature 17: Canvas Ergonomics
  (`context/feature-specs/17-canvas-ergonomics.md`).
  - `components/editor/canvas-controls.tsx` renders a floating pill at the
    bottom-left, above the shape panel, with two groups split by a thin divider:
    zoom out / fit view / zoom in, then undo / redo.
  - Zoom actions use the React Flow instance (`zoomOut`, `fitView`, `zoomIn`)
    with a 200ms animation; fit view also applies a small padding.
  - Undo and redo use Liveblocks' `useUndo` / `useRedo`; `useCanUndo` /
    `useCanRedo` disable the buttons, and the shared Button styles dim disabled
    controls. Liveblocks history remains per-client.
  - `hooks/use-keyboard-shortcuts.ts` binds `+` / `=`, `-`, `Cmd/Ctrl+Z`,
    `Cmd/Ctrl+Shift+Z` and `Cmd/Ctrl+Y` on `window`. It ignores events from
    inputs, textareas, selects and content-editable elements, and leaves
    modified zoom keys to the browser.
  - The `MiniMap` was removed from the canvas.
  - Checks: `npx tsc --noEmit`, `npx eslint` on every touched file and
    `NODE_ENV=production npm run build` pass.
- Feature 18: Starter Template (`context/feature-specs/18-starter-template.md`).
  - `components/editor/starter-templates.ts` defines `CanvasTemplate` and
    `CANVAS_TEMPLATES` with microservices, CI/CD pipeline and event-driven
    diagrams. Small `templateNode` / `templateEdge` helpers keep the data
    readable; nodes use `CanvasNode` with the shared `NODE_COLORS` fills, and
    edges use `CanvasEdge` with labels and the closed arrow marker.
  - `components/editor/starter-templates-modal.tsx` is a `StackedDialog` with a
    scrollable two-column grid of cards. Each card shows the template name and
    description plus a responsive preview (240×132 max): bounds are computed
    from node positions and sizes, edges are lines between node centres, and
    nodes render through the shared `NodeShape` — no React Flow instance is
    involved. Import buttons include the template name in their accessible
    label.
  - The workspace navbar gained a `Templates` button. `WorkspaceShell` owns the
    dialog state and a transient `pendingTemplate`, passed through `CanvasRoom`
    to `Canvas`.
  - `CanvasFlow` imports a pending template inside `room.batch`: `onDelete`
    removes every existing node and edge (Liveblocks ignores `remove` changes
    in `onNodesChange` / `onEdgesChange`), then the template's items are added.
    Batching makes the whole replace one storage mutation and one undo step.
    The view fits once the new nodes reach the synced `nodes` prop.
  - Checks: `npx tsc --noEmit`, `npx eslint` on every touched file and
    `NODE_ENV=production npm run build` pass.
- Feature 19: Presence Avatars & Cursor
  (`context/feature-specs/19-presence-avatars-cursor.md`).
  - `liveblocks.config.ts` now defines Presence as `cursor`
    (`{ x, y } | null`) and `thinking`; `CanvasRoom` initializes both and the
    previously named `isThinking` field was renamed.
  - `components/editor/presence-avatars.tsx` renders the canvas-only avatar
    group in the top-right corner. It reads the Clerk user ID with `useAuth`,
    excludes that ID from `useOthers`, deduplicates a user's multiple
    connections, and shows up to five 32px avatars with a `+N` overflow chip.
    Profile photos are used when present, initials otherwise, and a divider
    appears only when at least one collaborator is present. The current user
    appears separately through Clerk's `UserButton`, sized to 32px to match.
  - `components/editor/presence-cursors.tsx` renders other participants'
    cursors through React Flow's `ViewportPortal`; each is a colored pointer
    with a name badge, positioned from the participant's presence `cursor` and
    inverse-scaled so it stays a constant screen size.
  - `CanvasFlow` broadcasts the local cursor with `useUpdateMyPresence` on
    React Flow's `onMouseMove`, clearing it on `onMouseLeave`, and mounts the
    avatar group above the canvas. The navbar and editor home are untouched.
  - Checks: `npx tsc --noEmit`, targeted `npx eslint` and
    `NODE_ENV=production npm run build` pass.
- Feature 20: AI Sidebar Shell (`context/feature-specs/20-ai-sidebar-shell.md`).
  - Rebuilt `components/editor/ai-sidebar.tsx` as the floating AI workspace
    shell while preserving the parent-owned open state, right slide-in spring,
    fixed positioning, border and shadow. The surface now uses `bg-base/95`.
  - Header: bot icon, `AI Workspace` title, `Collaborate with Shadowmesh`
    subtitle and a right-aligned close button.
  - Tabs use the installed Radix `Tabs` primitive (the same primitive shadcn
    wraps) because the project intentionally does not install the shadcn tabs
    file. AI Architect is the default; active tabs use `bg-brand-dim` /
    `text-brand`, inactive tabs use `text-copy-muted`.
  - AI Architect: scrollable chat area, empty state with bot art and three
    starter prompt pills, right-aligned user bubbles, left-aligned assistant
    bubbles, and a local-only send form. The textarea auto-resizes from 72px to
    160px; Enter sends and Shift+Enter keeps the newline. Sending appends a
    local user message only, with no backend or AI call.
  - Specs: accent `Generate Spec` button and a static demo spec card with a
    file icon, title, snippet and disabled download action.
  - Token mapping: `text-copy-primary` / `text-copy-muted` for title and
    subtitle, `bg-brand` + `text-primary-foreground` for accent actions,
    `bg-brand-dim` / `text-brand` for active tabs, `bg-subtle` + `text-ai-text`
    for starter pills, and `bg-elevated` / `border-surface-border` for cards.
  - Checks: `npx tsc --noEmit`, targeted `npx eslint` and
    `NODE_ENV=production npm run build` pass.
- Feature 21: Canvas Autosave
  (`context/feature-specs/21-canvas-autosave.md`).
  - `@vercel/blob` added. `lib/canvas-store.ts` uploads the canvas JSON to the
    stable path `canvas/{projectId}.json` (overwrite enabled, no random
    suffix) and writes the returned blob URL to `Project.canvasJsonPath`;
    loading reads that URL from Prisma and fetches the JSON back from Blob.
    Prisma never stores the canvas itself.
  - `lib/canvas-snapshot.ts` owns the persisted `{ nodes, edges }` contract.
    Saving strips React Flow's transient interaction fields (`selected`,
    `dragging`, `measured`, …), and parsing rebuilds every node and edge from
    validated fields for both blob reads and PUT request bodies.
  - `app/api/projects/[projectId]/canvas/route.ts`: `GET` returns
    `{ canvas }` (`null` before the first save) and `PUT` validates the body
    and saves. Both authorize through `authorizeProjectAccess`, so owners and
    invited collaborators can save; `/api` stays exempt from `proxy.ts`, so
    the routes answer with JSON 401/404/400/500 errors themselves.
  - `hooks/use-canvas-autosave.ts` watches the room's nodes and edges, debounces
    saves (1.2s), skips the baseline snapshot, and exposes
    `idle | pending | saving | saved | error` status plus a manual `save` that
    bypasses the debounce. Dirty checks are throttled, manual saves are ignored
    until restore settles, and `pagehide` / unmount flush the latest snapshot
    with `keepalive`.
  - `CanvasFlow` loads the saved canvas only when the room has no nodes or
    edges at load time, re-checks the room before applying, adds the snapshot
    through `room.batch`, and then fits the view. A room that already has
    content skips the load entirely. Autosave starts only after the restore
    attempt settles, so the loaded canvas is never written back immediately.
  - `WorkspaceShell` gained a Save button in the navbar with the live status
    indicator (`Save` / `Unsaved` / `Saving…` / `Saved` / `Save failed`), wired
    to the canvas through `onSaveStatusChange`, `onReadyChange` and a save-action
    ref. The button stays disabled until the restore attempt settles.
  - Checks: `npx tsc --noEmit`, targeted `npx eslint` and
    `NODE_ENV=production npm run build` pass.
- Project list navigation: each row in `components/editor/project-list.tsx` is a
  `next/link` to `/editor/{projectId}`, so the sidebar opens owned and shared
  projects from the home page and switches projects inside a workspace. The
  link's `::after` layer stretches over the row, while the rename and delete
  buttons sit above it.

- Feature 22: Design Agent API (`context/feature-specs/22-design-agent-api.md`).
  - `prisma/models/task-run.prisma` adds `TaskRun` (`cuid` `id`, unique `runId`,
    `projectId` with a cascade-delete relation to `Project`, `userId`,
    `createdAt`) with an index on `runId` and a compound `userId` /
    `projectId` index. Migration
    `prisma/migrations/20261111130511_add_task_run` applies it.
  - `trigger/design-agent.ts` exports the minimal `design-agent` task: it
    accepts `{ prompt, roomId }`, logs the request with the prompt length and
    echoes both fields back. It reuses the existing `trigger.config.ts`
    (`dirs: ["trigger"]`, node-24 runtime); no AI provider, nodes or edges.
  - `POST /api/ai/design` parses `{ prompt, projectId, roomId }`, authorizes
    the project through `authorizeProjectAccess`, triggers `design-agent` by
    ID with a type-only import, stores a `TaskRun` row and answers
    `201 { runId }`. Owners and collaborators can both start a run.
  - `POST /api/ai/design/token` requires a signed-in caller, reads the run by
    `runId`, rejects a run started by another user (`403`, `404` when the run
    is unknown) and returns `{ token }`: a Trigger.dev public token scoped to
    `read.runs: [runId]` with a one-hour expiry.
  - `lib/design-input.ts` owns both request parsers and enforces the
    project-ID-is-room-ID invariant, so a run cannot be pointed at a room
    other than the authorized project. `lib/project-input.ts` now exports
    `readJsonObject`, `ROOM_ID_PATTERN` and `MAX_ROOM_ID_LENGTH` for reuse.
  - `lib/task-runs.ts` holds the two Prisma calls (`createTaskRun`,
    `findTaskRun`); run rows are never exposed to the client.
  - Checks: `npx tsc --noEmit`, targeted `npx eslint` and `npm run build`.

- Feature 23: Design Agent Logic
  (`context/feature-specs/23-design-agent-logic.md`).
  - `trigger/design-agent.ts` now runs the real agent: it publishes a running
    status, reads the room canvas for context, asks Gemini
    (`gemini-2.5-flash`) for a JSON design plan, validates it with
    `parseAiDesignPlan`, applies it to Storage, and reports completion or
    failure. Presence is cleared in a `finally`, so a failed run never leaves
    the AI stuck on the canvas.
  - `lib/ai-canvas.ts` owns the `AiDesignOperation` union (addNode, moveNode,
    resizeNode, updateNode, deleteNode, addEdge, deleteEdge), validation of
    the model plan (shape and colour must come from `NODE_SHAPES` /
    `NODE_COLORS`, sizes and labels are clamped, IDs are slugified, at most
    24 operations) and the layout rules (20px grid, 40px minimum gap, overlap
    pushed down through `placeNewNode`).
  - `trigger/design-room.ts` is the server-side canvas layer. It reads the
    diagram with `getStorageDocument(roomId, "json")`, applies the whole plan
    in one `mutateStorage` batch using the same `LiveObject` / `LiveMap`
    layout `@liveblocks/react-flow` owns (`flow` -> `nodes` / `edges`), and
    creates the `flow` key when a task runs before any client opened the room.
  - AI presence uses the Liveblocks server presence API
    (`setPresence(roomId, { userId: "shadowmesh-ai", data, userInfo, ttl })`),
    so the existing `PresenceCursors` / `PresenceAvatars` render the agent
    with a cursor and `thinking: true` while it works; `clearAiPresence`
    drops it with a two-second TTL when the run ends.
  - Superseded by Feature 24: status is published to the room's
    `ai-status-feed` Liveblocks feed instead of an `ai` Storage key, and the
    canvas overlay (`components/editor/ai-activity-feed.tsx`) was removed.
  - `AiSidebar` now takes the project ID and posts prompts to
    `POST /api/ai/design` (the project ID is the room ID), appending the API
    error or a confirmation to the chat; the workspace passes `project.id`.
  - `lib/canvas-drag.ts` exports its size table as `NODE_SHAPE_SIZES` and
    uses relative type imports, so the agent normalizes generated node sizes
    from the same table the shape panel uses and the Trigger bundle does not
    rely on tsconfig path resolution.
  - Checks: `npx tsc --noEmit`, targeted `npx eslint` and `npm run build`.

- Feature 24: AI Presence State
  (`context/feature-specs/24-ai-presence-state.md`).
  - `types/tasks.ts` owns the shared task contract: `AI_STATUS_FEED_ID`
    (`ai-status-feed`), `AiTaskStatus`, `AiTaskKind`, the
    `AiStatusFeedPayload` schema (`status`, optional `text`, optional `kind`)
    and `parseAiStatusFeedPayload`, which rebuilds a payload from validated
    fields so untyped feed data is never rendered as-is.
  - `lib/ai-status.ts` now only holds the agent's presence identity plus
    `ensureAiStatusFeed` (idempotent feed creation, tolerating the conflict a
    second run gets) and `publishAiStatus`, which appends a message with the
    node client.
  - The design agent publishes to the feed instead of writing the `ai` Storage
    key, so the Feature 23 Storage snapshot and its canvas overlay
    (`components/editor/ai-activity-feed.tsx`) are gone.
  - `components/editor/ai-sidebar.tsx` renders inside the room (passed to
    `CanvasRoom` as `aiSidebar`) so it can use the Liveblocks feed hooks. It
    waits for the feed to exist via `useFeeds`, reads only the newest message,
    shows it as a status strip, and disables the prompt input plus spins the
    send button while a run is `running`. The rest of the sidebar stays usable.
  - `components/editor/presence-cursors.tsx` draws a small spinner in the name
    badge when `thinking` is true in presence, and nothing otherwise.
  - Checks: `npx tsc --noEmit`, targeted `npx eslint` and `npm run build`.

- Feature 25: Sidebar Chat Feed
  (`context/feature-specs/25-sidebar-chat-feed.md`).
  - `types/tasks.ts` adds `AI_CHAT_FEED_ID` (`ai-chat`) and the Zod
    `aiChatMessageSchema` (`sender`, `role`, `content`, `timestamp`) plus
    `parseAiChatMessage`, so feed data is validated before it is rendered.
  - `components/editor/ai-sidebar.tsx` creates the room-scoped `ai-chat` feed
    on first use (idempotent, tolerating the 409 a racing participant gets) and
    subscribes with `useFeedMessages`. Messages render in timestamp order with
    sender, time and content, and `ai-chat` stays completely separate from
    `ai-status-feed`.
  - Sending publishes through `useCreateFeedMessage` from the existing composer
    and send button, clears the input once the message is in the feed, and
    shows a compact inline error when it cannot be sent. The Feature 23 design
    trigger still fires after a message is published.
  - `zod` is now a direct dependency (it was already installed transitively).
  - Checks: `npx tsc --noEmit`, targeted `npx eslint` and
    `NODE_ENV=production npm run build`.

- Feature 26: Design Agent Frontend
  (`context/feature-specs/26-design-agent-frontend.md`).
  - Submitting a prompt publishes the user message to `ai-chat`, then calls
    `POST /api/ai/design` with `{ prompt, roomId, projectId }` and stores the
    returned `runId` plus its scoped `publicToken`. The route returns only the
    run ID, so the sidebar requests the token from
    `POST /api/ai/design/token`, while still accepting a token returned inline
    if the route starts issuing one.
  - `useRealtimeRun(runId, { accessToken: publicToken })` follows the run. The
    composer is disabled and the send button spins while the run is active, and
    a terminal status posts one assistant message into `ai-chat` (guarded by a
    run-id ref) before the run state is cleared.
  - Errors are posted into `ai-chat` as assistant messages; the inline error
    line remains only for a failed chat write.
  - The compact status strip now reads the latest `ai-status-feed` message and
    renders directly above the composer, only while a run is active.
  - Chat bubbles and the send button use the existing `success` token (`#34d399`)
    with `text-primary-foreground`; AI replies stay on `bg-elevated` with light
    text. No new colors were introduced.
  - Canvas updates are untouched: `useLiveblocksFlow` already renders the AI's
    Storage mutations, so no manual node/edge syncing was added.
  - Fix: the sidebar mounted closed, so suspense `useFeeds` fired on every
    editor load and its `Feeds fetch timeout` reached the room error boundary,
    replacing the canvas with the connection error. Feed reads now use the
    non-suspense hooks, are only requested after the AI workspace is first
    opened (`feedsEnabled`), surface an inline "Room chat is unavailable"
    state, and the sidebar has its own error boundary in `canvas-room.tsx`.
  - Review fixes: design starts are rate-limited to 10 per user per 10
    minutes, and a run is cancelled if its ownership row cannot be written;
    `running` statuses older than the task's five-minute limit no longer
    disable the composer; the agent applies plans against the live node map, so
    node deletes remove their edges too; a canvas read failure fails the run
    instead of designing over an unreadable board; AI presence sends
    `cursorColor`; chat timestamps are bounded and formatted defensively.
  - Checks: `npx tsc --noEmit`, targeted `npx eslint` and
    `NODE_ENV=production npm run build`.

- Feature 27: Spec Generation Flow
  (`context/feature-specs/27-spec-generation-flow.md`).
  - `POST /api/ai/spec` accepts `{ roomId, chatHistory, nodes, edges }`,
    validates it with the shared Zod `specRequestSchema`, authorizes the
    project from `roomId` and derives `projectId` from that authorized room,
    then triggers `generate-spec` and records a `TaskRun` for the caller. The
    shared per-user run limit applies, and an ownership write failure cancels
    the queued run.
  - `POST /api/ai/spec/token` reuses the run-token handler that the design
    token route now shares: signed-in caller, `TaskRun.userId` ownership check,
    and a one-hour Trigger.dev token scoped to `read.runs: [runId]`.
  - `trigger/generate-spec.ts` is a `schemaTask` using the same payload schema,
    so malformed canvas or chat data fails before the Gemini call. It prompts
    `gemini-2.5-flash` for a plain-Markdown technical spec with fixed sections,
    publishes reading/generating/complete/error statuses to `ai-status-feed`
    as `kind: "spec"`, mirrors progress into run metadata, and returns the
    Markdown as task output. Feature 28 now persists that output.
  - `lib/spec-input.ts` owns the request/task contract and caps (50 chat
    messages, 200 nodes, 400 edges); only the role and content of each chat
    message are used.
  - Checks: `npx tsc --noEmit`, targeted `npx eslint` and
    `NODE_ENV=production npm run build`.

- Feature 28: Spec Persistence & Download
  (`context/feature-specs/28-spec-persistence-download.md`).
  - `prisma/models/spec.prisma` adds `ProjectSpec` (`cuid` `id`, `projectId`
    with a cascade relation to `Project`, private `filePath`, `createdAt` and a
    `projectId` / `createdAt` index), with migration
    `prisma/migrations/20261112120000_add_project_spec`. Prisma holds metadata
    only; the Markdown stays in Vercel Blob.
  - `lib/spec-store.ts` uploads to `specs/{projectId}/{specId}.md` in the
    private Blob store, then creates the `ProjectSpec` row (same ID) pointing
    at the blob URL.
    Specs are immutable per generation, unlike the overwrite-in-place canvas
    path, so a later run never replaces an earlier spec.
  - `trigger/generate-spec.ts` saves the generated Markdown before reporting
    completion and records the new `specId` in run metadata. A storage failure
    fails the run and publishes the error status, so a completed run always has
    a downloadable file.
  - `GET /api/projects/[projectId]/specs/[specId]/download` authenticates,
    checks project access with `authorizeProjectAccess`, looks the spec up by
    both project and spec ID, and streams the private blob as
    `text/markdown` with an attachment filename. Blob URLs are never returned
    to the client, and missing project, spec or file answer `404`.
  - The Trigger worker needs `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` in its
    own environment for the save step.
  - Checks: `npx tsc --noEmit`, targeted `npx eslint` and
    `NODE_ENV=production npm run build`.

- Feature 29: Spec UI Integration
  (`context/feature-specs/29-spec-ui-integration.md`).
  - The Specs tab of `components/editor/ai-sidebar.tsx` is now a `SpecsTab`
    that mounts only while the tab is selected: it keeps the existing accent
    `Generate Spec` button and renders the real spec list plus the preview
    dialog. The static demo card was removed.
  - `hooks/use-project-specs.ts` fetches the spec metadata for the project when
    the tab mounts, validates every entry before rendering, and exposes
    `specs` / `hasLoaded` / `isLoading` / `error` / `reload`. Switching tabs
    remounts the tab and refetches; nothing is cached globally.
  - `components/editor/spec-list.tsx` is the compact, `ScrollArea`-backed list:
    each row shows the filename and `createdAt`, the row body opens the
    preview, and a ghost download anchor saves the file. Loading, error with
    retry, and empty states are handled in place.
  - `components/editor/spec-preview-dialog.tsx` is a `StackedDialog` that
    fetches the spec's Markdown when a spec is selected, renders it through
    `components/editor/spec-markdown.tsx` (react-markdown + `remark-gfm`, every
    element mapped onto theme tokens), and offers Download and Close actions.
    Escape, the backdrop and focus trapping come from the dialog primitive.
    Content lives only while the dialog is open.
  - Spec content is read through the existing access-checked download route
    (`GET /api/projects/[projectId]/specs/[specId]/download`); `fetch` ignores
    the attachment header, so the Blob URL still never reaches the client.
  - `GET /api/projects/[projectId]/specs` was added as the minimal read-only
    listing endpoint the UI needs (metadata only: `id`, `createdAt`,
    `filename`), authorized with `authorizeProjectAccess` and backed by
    `listProjectSpecs` in `lib/spec-store.ts`. No write path was added.
  - `lib/spec-file.ts` owns the download URL, the attachment filename
    (`shadowmesh-spec-{id}.md`) and the formatted timestamp, so the download
    route and the UI cannot disagree; the download route now uses it.
  - `react-markdown` and `remark-gfm` were added for the Markdown preview.
  - Review follow-ups: the preview scroller now has a definite height so long
    specs scroll instead of being clipped; a failed refresh keeps the rows
    already on screen; `Generate Spec` starts a run from the live canvas and
    the room chat and refreshes the list when it settles; spec saves are
    idempotent per run ID so a retried run cannot duplicate a spec; rate
    limiting is per task through the new `TaskRun.taskKey` column; and the
    spec filename now uses a readable short ID.
  - A column added here (for example `TaskRun.taskKey`) needs
    `npx prisma generate` **and** a restart of `next dev`: the running server
    keeps serving the client it compiled earlier, so the new field only fails
    at request time with `PrismaClientValidationError ... Unknown argument`.
    The Trigger worker holds its own bundle and needs the same restart.
  - The specs list failed with `P2021` until the already-committed
    `20261112120000_add_project_spec` migration was applied to the dev database
    (`npx prisma migrate deploy`). Any fresh environment needs it too, otherwise
    the Specs tab and spec persistence fail the same way.
  - Checks: `npx tsc --noEmit`, targeted `npx eslint` and
    `NODE_ENV=production npm run build`.

## In Progress

- None.

## Next Up

- Wire the Specs tab's `Generate Spec` button to `POST /api/ai/spec` with the
  room's canvas and `ai-chat` history, and refresh the list when that run
  completes.

## Open Questions

- Feature 29 said to reuse an existing spec API and add no backend logic, but
  only the download route existed — there was no way to list a project's specs.
  A metadata-only `GET /api/projects/[projectId]/specs` route was added; confirm
  that is the intended home for the listing rather than a server component
  prop.

## Architecture Decisions

- Spec content lives in Vercel Blob and only its private URL plus project
  linkage live in `ProjectSpec`, matching the canvas split: Blob for the
  artifact, Postgres for metadata and ownership.
- The download route streams the blob through the server after
  `authorizeProjectAccess` and looks the spec up by both project and spec ID,
  so blob URLs are never exposed and one project cannot download another's
  spec.
- Spec persistence runs inside the `generate-spec` task, where the Markdown is
  produced and the server-derived project ID is already validated, so a
  completed run always has a stored file; the worker therefore needs
  `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN`.
- Spec generation authorizes from `roomId` and derives `projectId` from the
  authorized room, so a client cannot name another project's canvas; the task
  payload repeats the project ID only for provenance.
- The spec task validates its payload with the same Zod schema the route uses
  (`schemaTask`), so invalid canvas or chat input fails before Gemini is
  billed, and the spec stays plain Markdown as the task output until a later
  unit persists it.
- Spec progress uses Trigger run metadata plus the shared `ai-status-feed`
  (`kind: "spec"`): room participants see it through the existing status strip,
  and the submitting client can read metadata through `useRealtimeRun` without
  a new realtime channel.
- Design generation writes to the room from the task, not from a browser tab,
  so a run finishes even when nobody is watching. `mutateStorage` uses the
  same `flow` / `LiveObject` / `LiveMap` layout `@liveblocks/react-flow`
  owns, so generated nodes are ordinary collaborative nodes and selection,
  resize, the colour toolbar and autosave apply to them unchanged.
- The whole plan is applied in one `mutateStorage` call: partial application
  would leave dangling edges when a later operation failed, and one atomic
  write is one storage update for collaborators.
- Gemini output is untrusted input. The model returns JSON that is parsed and
  rebuilt by `parseAiDesignPlan` (allowed shapes, palette fills, clamped
  sizes, slugified IDs, operation cap) before it reaches Storage.
- AI presence uses the Liveblocks server presence API instead of a synthetic
  client, so the agent has a real user ID, cursor and `thinking` flag that
  the existing presence components already render. A TTL plus an explicit
  clear at the end keeps a crashed agent from lingering.
- Progress is shared through messages in the room's `ai-status-feed` Liveblocks
  feed, not the Trigger run subscription and not a parallel Storage key: every
  participant sees the latest status, and it outlives the run that published it.
- Chat is its own `ai-chat` feed instead of a field on the status feed: the
  conversation and the AI progress line have different schemas, readers and
  retention needs, and separate feeds keep progress from re-rendering on every
  chat message.
- Run progress is followed from the submitting client with
  `useRealtimeRun` and a run-scoped public token, while AI progress for the
  whole room stays on `ai-status-feed`: the token route already verifies run
  ownership, so no new realtime channel or server state was needed.
- Design generation is triggered from `POST /api/ai/design`, not from the
  client, so the Trigger.dev secret key stays server-side. The route
  authorizes the project before triggering and persists the returned run ID
  as a `TaskRun` row before returning it, so a client can never hold a run ID
  the database has not attributed to a user.
- A run-scoped token is issued only after `TaskRun.userId` matches the
  signed-in user. The token is a Trigger.dev public token limited to
  `read.runs: [runId]` with a one-hour expiry: enough to subscribe to that
  one run, nothing else.
- The design request carries `roomId` and `projectId` separately because the
  task operates on a room, while authorization is project-based. They must be
  equal, which keeps the project-ID-is-room-ID invariant enforceable at the
  API boundary instead of assumed.
- The task is triggered by its ID string with a type-only import of the task
  (`tasks.trigger<typeof designAgent>`), so task code is never bundled into
  the Next.js app.
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
- `canvasNode` is registered once in a module-level `nodeTypes` map. Shape
  visuals live in one `NodeShape` component that both the node renderer and the
  drag ghost use, so the preview always matches what a drop creates. Node data
  and Storage are unchanged: the shape comes from the stored `shape` field and
  SVG shapes scale through `preserveAspectRatio="none"`.
- The shape drag preview is local to the shape panel: the panel keeps the
  dragged payload plus the latest `dragover` position and clears it on `drop`
  or `dragend`. The canvas drop handler is untouched, so preview state cannot
  change what a drop creates.
- Node resizing uses React Flow's `NodeResizer`, which emits standard
  `dimensions` changes through `onNodesChange`; `useLiveblocksFlow` writes the
  new `width` / `height` to the Storage node. There is no second resize
  implementation and resized nodes sync like every other node update.
- Custom node renderers cannot reach the canvas' `onNodesChange` directly, so
  label edits travel through a small `CanvasNodeActionsProvider` context. It
  builds a `replace` change from the synced node and lets Liveblocks reconcile
  the label. `useReactFlow().updateNodeData` is deliberately not used: it only
  mutates the local store and does not emit `onNodesChange`.
- The canvas disables `zoomOnDoubleClick`; React Flow attaches d3-zoom's
  double-click handler to the pane, where a node-level `stopPropagation` cannot
  cancel it, so the gesture opens the label editor instead of zooming.
- Node color themes stay a fixed palette in `types/canvas.ts`. A node stores
  only the fill, and its text color is looked up from the same pair, so a theme
  change can never leave unreadable text behind and no extra Storage field is
  needed. The toolbar reuses the same `replace` action as label edits.
- The color toolbar is React Flow's `NodeToolbar`, which portals above the node
  and stays outside its drag surface. `nodrag` / `nopan` on the toolbar keep
  swatch clicks from starting a node drag or a pane pan.
- Edge labels follow the node-label pattern through a separate
  `CanvasEdgeActionsProvider`: the renderer builds a `replace` edge change from
  the synced edge, so labels are written to Liveblocks Storage rather than a
  local component state, and no server call is involved.
- New edges are created by the canvas instead of the hook's `onConnect`, because
  the hook's `addEdge(connection, [])` produces an untyped edge that React Flow
  would render with its default renderer. Building the edge in the canvas is the
  only way to set `type: "canvasEdge"` and its arrow marker at creation time.
- Edge hover and selection are local to the edge renderer: the stroke color is
  computed from `selected` plus a local hover flag, and set inline so React
  Flow's default selected-edge stroke cannot override the theme token.
- Canvas zoom and history controls live in one small `CanvasControls`
  component rendered beside the flow, so it can read both the React Flow
  instance and Liveblocks' history hooks without adding any canvas state. The
  keyboard hook receives those same handlers instead of reimplementing them.
- Keyboard shortcuts are bound once on `window` by `useKeyboardShortcuts` and
  bail on editable targets, which keeps node/edge label inputs and app forms
  working normally. Zoom keys are only handled without `Cmd` / `Ctrl` so the
  browser's own zoom shortcuts still win.
- Starter templates are static data in `components/editor/starter-templates.ts`,
  separate from the dialog that presents them. Template nodes and edges use the
  same `CanvasNode` / `CanvasEdge` contracts as dropped nodes and drawn edges,
  so an import needs no special rendering path.
- The dialog is owned by `WorkspaceShell`, while the import runs in `CanvasFlow`
  where the Liveblocks change handlers and the React Flow instance exist. Only a
  transient `pendingTemplate` prop crosses that boundary; once imported,
  `onTemplateImported` clears it.
- A template import is a replace, not a merge: `onDelete` removes every
  existing node and edge, then the template items are added. The calls run
  inside `room.batch`, so the whole replace is one collaborative mutation and
  one undo step. `onNodesChange` / `onEdgesChange` cannot delete because
  Liveblocks treats their `remove` changes as a no-op.
- Legacy edges stored before Feature 16 are normalized at render time
  (`type: "canvasEdge"`, label data, closed arrow marker), so rooms created
  earlier still show the current edge style without a storage migration.
- Template previews are intentionally independent of React Flow. Bounds come
  from node positions and sizes, edges are straight centre-to-centre lines, and
  nodes reuse `NodeShape` inside a scaled container, so previews stay cheap and
  cannot drift from the real shape visuals.
- Presence UI lives inside the canvas, not the shared navbar: collaborator
  avatars come from `useOthers` filtered by the Clerk session ID, while the
  current user keeps Clerk's `UserButton`. Avatars are display-only and deduped
  by user ID, so multiple tabs from one collaborator produce one avatar.
- Cursor positions are stored in canvas coordinates in Liveblocks Presence.
  `CanvasFlow` writes them from React Flow's mouse handlers, and
  `PresenceCursors` renders other connections through `ViewportPortal` with an
  inverse zoom, so cursors track panning and zooming without scaling.
- The AI sidebar is a UI shell: open state stays in `WorkspaceShell`, while
  `AiSidebar` owns only tab and draft/message state. Chat sends append local
  user messages; no AI, Liveblocks or API calls are involved yet.
- Tabs in the AI sidebar use the Radix `Tabs` primitive from the already
  installed `radix-ui` package. The project keeps matos-ui for its published
  tab component and deliberately does not install the shadcn tabs file, so
  importing the primitive here avoids adding a duplicate tab implementation.
- The AI sidebar maps the spec's generic color names onto existing project
  tokens (`brand`, `brand-dim`, `ai-text`, `copy-primary`, `copy-muted`,
  `elevated`, `subtle`) rather than introducing literals.
- The workspace navbar only gained the Save status button; the canvas-only
  presence group is still intentionally separate from the navbar actions and
  from the home route. The workspace reuses its `WorkspaceUserMenu` while the
  room is connecting or failed, and the group steps left of the open AI
  sidebar on `lg`, so the account menu stays reachable.
- Canvas persistence splits storage by responsibility: Vercel Blob holds the
  `{ nodes, edges }` JSON at `canvas/{projectId}.json`, while Prisma holds only
  the project metadata and the blob URL in `canvasJsonPath`. The URL is the
  source of truth for loading, so a save never needs to scan Blob.
- The saved canvas only seeds a room that is empty. If the Liveblocks room
  already has nodes or edges, the load is skipped and the room is never
  overwritten; the room is re-checked after the fetch too, in case another
  collaborator filled it while the request was in flight.
- Autosave is a client hook fed by the room's synced nodes and edges, not by
  React Flow's local store. It debounces 1.2s, treats the first enabled
  snapshot as a baseline, and only starts after the restore attempt settles,
  which keeps opening or loading a canvas from triggering a save.
- The navbar Save button reflects the hook's status and calls the same save
  function manually. Status is lifted to `WorkspaceShell` through a callback,
  and the save action is registered in a ref so the navbar does not need to
  know about the canvas internals.
- Canvas JSON is validated on both sides of the boundary: `parseCanvasSnapshot`
  rebuilds nodes and edges from known fields, so malformed blob content or a
  crafted PUT body can never inject unexpected node/edge properties.

## Session Notes

- Entry 2026-11-10 (review fixes — autosave, presence, snapshot):
  - Manual saves are ignored until the restore attempt settles and the navbar
    Save button stays disabled, so clicking early can no longer overwrite the
    saved canvas with the still-empty room.
  - Restore also settles after a 3s fallback, so a restored node deleted by
    another client before sync cannot keep autosave off for the session.
  - The autosave hook reports `pending` ("Unsaved") while changes wait for the
    debounce, throttles its dirty check, and flushes the latest snapshot on
    `pagehide` and unmount with `keepalive`.
  - Restored nodes are added before edges, and snapshots no longer persist
    `markerEnd`; the renderer always supplies the arrow marker.
  - `ProjectSummary` and the project select no longer include `canvasJsonPath`,
    so the private Blob URL stays server-side. The project row is only rewritten
    when the stored URL changes.
  - The workspace renders the shared account menu while the room is connecting
    or failed, and the presence group steps left of the open AI sidebar on
    `lg`. The stale navbar comment was corrected.
  - Checks: `npx tsc --noEmit`, targeted `npx eslint` and
    `NODE_ENV=production npm run build` pass.

- Entry 2026-11-10 (review fix — workspace navbar user menu):
  - `EditorNavbar` gains `showUserButton` (default `true`), so the shared navbar
    keeps Clerk's `UserButton` on the editor home and omits it in the project
    workspace, where the canvas presence cluster already renders the user menu.
  - `WorkspaceShell` passes `showUserButton={false}`; editor home, canvas
    rendering, autosave, presence and collaboration behavior are unchanged.
  - Checks: `npx tsc --noEmit`, targeted `npx eslint` and
    `NODE_ENV=production npm run build` pass.

- Entry 2026-11-10 (Feature 21 — canvas autosave):
  - Installed `@vercel/blob` (2.9.0) and added `lib/canvas-store.ts`,
    `lib/canvas-snapshot.ts`, `app/api/projects/[projectId]/canvas/route.ts`
    and `hooks/use-canvas-autosave.ts`.
  - `CanvasFlow` restores a saved snapshot only into an empty room, applies it
    in one `room.batch`, and fits the view once the restored nodes reach the
    synced `nodes` prop. A non-empty room skips loading.
  - `WorkspaceShell` renders the navbar Save button with the autosave status;
    clicking it saves immediately.
  - The Blob store is private: `put` uses `access: "private"` and loads go
    through the SDK's `get()` (with `useCache: false`) instead of `fetch()`,
    which cannot authenticate against a private blob URL.
  - `@vercel/blob` needs `BLOB_READ_WRITE_TOKEN` in the environment (Vercel Blob
    store token). It is not part of the repository; a local run or deployment
    without it returns the route's 500 error when saving.
  - `npx tsc --noEmit`, targeted `npx eslint` and
    `NODE_ENV=production npm run build` pass.

- Entry 2026-11-09 (Feature 20 — AI sidebar shell):
  - Completed `components/editor/ai-sidebar.tsx`: AI Workspace header, Radix
    tabs for AI Architect and Specs, empty chat state with three starter
    prompts, local user-message rendering, auto-resizing composer, and a static
    demo spec card with a disabled download action.
  - Preserved the existing floating position and slide-in/exit animation;
    changed the surface to `bg-base/95` and kept the border/shadow treatment.
  - No backend, Liveblocks or AI generation logic was added; the composer only
    appends local user messages.
  - Checks: `npx tsc --noEmit`, targeted `npx eslint` and
    `NODE_ENV=production npm run build` pass.
- Entry 2026-11-09 (Feature 19 — presence avatars and cursors):
  - Renamed the Presence `isThinking` field to `thinking` and updated the
    canvas room's initial presence.
  - Added `components/editor/presence-avatars.tsx` and
    `components/editor/presence-cursors.tsx`, mounted in `CanvasFlow`, so
    collaborator avatars and live cursors appear only in the project canvas.
  - Avatars use Clerk's active user ID to exclude the current user, dedupe
    connections, show up to five photos/initial avatars with a `+N` chip, and
    end with the current user's `UserButton`. The divider only renders when a
    collaborator is present.
  - Cursors are broadcast from React Flow's `onMouseMove` and cleared on
    `onMouseLeave`; other participants' pointers render in canvas coordinates
    with their presence color and name badge.
  - Checks: `npx tsc --noEmit`, targeted `npx eslint` and
    `NODE_ENV=production npm run build` pass.
- Entry 2026-11-09 (review fixes — template replacement and polish):
  - Fixed template imports to replace the canvas through `onDelete` inside
    `room.batch`; the previous `remove` changes were silently ignored by
    Liveblocks, so imports merged into existing content.
  - Normalized legacy edges at render time so older room content gets the
    custom edge renderer, label data and arrow marker.
  - Made template previews responsive down to narrow dialogs, gave each Import
    button a template-specific accessible name, and resolved template palette
    fills by color name instead of array index.
  - Edge hover now also triggers from the portaled label pill, and the arrow
    marker follows the line color when hovered or selected.
  - Checks: `npx tsc --noEmit`, targeted `npx eslint` and
    `NODE_ENV=production npm run build` pass.
- Entry 2026-11-09 (Feature 18 — starter templates):
  - Added `components/editor/starter-templates.ts` with three templates
    (microservices, CI/CD pipeline, event-driven system) built from the shared
    `CanvasNode` / `CanvasEdge` types, palette fills and helper builders.
  - Added `components/editor/starter-templates-modal.tsx`: a `StackedDialog`
    with a scrollable grid of cards, each with a preview that fits computed
    node bounds, draws centre-to-centre edge lines and reuses `NodeShape` for
    the nodes.
  - Added a `Templates` navbar action. `WorkspaceShell` owns the dialog and a
    transient `pendingTemplate`, forwarded through `CanvasRoom` to the canvas.
    `CanvasFlow` replaces every existing node and edge with the template's items
    through the Liveblocks change handlers, then fits the view once the new
    nodes arrive in synced state.
  - `ui-context.md` documents the navbar Templates entry point and the dialog.
  - Checks: `npx tsc --noEmit`, `npx eslint` on the touched files and
    `NODE_ENV=production npm run build` pass.
  - Not exercised: opening the dialog and importing a template in a signed-in
    browser with a live room; verification covered types, lint and the
    production build.
- Entry 2026-11-09 (Feature 17 — canvas ergonomics):
  - Added `components/editor/canvas-controls.tsx`: a bottom-left pill above the
    shape panel with zoom out / fit view / zoom in, a thin divider, and undo /
    redo. Zoom uses `useReactFlow()` with a 200ms animation; history uses
    `useUndo` / `useRedo` and dims the buttons via `useCanUndo` / `useCanRedo`.
  - Added `hooks/use-keyboard-shortcuts.ts` for `+` / `=`, `-`, `Cmd/Ctrl+Z`,
    `Cmd/Ctrl+Shift+Z` and `Cmd/Ctrl+Y`. It skips inputs, textareas, selects and
    content-editable elements and leaves modified zoom keys to the browser.
  - Removed the `MiniMap` from `canvas.tsx`; the shape panel and node/edge
    rendering are unchanged.
  - lucide-animated has no plain minus or zoom icons, so the zoom-out and
    zoom-in buttons use small inline SVG glyphs (MaximizeIcon covers fit view).
  - Checks: `npx tsc --noEmit`, `npx eslint` on the touched files and
    `NODE_ENV=production npm run build` pass.
  - Not exercised: zoom animation, history undo/redo and the shortcuts in a
    signed-in browser with a Liveblocks room; verification covered types, lint
    and the production build.
- Entry 2026-11-09 (Feature 16 — edge behavior):
  - Added `components/editor/canvas-edge.tsx` and
    `components/editor/canvas-edge-actions.tsx`. Edges now use smooth-step
    right-angle routing, a dimmed 1.5px stroke that brightens on hover or
    selection, a closed arrow marker, and a 24px invisible interaction path so
    they are easier to hit without looking thicker.
  - Edge labels render through `EdgeLabelRenderer` at the `getSmoothStepPath`
    midpoint as small pills; double-click opens a `field-sizing-content` input
    that saves on blur, `Enter` or `Escape`, and a selected edge with no label
    shows a faint "Add label" hint. Saved labels go through `onEdgesChange`'s
    `replace` action, so they live in collaborative Storage.
  - New connections build a typed `canvasEdge` with an empty label and arrow
    marker in `canvas.tsx`, because the Liveblocks hook's own `onConnect`
    creates untyped edges that would render with the default edge.
  - Node handles keep all four sides but now render as 8px white dots with a
    dark border that fade in on hover.
  - `ui-context.md`'s Edge Style section was updated to describe the new
    renderer and label behavior.
  - Checks: `npx tsc --noEmit`, `npx eslint` on the touched files and
    `NODE_ENV=production npm run build` pass.
  - Not exercised: creating edges and editing labels in a live room with a
    second collaborator; verification covered types, lint and the production
    build.
- Entry 2026-11-09 (Feature 15 — node color toolbar):
  - Added `components/editor/node-color-toolbar.tsx`: a `NodeToolbar` above the
    selected node with eight swatches, one per `NODE_COLORS` pair. Active
    swatches get a tight ring in their text color, hover adds a small glow of
    the same color, and the toolbar is marked `nodrag nopan nowheel`.
  - Generalized `CanvasNodeActionsProvider` from a label-only action to
    `updateNodeData(id, patch)`, so both label edits and color changes go
    through one collaborative `replace` path.
  - Palette entries gained `name` for accessible swatch labels; fills and text
    colors are unchanged. Selecting a swatch writes `{ color }` and the node
    derives the paired text color, updating background and text together.
  - Checks: `npx tsc --noEmit`, `npx eslint` on the touched files and
    `NODE_ENV=production npm run build` pass.
  - Not exercised: clicking swatches in a live room with a second collaborator;
    verification covered types, lint and the production build.
- Entry 2026-11-09 (Feature 14 — node resizing and labels):
  - Selected nodes now show `NodeResizer` corner handles and edge lines in the
    brand accent, with a 120x72 minimum so labels always have room. Resizes are
    written through the existing Liveblocks-backed `onNodesChange` flow.
  - Double-clicking a label opens a centered textarea overlay that updates the
    label on every keystroke via a `replace` node change in collaborative
    Storage. It closes on blur or `Escape`, and empty labels show a faint
    "Label" placeholder in the same centered position.
  - Textarea interactions are isolated with `nodrag` / `nopan` / `nowheel`, and
    the canvas' double-click zoom was turned off so the gesture is editing-only.
  - Checks: `npx tsc --noEmit`, `npx eslint` on the touched files and
    `NODE_ENV=production npm run build` pass.
  - Not exercised: live resize and typing with a second collaborator, which
    needs a signed-in browser and a Liveblocks room; verification covered types,
    lint and the production build.
- Entry 2026-11-09 (Feature 13 — node shapes):
  - Added `components/editor/node-shape.tsx`; `canvas-node.tsx` now renders
    each node's shape (CSS for rectangle / pill / circle, SVG for diamond /
    hexagon / cylinder) with a subtle border that switches to `brand` when the
    node is selected.
  - `shape-panel.tsx` renders a cursor-following ghost of the dragged shape at
    the payload's default size and clears it on drop or drag cancel. The native
    drag image is suppressed so only the ghost shows.
  - Checks: `npx tsc --noEmit`, `npx eslint` on the touched files and
    `NODE_ENV=production npm run build` pass.
  - Not exercised: dragging shapes in a signed-in browser needs a live
    Liveblocks room; verification covered types, lint and the production build.
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
