"use client";

import { useFormState, useFormStatus } from "react-dom";

import { type RegisterState, registerWithSupabase } from "@/app/actions/register";
import { NotificationPreferences } from "@/components/notification-preferences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
      {pending ? "Sending…" : "Join the family"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, action] = useFormState<RegisterState, FormData>(registerWithSupabase, null);

  return (
    <form action={action} className="mx-auto max-w-lg space-y-6">
      {state?.ok === false && state.message ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="fullName">Name (optional)</Label>
        <Input id="fullName" name="fullName" autoComplete="name" placeholder="Your name" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email (optional but encouraged)</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone (optional — SMS when enabled)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+1… (E.164 recommended for Twilio)"
        />
        <p className="text-xs text-muted-foreground">
          Use international format (e.g. +14165550100) so SMS OTP can be delivered reliably.
        </p>
      </div>
      <NotificationPreferences idPrefix="reg" />
      <SubmitButton />
    </form>
  );
}
