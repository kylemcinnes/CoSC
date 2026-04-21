import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { sermonThumbnailUrl } from "@/lib/media";
import { SITE_NAME, getSiteUrl } from "@/lib/site";
import type { TranscriptSegment } from "@/types/database";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("sermons").select("title, description, preached_at").eq("id", id).maybeSingle();
  if (!data) return { title: "Sermon" };
  return {
    title: data.title,
    description: data.description ?? `${SITE_NAME} sermon from ${data.preached_at}.`,
    alternates: { canonical: `${getSiteUrl()}/sermons/${id}` },
  };
}

function formatTimestamp(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default async function SermonDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: sermon } = await supabase.from("sermons").select("*").eq("id", id).maybeSingle();
  if (!sermon) notFound();

  const thumbUrl = await sermonThumbnailUrl(sermon.thumbnail_path);
  const transcript = (sermon.transcript ?? []) as TranscriptSegment[];

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <Link href="/sermons" className="text-sm font-medium text-brand-teal underline-offset-4 hover:underline">
        ← Back to archive
      </Link>

      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {new Date(sermon.preached_at).toLocaleDateString("en-CA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="font-heading text-3xl font-semibold text-primary sm:text-4xl">{sermon.title}</h1>
        <div className="flex flex-wrap gap-2">
          {sermon.tags?.map((t) => (
            <Badge key={t} variant="secondary">
              {t}
            </Badge>
          ))}
        </div>
      </header>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {sermon.video_url ? (
            <div className="aspect-video w-full bg-black">
              <video className="size-full" controls src={sermon.video_url} poster={thumbUrl ?? undefined}>
                <track kind="captions" />
              </video>
            </div>
          ) : sermon.audio_url ? (
            <div className="space-y-3 p-4">
              {thumbUrl ? (
                <Image
                  src={thumbUrl}
                  alt=""
                  width={640}
                  height={360}
                  className="mx-auto max-h-48 w-auto rounded-lg object-cover"
                />
              ) : null}
              <audio className="w-full" controls src={sermon.audio_url} />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center bg-muted text-sm text-muted-foreground">
              Upload a video or audio URL from the admin console to enable playback here.
            </div>
          )}
        </CardContent>
      </Card>

      {sermon.key_verses?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Key Scriptures</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            <ul className="list-disc space-y-1 pl-5">
              {sermon.key_verses.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Separator />

      <section aria-label="Transcript">
        <h2 className="font-heading text-xl font-semibold text-primary">Transcript</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Timestamped segments support future “jump to moment” UX once Whisper (or similar) is wired in the admin
          pipeline.
        </p>
        {transcript.length ? (
          <ol className="mt-4 space-y-3 text-sm leading-relaxed">
            {transcript.map((line, idx) => (
              <li key={`${line.offsetSec}-${idx}`} className="flex gap-3">
                <span className="w-14 shrink-0 font-mono text-xs text-brand-teal">{formatTimestamp(line.offsetSec)}</span>
                <span className="text-foreground">{line.text}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Transcript not available for this message yet.
          </p>
        )}
      </section>
    </div>
  );
}
