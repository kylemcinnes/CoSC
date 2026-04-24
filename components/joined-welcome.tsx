"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { updateNotificationPreferences } from "@/app/actions/profile";
import { NotificationPreferences } from "@/components/notification-preferences";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Prefs = {
  notify_email: boolean;
  notify_sms: boolean;
  notify_push: boolean;
};

/**
 * After sign-up redirect (?joined=1): welcome toast + notification preferences (saved to public.profiles).
 */
export function JoinedWelcome({ prefs }: { prefs: Prefs | null }) {
  const params = useSearchParams();
  const welcomeShown = useRef(false);
  const prefsToastShown = useRef(false);

  useEffect(() => {
    if (welcomeShown.current) return;
    if (params.get("joined") !== "1") return;
    welcomeShown.current = true;
    toast.success("Welcome to the Second Chances family!", {
      description: "Christ is building His church — we are glad you are here.",
    });
  }, [params]);

  useEffect(() => {
    if (prefsToastShown.current) return;
    if (params.get("prefs") !== "saved") return;
    prefsToastShown.current = true;
    toast.success("Preferences saved.");
  }, [params]);

  if (params.get("joined") !== "1" || !prefs) {
    return null;
  }

  return (
    <Card className="border-brand-gold/40 bg-card shadow-md">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-primary">How should we reach you?</CardTitle>
        <p className="text-sm text-muted-foreground">
          Email, SMS, and web push are all on by default. Adjust anytime — we will only send what helps you stay close to
          the family.
        </p>
      </CardHeader>
      <CardContent>
        <form action={updateNotificationPreferences} className="space-y-4">
          <input type="hidden" name="next" value="/" />
          <NotificationPreferences
            idPrefix="joined"
            defaults={{
              email: prefs.notify_email,
              sms: prefs.notify_sms,
              push: prefs.notify_push,
            }}
          />
          <Button type="submit" variant="secondary">
            Save preferences
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
