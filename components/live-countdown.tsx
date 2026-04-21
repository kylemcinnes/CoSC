"use client";

import { useEffect, useMemo, useState } from "react";
import { differenceInSeconds } from "date-fns";

function formatRemaining(totalSeconds: number) {
  if (totalSeconds <= 0) return null;
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [
    days ? `${days}d` : null,
    hours ? `${hours}h` : null,
    minutes ? `${minutes}m` : null,
    `${seconds}s`,
  ].filter(Boolean);
  return parts.join(" ");
}

export function LiveCountdown({ startsAtIso }: { startsAtIso: string }) {
  const target = useMemo(() => new Date(startsAtIso), [startsAtIso]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remaining = differenceInSeconds(target, now);
  if (remaining <= 0) {
    return <p className="text-sm text-muted-foreground">We are opening the digital doors — refresh in a moment.</p>;
  }

  return (
    <p className="font-mono text-2xl font-medium tracking-tight text-foreground sm:text-3xl" aria-live="polite">
      {formatRemaining(remaining)}
    </p>
  );
}
