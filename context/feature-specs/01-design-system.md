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

Also Install `lucide-react`.

Create `lib/utils.ts` with a reusable `cn()` helper for merging Tailwind classes.

Ensure all components match the existing dark theme in `globals.css`.

### Check when done

- All components import without errors
- `cn()` works properly
- No default light styling appears
