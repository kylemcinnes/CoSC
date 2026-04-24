"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Database } from "@/types/database";

import { cn } from "@/lib/utils";

type Sermon = Database["public"]["Tables"]["sermons"]["Row"];

function formatDuration(seconds: number | null) {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function SermonCard({ sermon, thumbUrl }: { sermon: Sermon; thumbUrl: string | null }) {
  const [open, setOpen] = useState(false);
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
          <div className="flex flex-wrap gap-1.5">
            {sermon.key_verses.slice(0, 4).map((v) => (
              <Badge key={v} variant="outline" className="font-normal">
                {v}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          {sermon.tags?.slice(0, 5).map((t) => (
            <Badge key={t} variant="secondary" className="font-normal">
              {t}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden />
          {formatDuration(sermon.duration_seconds)}
        </span>
        <div className="flex flex-wrap gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size="sm" />}>Watch</DialogTrigger>
            <DialogContent className="max-w-3xl sm:max-w-3xl" showCloseButton>
              <DialogHeader>
                <DialogTitle className="pr-8">{sermon.title}</DialogTitle>
                <DialogDescription>
                  {new Date(sermon.preached_at).toLocaleDateString("en-CA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {sermon.video_url ? (
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                    <video className="size-full" controls src={sermon.video_url} poster={thumbUrl ?? undefined}>
                      <track kind="captions" />
                    </video>
                  </div>
                ) : sermon.audio_url ? (
                  <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                    {thumbUrl ? (
                      <Image
                        src={thumbUrl}
                        alt=""
                        width={640}
                        height={360}
                        className="mx-auto max-h-48 w-auto rounded-md object-cover"
                      />
                    ) : null}
                    <audio className="w-full" controls src={sermon.audio_url} />
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                    Media URL not set yet. Open the full sermon page for notes once video is published.
                  </p>
                )}
                <Link href={href} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex w-full sm:w-auto")}>
                  Open full sermon page
                </Link>
              </div>
            </DialogContent>
          </Dialog>
          <Link href={href} className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "text-brand-teal")}>
            Details
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
