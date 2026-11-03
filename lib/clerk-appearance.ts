import type { Appearance } from "@clerk/ui";
import { dark } from "@clerk/ui/themes";

/**
 * Clerk appearance built on the `dark` theme, with every color mapped to a
 * token from `app/globals.css`. No literal colors are defined here.
 */
export const clerkAppearance: Appearance = {
  theme: dark,
  variables: {
    colorPrimary: "var(--accent-primary)",
    colorPrimaryForeground: "var(--bg-base)",
    colorBackground: "var(--bg-surface)",
    colorForeground: "var(--text-primary)",
    colorMuted: "var(--bg-subtle)",
    colorMutedForeground: "var(--text-muted)",
    colorInput: "var(--bg-elevated)",
    colorInputForeground: "var(--text-primary)",
    colorBorder: "var(--border-default)",
    colorRing: "var(--accent-primary)",
    colorDanger: "var(--state-error)",
    colorSuccess: "var(--state-success)",
    colorWarning: "var(--state-warning)",
    colorShadow: "var(--bg-base)",
    colorModalBackdrop: "var(--bg-base)",
    fontFamily: "var(--font-montserrat)",
    fontFamilyButtons: "var(--font-montserrat)",
    fontFamilyMono: "var(--font-montserrat)",
    borderRadius: "var(--radius)",
  },
};
