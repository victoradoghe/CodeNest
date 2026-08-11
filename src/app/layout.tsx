import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import SiteHeader from "@/components/SiteHeader";
import { themeBootScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: {
    default: "Travis Software — Learn Python Offline",
    template: "%s · Travis Software",
  },
  description:
    "A complete, self-contained Python course that runs entirely in your browser. Real Python execution, interactive exercises, and quizzes — no internet connection required.",
  applicationName: "Travis Software",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1116" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {/* Sets the theme before first paint so there is no colour flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <footer className="no-print border-t border-border py-6 text-center text-xs text-muted">
            <p>
              Travis Software · Python runs locally in your browser via
              WebAssembly · works offline
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
