import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getNextSundayServiceToronto } from "@/lib/sunday-toronto";

import { cn } from "@/lib/utils";

function formatEastern(iso: string) {
  return new Date(iso).toLocaleString("en-CA", {
    timeZone: "America/Toronto",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "shortGeneric",
  });
}

type Props = {
  /** When true, show a link to the full events page at the bottom. */
  showEventsPageLink?: boolean;
};

/**
 * Upcoming gatherings from `public.events` (ordered by `starts_at`).
 *
 * Reminder fan-out (stub): schedule a Supabase Edge Function on cron (e.g. every 15–60 minutes) that:
 *   • selects events where starts_at is in ~24h / ~1h windows,
 *   • joins eligible profiles (notify_email / notify_sms / notify_push),
 *   • inserts into notification_outbox with type reminder_24h / reminder_1h,
 *   • records dedupe rows in event_reminders_sent.
 */
export async function EventsSection({ showEventsPageLink = true }: Props) {
  const supabase = createClient();
  const nowIso = new Date().toISOString();

  const [{ data: upcoming, error: upErr }, { data: liveRows, error: liveErr }] = await Promise.all([
    supabase.from("events").select("*").gte("starts_at", nowIso).order("starts_at", { ascending: true }).limit(20),
    supabase.from("events").select("*").eq("is_live", true),
  ]);

  const error = upErr ?? liveErr;
  const liveEvent = liveRows?.[0] ?? null;

  const byId = new Map<string, NonNullable<typeof upcoming>[number]>();
  for (const e of upcoming ?? []) {
    byId.set(e.id, e);
  }
  for (const e of liveRows ?? []) {
    byId.set(e.id, e);
  }
  const events = [...byId.values()]
    .sort((a, b) => {
      if (a.is_live !== b.is_live) return a.is_live ? -1 : 1;
      return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
    })
    .slice(0, 12);

  const nextSunday = getNextSundayServiceToronto();
  const nextSundayIso = nextSunday.toISOString();
  const nextSundayLabel = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(nextSunday);

  const highlightedDbEvent = (events ?? []).find((e) => {
    const t = new Date(e.starts_at).getTime();
    const target = nextSunday.getTime();
    return Math.abs(t - target) < 48 * 60 * 60 * 1000;
  });

  return (
    <section className="space-y-6" aria-labelledby="events-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="events-heading" className="font-heading text-2xl font-semibold text-primary">
            Upcoming gatherings
          </h2>
          <p className="text-sm text-muted-foreground">Port Credit, Mississauga — join us in person or online.</p>
        </div>
        {liveEvent?.is_live ? (
          <Link
            href="/live"
            className={cn(
              buttonVariants({ size: "sm" }),
              "inline-flex items-center justify-center gap-2 border border-brand-teal/40 bg-brand-teal/15 text-brand-teal shadow-sm",
            )}
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-teal opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-brand-teal" />
            </span>
            LIVE NOW
          </Link>
        ) : null}
      </div>

      <Card className="border-brand-gold/35 bg-gradient-to-br from-card to-accent/30 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg text-primary">Next Sunday service</CardTitle>
          <p className="text-sm text-muted-foreground">
            We gather Sundays at <strong className="text-foreground">10:00 a.m. Eastern</strong> (Toronto time) unless a
            specific event below says otherwise.
          </p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium text-foreground">{nextSundayLabel}</p>
          {highlightedDbEvent ? (
            <p className="text-muted-foreground">
              Scheduled in our calendar:{" "}
              <span className="font-medium text-foreground">{highlightedDbEvent.title}</span> —{" "}
              {formatEastern(highlightedDbEvent.starts_at)}
            </p>
          ) : (
            <p className="text-muted-foreground">
              Calendar details appear here when an event is added for that Sunday. You can still plan on{" "}
              <time dateTime={nextSundayIso}>10:00 a.m. Eastern</time> as our rhythm.
            </p>
          )}
        </CardContent>
      </Card>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error.message}
        </p>
      ) : null}

      {!events?.length ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
          No upcoming events in the database yet. Admins can add them from{" "}
          <Link href="/admin" className="font-medium text-brand-teal underline-offset-4 hover:underline">
            /admin
          </Link>{" "}
          or the Supabase Table Editor.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {events.map((ev) => (
            <li key={ev.id}>
              <Card className="h-full border-border/80 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <CardTitle className="font-heading text-base text-primary">{ev.title}</CardTitle>
                    {ev.is_live ? (
                      <Link
                        href="/live"
                        className="shrink-0 rounded-full bg-brand-teal/15 px-2 py-0.5 text-xs font-semibold text-brand-teal"
                      >
                        LIVE NOW
                      </Link>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">{formatEastern(ev.starts_at)}</p>
                </CardHeader>
                {ev.description ? (
                  <CardContent className="pt-0 text-sm text-muted-foreground line-clamp-3">{ev.description}</CardContent>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}

      {showEventsPageLink ? (
        <div className="flex justify-end">
          <Link href="/events" className={cn(buttonVariants({ variant: "outline" }), "text-sm")}>
            Full events list
          </Link>
        </div>
      ) : null}
    </section>
  );
}
