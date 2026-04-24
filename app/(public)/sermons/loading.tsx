import { Skeleton } from "@/components/ui/skeleton";

export default function SermonsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-24 w-full max-w-4xl" />
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
