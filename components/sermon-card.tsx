import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { Database } from "@/types/database";

type Sermon = Database["public"]["Tables"]["sermons"]["Row"];

function formatDuration(seconds: number | null) {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function SermonCard({ sermon, thumbUrl }: { sermon: Sermon; thumbUrl: string | null }) {
  const href = `/sermons/${sermon.id}`;
  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="relative aspect-video w-full bg-muted">
          {thumbUrl ? (
            <Image src={thumbUrl} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-accent to-secondary">
              <BookOpen className="size-10 text-brand-teal" aria-hidden />
            </div>
          )}
        </div>
        <CardHeader className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {new Date(sermon.preached_at).toLocaleDateString("en-CA", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          <h3 className="font-heading text-lg leading-snug text-foreground">{sermon.title}</h3>
        </CardHeader>
      </Link>
      <CardContent className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground">
        {sermon.key_verses?.length ? (
          <p className="line-clamp-2">
            <span className="font-medium text-foreground">Scripture: </span>
            {sermon.key_verses.join(" · ")}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          {sermon.tags?.slice(0, 4).map((t) => (
            <Badge key={t} variant="secondary" className="font-normal">
              {t}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden />
          {formatDuration(sermon.duration_seconds)}
        </span>
        <Link href={href} className="text-sm font-medium text-brand-teal underline-offset-4 hover:underline">
          Open
        </Link>
      </CardFooter>
    </Card>
  );
}
