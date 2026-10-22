# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete — Feature 01: Design System

## Current Goal

- Feature 02 is not specified yet.

## Completed

- Project scaffold (Next.js 16 + TypeScript + Tailwind).
- Context files for Ghost AI / Shadowmesh.
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

## In Progress

- None.

## Next Up

- Feature 02 (not yet specified).

## Open Questions

- None blocking. matos-ui publishes no `card`, `dialog`, `tabs` or
  `scroll-area` item under those names; its equivalents are `spotlight-card`,
  `stacked-dialog` and `motion-tabs`, and `scroll-area` still comes from
  shadcn/ui.

## Architecture Decisions

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

## Session Notes

- Latest change (card / dialog / tabs swap):
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
    `stacked-dialog` at surface 5, tabs surface 2 and indicator/panel surface
    3. The route was deleted afterwards.
  - `components/ui/field.tsx`, `label.tsx` and `separator.tsx` are also unused
    leftovers from the initial install; they are not imported anywhere.
- `npm run lint` still reports one error —
  `react-hooks/set-state-in-effect` in the generated `lib/motion-tokens.ts`
  (`useExitAnimation`). It is third-party generated source and was left
  untouched; `tsc --noEmit` and `NODE_ENV=production npm run build` both pass.
