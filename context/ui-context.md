# UI Context

## Theme

Dark only. No light mode. The visual language is a dark technical workspace — near-black backgrounds, layered surfaces, and vivid accent colors for interactive elements.

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind tokens via `@theme inline`. The root declares `color-scheme: dark` and the base palette directly (no `.dark` class toggle). Components must use these tokens — no hardcoded hex values or raw Tailwind color classes like `zinc-*`.

| Role             | CSS Variable           | Hex / Value               |
| ---------------- | ---------------------- | ------------------------- |
| Page background  | `--bg-base`            | `#080809`                 |
| Surface          | `--bg-surface`         | `#111114`                 |
| Elevated surface | `--bg-elevated`        | `#18181c`                 |
| Subtle surface   | `--bg-subtle`          | `#1e1e23`                 |
| Default border   | `--border-default`     | `#2a2a30`                 |
| Subtle border    | `--border-subtle`      | `#3a3a42`                 |
| Primary text     | `--text-primary`       | `#f0f0f4`                 |
| Secondary text   | `--text-secondary`     | `#c0c0cc`                 |
| Muted text       | `--text-muted`         | `#808090`                 |
| Faint text       | `--text-faint`         | `#505060`                 |
| Brand accent     | `--accent-primary`     | `#00c8d4` (cyan)          |
| Brand dim        | `--accent-primary-dim` | `rgba(0, 200, 212, 0.12)` |
| Teal panel       | `--teal-dark`          | `#0b1315` (auth left panel) |
| AI accent        | `--accent-ai`          | `#6457f9` (indigo-purple) |
| AI text          | `--accent-ai-text`     | `#8b82ff`                 |
| Error            | `--state-error`        | `#ff4d4f`                 |
| Success          | `--state-success`      | `#34d399`                 |
| Warning          | `--state-warning`      | `#fbbf24`                 |

Tailwind utility names map to these variables. Use `bg-base`, `bg-surface`, `text-copy-primary`, `text-copy-muted`, `border-surface-border`, `text-brand`, `bg-accent-dim`, etc.

## Typography

| Role      | Font       | CSS Variable          |
| --------- | ---------- | --------------------- |
| UI text   | Montserrat | `--font-montserrat`   |
| Code/mono | Montserrat | `--font-montserrat`   |

Montserrat is loaded via `next/font/google` and applied as a CSS variable on the `<html>` element. It is the single typeface for the whole project: both `--font-sans` and `--font-mono` map to it in `@theme inline`, and Clerk's appearance in `lib/clerk-appearance.ts` points its font variables at it too. The base `body` uses it with `antialiased`.

## Border Radius

Radius increases with surface depth — smaller for inner elements, larger for outer containers.

| Context           | Class         |
| ----------------- | ------------- |
| Inline / small UI | `rounded-xl`  |
| Cards / panels    | `rounded-2xl` |
| Modal / overlay   | `rounded-3xl` |

## Canvas

### Node Color Palette

8 defined color pairs. Each pair specifies a dark node fill and a vivid contrasting text color tuned for readability on the dark canvas. Defined in `types/canvas.ts` as `NODE_COLORS`.

| Node fill | Text color | Character              |
| --------- | ---------- | ---------------------- |
| `#1F1F1F` | `#EDEDED`  | Neutral dark (default) |
| `#10233D` | `#52A8FF`  | Blue                   |
| `#2E1938` | `#BF7AF0`  | Purple                 |
| `#331B00` | `#FF990A`  | Orange                 |
| `#3C1618` | `#FF6166`  | Red                    |
| `#3A1726` | `#F75F8F`  | Pink                   |
| `#0F2E18` | `#62C073`  | Green                  |
| `#062822` | `#0AC7B4`  | Teal                   |

Default node color: `#1F1F1F` with `#EDEDED` text.

### Edge Style

Custom `canvasEdge` renderer: smooth-step right-angle path with a closed arrow
marker. The 1.5px stroke has rounded ends and is dimmed to `--text-muted` at
rest, brightening to `--text-secondary` on hover and `--text-primary` when
selected; the arrow marker follows the same color. An invisible 24px
interaction stroke widens the click target without changing the visible
thickness. Edges carry an optional inline label pill at the path midpoint;
hovering the pill also brightens the edge, and double-clicking edits the label
in place.

### Node Shapes

6 supported shapes, defined in `types/canvas.ts` as `NODE_SHAPES`. Complex shapes (diamond, hexagon, cylinder) are rendered as inline SVGs rather than CSS borders.

- `rectangle` — default general-purpose node
- `diamond` — decision / gateway
- `circle` — event / endpoint
- `pill` — service / process
- `cylinder` — database / storage
- `hexagon` — external system / boundary

### Connection Handles

Small white circular handles, hidden by default, revealed on node hover. Appear at all four sides of a node.

