import type { Metadata } from "next";
import Playground from "@/components/Playground";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Write and run Python in your browser. Real CPython via WebAssembly, no internet connection required.",
};

export default function PlaygroundPage() {
  return (
    <div className="mx-auto flex h-[calc(100vh-8.5rem)] max-w-[1100px] flex-col px-4 py-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Playground</h1>
        <p className="mt-1 text-sm text-muted">
          A scratchpad for trying things out. Press{" "}
          <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[11px]">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[11px]">
            Enter
          </kbd>{" "}
          to run. Programs that need <code>input()</code> read from the stdin
          panel.
        </p>
      </header>

      <div className="min-h-0 flex-1">
        <Playground />
      </div>
    </div>
  );
}
