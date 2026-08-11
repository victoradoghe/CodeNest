"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import PythonStatus from "./PythonStatus";

const NAV = [
  { href: "/learn", label: "Course" },
  { href: "/playground", label: "Playground" },
  { href: "/reference", label: "Reference" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[15px] font-bold"
            style={{
              background: "linear-gradient(135deg,#3776ab 45%,#ffd43b 45%)",
              color: "#fff",
            }}
            aria-hidden
          >
            C
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            CodeNest
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 sm:flex" aria-label="Main">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-2.5 py-1.5 text-[13.5px] transition-colors ${
                  active
                    ? "bg-surface-2 font-medium text-fg"
                    : "text-muted hover:bg-surface-2 hover:text-fg"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <PythonStatus />
          <ThemeToggle />
        </div>
      </div>

      {/* Compact nav for small screens */}
      <nav
        className="flex items-center gap-1 border-t border-border px-4 py-1.5 sm:hidden"
        aria-label="Main, compact"
      >
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-2.5 py-1 text-[13px] ${
                active ? "bg-surface-2 font-medium" : "text-muted"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
