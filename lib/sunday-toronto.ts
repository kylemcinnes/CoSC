import { TZDate } from "@date-fns/tz";
import { addDays, setHours, setMinutes, setSeconds } from "date-fns";

const TORONTO = "America/Toronto";

/**
 * Next Sunday 10:00 a.m. local time in Mississauga (America/Toronto — Eastern with DST).
 */
export function getNextSundayServiceToronto(reference = new Date()): Date {
  const start = new TZDate(reference, TORONTO);
  for (let delta = 0; delta < 28; delta++) {
    const localDay = addDays(start, delta);
    if (localDay.getDay() !== 0) continue;
    const slot = setSeconds(setMinutes(setHours(localDay, 10), 0), 0);
    if (slot.getTime() <= reference.getTime()) continue;
    return new Date(slot.getTime());
  }
  return new Date(addDays(start, 7).getTime());
}
