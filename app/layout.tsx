import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

import { clerkAppearance } from "@/lib/clerk-appearance";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shadowmesh",
  description: "Design systems at the speed of thought.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider ui={ui} appearance={clerkAppearance}>
      <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
