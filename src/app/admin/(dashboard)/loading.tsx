import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder while an admin screen loads. Matches the page header rhythm. */
export default function AdminLoading() {
  return (
    <div
      className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>

      <div className="border-b border-border pb-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="mt-3 h-4 w-full max-w-lg rounded-lg" />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
