"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to `events` row changes via Supabase Realtime so /live updates when `is_live` toggles.
 * Requires `alter publication supabase_realtime add table public.events` (see schema.sql).
 */
export function LiveRealtimeBridge() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("public:events-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