### Canvas Background

React Flow `<Background>` component. Canvas sits on the base background color.

### Presence

A display-only collaborator avatar group sits in the canvas top-right corner,
separate from the workspace navbar. Up to five 32px avatars overlap in a stack
with a `+N` chip for overflow; missing photos fall back to initials, and every
avatar has a subtle ring against the canvas. The divider and the Clerk
`UserButton` follow the avatars, and the divider appears only when at least one
collaborator is present. The current user is shown by that `UserButton`, never
by a duplicate presence avatar. The workspace navbar omits the Clerk
`UserButton` so the menu is not shown twice; the shared `EditorNavbar` keeps it
for the editor home. While the room is connecting or fails to connect,
`WorkspaceShell` renders the same account menu in the canvas corner so it stays
reachable, and the avatar group steps left of the open AI sidebar on `lg`
instead of sitting underneath it.

Other participants' cursors render as small colored pointers with a name badge,
using each participant's presence color. Cursors follow the canvas coordinate
system while keeping a constant screen size.

## Component Library

matos-ui on top of Tailwind. No custom design system.

Installed primitives:

| Role      | Component                                                                        | Path                             |
| --------- | -------------------------------------------------------------------------------- | -------------------------------- |
| Button    | `Button`                                                                         | `components/matos-ui/button.tsx` |
| Card      | `SpotlightCard` + `SpotlightCardHeader` / `Content` / `Footer`                   | `components/matos-ui/spotlight-card.tsx` |
| Dialog    | `StackedDialog` + `Trigger` / `Content` / `Header` / `Title` / `Description` / `Footer` / `Close` | `components/matos-ui/stacked-dialog.tsx` |
| Tabs      | `MotionTabs` (item-driven `items` prop)                                          | `components/matos-ui/motion-tabs.tsx` |
| Input     | `Input`                                                                          | `components/matos-ui/input.tsx`  |
| Textarea  | `Textarea`                                                                       | `components/matos-ui/textarea.tsx` |
| Scroll    | `ScrollArea`                                                                     | `components/ui/scroll-area.tsx`  |

- matos-ui source components live in `components/matos-ui/` (their registry target).
- shadcn/ui primitives live in `components/ui/`.
- Card, dialog and tabs are the matos-ui implementations above. shadcn's `card`, `dialog` and `tabs` are intentionally not installed — do not add or import them.
- The AI Workspace sidebar imports the Radix `Tabs` primitive directly from `radix-ui` for its compact full-height tab layout. `MotionTabs` remains the default for standalone tabbed surfaces; the shadcn tabs file stays uninstalled.
- Add new components with the shadcn CLI (`npx shadcn add @matos/<name>` for matos-ui items, or the default shadcn registry for primitives matos-ui does not publish).
- Generated component files are protected — do not edit them after installation.
- `lib/utils.ts` exports the shared `cn()` helper for project code. Generated components import the `cn` package directly.
- Semantic theme tokens (`background`, `foreground`, `card`, `border`, `primary`, `ring`, etc.) are mapped to the project palette in `globals.css`, so installed components render on the dark theme without overrides.

## Elevation

matos-ui surfaces lift along an eight-step ladder instead of using a single card background.

- `--surface-1` … `--surface-8` and `--shadow-1` … `--shadow-8` are defined in `globals.css` from the project palette (dark values only, no light ladder).
- `Elevated` (`components/matos-ui/elevated.tsx`) renders a panel at `min(substrate + offset, 8)` and re-provides that level to its children; `useSurface()` reads the current substrate and `SurfaceProvider` sets a new base.
- Conventional offsets: `2` for dropdowns/popovers, `4` for dialogs. `StackedDialog` and `MotionTabs` already wrap themselves in `Elevated` — do not put a `bg-*` surface behind them.
- The ladder is what makes nested overlays readable on the dark background, so app-level panels should use `bg-surface-N` / `shadow-surface-N` rather than `bg-elevated` when they participate in the stack.

## Layout Patterns

