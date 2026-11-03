Read `AGENTS.md` before starting.

We're adding the design system and UI primitive components.

Install and configure `matos-ui`.

Add these matos-ui components:

- Button
- Card
- Dialog
- Input
- Tabs
- Textarea
- ScrollArea

matos-ui publishes these as `button`, `input`, `textarea`, `spotlight-card`
(its Card), `stacked-dialog` (its Dialog) and `motion-tabs` (its Tabs). It has
no `scroll-area` item, so ScrollArea comes from the shadcn/ui registry.

Do not modify the generated `components/ui/*` files after installation.

Replace `lucide-react` with `lucide-animated` across the entire project.
  Update all icon imports from `lucide-react` to `lucide-animated` (e.g.
  `Boxes` → `BoxesIcon`, `X` → `XIcon`) and update all JSX usage accordingly.

Create `lib/utils.ts` with a reusable `cn()` helper for merging Tailwind classes.

### Icon Setup

- All icon imports use `lucide-animated` (with `Icon` suffix).
- Update existing icons: `Boxes` → `BoxesIcon`, `X` → `XIcon`, etc.
- Replace any remaining `lucide-react` imports with `lucide-animated` equivalents.

Ensure all components match the existing dark theme in `globals.css`.

### Icon Setup

- All icon imports use `lucide-animated` (with `Icon` suffix).
- Update existing icons: `Boxes` → `BoxesIcon`, `X` → `XIcon`, etc.
- Replace any remaining `lucide-react` imports with `lucide-animated` equivalents.
- `field.tsx` uses `BadgeAlertIcon` and `CheckCheckIcon` from `lucide-animated` for validation states.

### Check when done

- All components import without errors- `cn()` works properly- No default light styling appears- All icons use `lucide-animated` names with `Icon` suffix
- Components using `framer-motion` have `"use client"` directive at the top- `useReducedMotion`, `useExitAnimation`, and other motion hooks are safely client-only