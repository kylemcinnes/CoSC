import type { Metadata } from "next";
import { Suspense } from "react";

import { EventsSection } from "@/components/events-section";
import { Skeleton } from "@/components/ui/skeleton";
import { SITE_NAME, getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events",
  description: `Upcoming gatherings and live worship for ${SITE_NAME} in Port Credit, Mississauga.`,
  alternates: { canonical: `${getSiteUrl()}/events` },
};

export const revalidate = 60;

function EventsFallback() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 sm:px-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  );
}

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-primary sm:text-4xl">Events</h1>
        <p className="max-w-2xl text-muted-foreground">
          Second chances are lived out in community. Here is what is coming up — we would love to see you.
        </p>
      </header>
      <Suspense fallback={<EventsFallback />}>
        <EventsSection showEventsPageLink={false} />
      </Suspense>
    </div>
  );
}
