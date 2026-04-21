import type { Metadata } from "next";

import { LiveCountdown } from "@/components/live-countdown";
import { LiveRealtimeBridge } from "@/components/live-realtime-bridge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { SITE_NAME, getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Live",
  description: `Join ${SITE_NAME} online for worship and the preaching of God’s Word.`,
  alternates: { canonical: `${getSiteUrl()}/live` },
};

export const revalidate = 15;

export default async function LivePage() {
  const supabase = await createClient();
  const { data: liveEvent } = await supabase.from("events").select("*").eq("is_live", true).maybeSingle();

  const { data: upcoming } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const focus = liveEvent ?? upcoming;
  const isLive = Boolean(liveEvent);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <LiveRealtimeBridge />
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-primary sm:text-4xl">Live worship</h1>
        <p className="max-w-2xl text-muted-foreground">
          We gather around Christ — whether you are with us in Port Credit or tuning in from across the GTA.
        </p>
      </header>

      {!isLive && focus?.starts_at ? (
        <Card className="border-brand-gold/30 bg-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Starting soon</CardTitle>
            <p className="text-sm text-muted-foreground">{focus.title}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Countdown</p>
            <LiveCountdown startsAtIso={focus.starts_at} />
          </CardContent>
        </Card>
      ) : null}

      {isLive ? (
        <p className="inline-flex items-center gap-2 rounded-full bg-brand-teal/15 px-3 py-1 text-sm font-medium text-brand-teal">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-teal opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-brand-teal" />
          </span>
          Live now
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          When the stream is live, this page will highlight the player below. Admins toggle `is_live` on the current event
          in Supabase or the admin console.
        </p>
      )}

      <section aria-label="Video player" className="overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
        {/*
          Owncast embed: replace `src` with your self-hosted Owncast URL when ready, e.g.
          https://stream.churchofsecondchances.ca/embed/video
        */}
        <div className="relative aspect-video w-full">
          <iframe
            title="Church live stream"
            className="absolute inset-0 size-full"
            src="about:blank"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Live chat</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {/*
            Owncast chat embed: when streaming, paste the Owncast chat iframe here (read-only or moderated),
            or integrate your preferred chat provider.
          */}
          <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 p-4 text-center">
            Chat will appear here alongside the Owncast stream.
          </div>
        </CardContent>
      </Card>

      <Separator />

      <section className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        <h2 className="font-heading text-lg font-semibold text-foreground">Join us in person</h2>
        <p>
          We love worshiping with our online family, and we would be glad to meet you face to face in{" "}
          <strong className="text-foreground">Port Credit, Mississauga</strong>. Practical details (parking, entrance, kids)
          are shared by email/SMS when you join the family.
        </p>
      </section>
    </div>
  );
}
