import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-mono text-sm text-muted">NameError</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        That page is not defined
      </h1>
      <p className="mt-3 text-muted">
        The link may be out of date, or the lesson may have been renamed.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/learn"
          className="rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-fg hover:opacity-90"
        >
          Course outline
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-border px-4 py-2.5 font-medium hover:bg-surface-2"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