- Editor workspace: full-viewport layout — floating sidebar overlay on the left, center canvas, slide-over AI sidebar on the right. The `/editor` home state centers a minimal column (heading, one-line description, primary button) inside the canvas area — no card wrapper. Below `lg`, an open sidebar renders a backdrop scrim that closes it when tapped. The project list highlights the open room with `bg-accent-dim` / `text-brand` and `aria-current="page"`. A project the viewer cannot open renders the shared `AccessDenied` panel (lock chip, short message, link back to `/editor`) instead of the workspace.
- AI Workspace sidebar: floating `bg-base/95` panel with the existing right-side slide animation. Header shows a bot chip, `AI Workspace` / `Collaborate with Shadowmesh`, and a close button. Two tabs (`AI Architect`, `Specs`) use `bg-brand-dim` / `text-brand` when active and `text-copy-muted` otherwise. The chat tab has a scrollable empty state with three starter pills, user bubbles on `bg-brand-dim` with a `border-brand/50` border, assistant bubbles on `bg-elevated` with `text-ai-text`, and an auto-growing composer. The Specs tab has a full-width accent `Generate Spec` button and a static elevated spec card with a disabled download action.
- Workspace navbar actions include `Templates`, which opens a `StackedDialog` with a scrollable grid of predefined starter templates. Each card shows a lightweight, bounds-fitted diagram preview (240×132 maximum, shrinking with the card) plus its name and description; importing replaces the whole canvas and closes the dialog.
- Workspace navbar actions also include a `Save` button that doubles as the
  canvas autosave indicator: it reads `Save`, `Unsaved`, `Saving…`, `Saved` or
  `Save failed`, turns the label `text-success` / `text-error` for the last two
  states, saves immediately when clicked, and stays disabled until the restore
  attempt settles so it cannot persist the empty room over the saved canvas.
- Sidebars: floating overlay with dark semi-transparent background and subtle border.
- Modals and dialogs: centered overlay, `rounded-3xl`, dark background with backdrop blur.
- Navbar: top bar with dark background and bottom border.
- Auth pages: 50/50 split on `lg` — teal-tinted left panel (`bg-teal-dark`) holding the compact logo, headline, description and an icon-chip feature list, against the near-black `bg-base` right panel with the centered Clerk form. The left panel is hidden below `lg`. Clerk's `dark` theme is themed through `lib/clerk-appearance.ts`, which maps app CSS variables; no literal colors are passed.

## Dialog Pattern

Project dialogs live in `components/editor/` and are all built on
`StackedDialog`: `create-project-dialog` (name input plus live room ID preview),
`rename-project-dialog` (prefilled, auto-focused input; Enter submits via the
form) and `delete-project-dialog` (confirmation only, no input, destructive
styling). Their open state, form value, submitting flag and API `error` come
from `hooks/use-project-actions.ts`; the dialogs themselves stay presentational
and receive values plus callbacks. When a new dialog is needed, compose it the
same way so it inherits the dark palette and the elevation ladder.

The room ID is the project ID: create slugifies the name and appends a random
six-character suffix (`payments-platform-k3f9q2`) and previews the result in the
dialog. Create therefore requires a name with at least one letter or number,
since a symbols-only name has an empty slug; rename only requires a non-blank
name because it cannot change the room ID. `useProjectActions.submit` repeats
the create check, and every dialog renders the API's `{ error }` message when a
request fails.

- `StackedDialog` owns open state. `StackedDialogTrigger` and `StackedDialogClose`
  use Base UI's `render` prop to wrap a matos-ui `Button`.
- `StackedDialogContent` supplies the backdrop, the elevated surface
  (`bg-surface-N` + `shadow-surface-N` at offset 4), the entrance/exit motion and
  the top-right close button. Do not put a `bg-*` surface behind it.
- Backdrop and popup are both animated with framer from the same `open` flag, and
  the portal is `keepMounted` so the JS exit can finish before it unmounts.
  Do not add CSS enter/exit animation classes to the backdrop: Base UI ends the
  portal when the popup's CSS animations finish, which leaves a CSS-driven
  backdrop painted after the popup is gone (a full-screen black flash on close).
- `StackedDialogHeader` holds `StackedDialogTitle` and `StackedDialogDescription`.
  The title uses `text-foreground`, the description `text-muted-foreground`.
- `StackedDialogFooter` holds the actions, right-aligned: cancel/secondary first,
  the primary action last. A destructive confirmation uses `variant="destructive"`
  on the action and `variant="danger"` on `StackedDialogContent`.

```tsx
<StackedDialog>
  <StackedDialogTrigger render={<Button>New Project</Button>} />
  <StackedDialogContent>
    <StackedDialogHeader>
      <StackedDialogTitle>New Project</StackedDialogTitle>
      <StackedDialogDescription>
        Give your system a name to get started.
      </StackedDialogDescription>
    </StackedDialogHeader>

    {/* form fields */}

    <StackedDialogFooter>
      <StackedDialogClose render={<Button variant="secondary">Cancel</Button>} />
      <Button>Create project</Button>
    </StackedDialogFooter>
  </StackedDialogContent>
</StackedDialog>
```

## Icons

`lucide-animated` (`XIcon`, `PlusIcon`, …). Stroke-based icons only — no filled
variants. These components render a wrapper `<div>` whose inner `<svg>` is sized
by the `size` prop, so size them with `size={n}` — `16` inline and in inputs,
`20` in icon buttons, `32` in empty-state art. A `size-*` class only shrinks the
wrapper and lets the default 28px SVG overflow, which reads as an off-center
glyph. Icons also render a `<div>`, so never place one inside a `<p>`.
