import { Skeleton } from "@/components/ui/skeleton";

export default function EventsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-24 max-w-2xl" />
      <Skeleton className="h-48 w-full" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}
