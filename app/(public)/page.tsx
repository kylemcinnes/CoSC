import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, HeartHandshake, PlayCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { HeroIllustration } from "@/components/hero-illustration";
import { createClient } from "@/lib/supabase/server";
import { sermonThumbnailUrl } from "@/lib/media";
import { SITE_TAGLINE, SITE_NAME } from "@/lib/site";

import { cn } from "@/lib/utils";

export const revalidate = 60;

async function HomeContent() {
  const supabase = await createClient();

  const [{ data: latestSermon }, { data: nextEvent }] = await Promise.all([
    supabase.from("sermons").select("*").order("preached_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("events").select("*").order("starts_at", { ascending: true }).limit(1).maybeSingle(),
  ]);

  const thumbUrl = latestSermon ? await sermonThumbnailUrl(latestSermon.thumbnail_path) : null;

  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-background to-accent/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-teal">GTA · Port Credit · Mississauga</p>
            <h1 className="font-heading text-4xl font-semibold leading-tight text-primary sm:text-5xl">
              {SITE_NAME}
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">{SITE_TAGLINE}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "inline-flex items-center justify-center gap-2 border border-brand-gold/40 shadow-sm",
                )}
              >
                Join the family
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/live" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "inline-flex gap-2")}>
                <PlayCircle className="size-4" aria-hidden />
                Watch live
              </Link>
            </div>
            {nextEvent ? (
              <p className="text-sm text-muted-foreground">
                Next gathering:{" "}
                <span className="font-medium text-foreground">{nextEvent.title}</span> —{" "}
                {new Date(nextEvent.starts_at).toLocaleString("en-CA", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Gathering times are posted here as soon as they are finalized.</p>
            )}
          </div>
          <HeroIllustration className="w-full rounded-2xl border border-border/60 bg-card shadow-sm" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-primary">Who we are</h2>
            <p className="text-sm text-muted-foreground">A people shaped by grace, not performance.</p>
          </div>
          <HeartHandshake className="size-8 text-brand-gold" aria-hidden />
        </div>
        <Separator />
        <div className="prose prose-neutral max-w-none text-muted-foreground prose-p:leading-relaxed">
          <p>
            Under the pastoral leadership of <strong className="text-foreground">Pastor Frank Juarez</strong>, Church of
            Second Chances exists to lift up the name of Jesus among neighbors across the GTA — especially those who feel
            overlooked, weighed down by addiction, or like the “prodigal” who is not sure there is still a seat at the
            table.
          </p>
          <p>
            We believe the gospel is good news for the broken: Christ receives sinners, restores dignity, and walks with
            us into newness of life. We are not a polished performance; we are a family learning to love one another with
            the patience God has shown us.
          </p>
          <p>
            Whether you are exploring faith, returning home, or simply hungry for Scripture-fed hope, you are welcome here.
            Jesus still says, <em>“Come to me…”</em> — and we want Port Credit to hear that invitation clearly.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-heading text-2xl font-semibold text-primary">Latest word</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Feed your spirit on the go — most of our family joins from their phones.
            </p>
            {latestSermon ? (
              <Card className="mt-6 overflow-hidden border-border/80 shadow-sm">
                {thumbUrl ? (
                  <div className="relative aspect-video w-full bg-muted">
                    <Image
                      src={thumbUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  </div>
                ) : null}
                <CardHeader>
                  <CardTitle className="font-heading text-xl">{latestSermon.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(latestSermon.preached_at).toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {latestSermon.description ||
                      "Gather with us as we open Scripture and lift up Jesus — the author of every true second chance."}
                  </p>
                  <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                    <Link href={`/sermons/${latestSermon.id}`} className={cn(buttonVariants(), "w-full sm:w-auto")}>
                      View sermon
                    </Link>
                    <Link href="/sermons" className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}>
                      Browse archive
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mt-6 border-dashed">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Sermons will appear here once uploaded in the admin tools.
                </CardContent>
              </Card>
            )}
          </div>
          <Card className="border-brand-gold/25 bg-primary text-primary-foreground shadow-md">
            <CardHeader>
              <CardTitle className="font-heading text-lg text-brand-gold">Join us in person</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-primary-foreground/90">
              <p>Port Credit, Mississauga — details for room location and parking are shared in our gatherings newsletter.</p>
              <p>Prefer online? Tap “Watch live” when we are streaming.</p>
              <Link href="/register" className={cn(buttonVariants({ variant: "secondary" }), "mt-2 w-full")}>
                Stay in the loop
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

function HomeFallback() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:px-6">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
