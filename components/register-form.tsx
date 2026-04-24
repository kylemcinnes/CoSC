"use client";

import { useFormState, useFormStatus } from "react-dom";

import { type RegisterState, registerFamily } from "@/app/actions/register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
      {pending ? "Creating your account…" : "Join the family"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, action] = useFormState<RegisterState, FormData>(registerFamily, null);

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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+1… (E.164 for SMS)"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password (at least 8 characters)</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Choose a secure password"
        />
        <p className="text-xs text-muted-foreground">
          Supabase email sign-up requires a password. You can reset it anytime from the login flow.
        </p>
      </div>
      <SubmitButton />
    </form>
  );
}
