import { Skeleton } from "@/components/ui/skeleton";

export default function LiveLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-24 w-full max-w-xl" />
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <Skeleton className="h-36 w-full" />
    </div>
  );
}
