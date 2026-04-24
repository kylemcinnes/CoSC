import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_NAME, getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Join the family",
  description: `Create your ${SITE_NAME} profile, choose how we can encourage you, and step into community.`,
  alternates: { canonical: `${getSiteUrl()}/register` },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pending = typeof sp.pending === "string" ? sp.pending : undefined;
  const err = typeof sp.error === "string" ? sp.error : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
      <header className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-semibold text-primary sm:text-4xl">Join the family</h1>
        <p className="text-muted-foreground">
          A gentle step toward prayer, Scripture, and people who will walk with you.
        </p>
      </header>

      {err === "auth" ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          Something went wrong while signing you in. Please try again.
        </p>
      ) : null}

      {pending === "email" ? (
        <Card className="border-brand-gold/30 bg-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-primary">Check your email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              If your Supabase project requires email confirmation, open the link we sent to verify your address, then
              sign in from the auth flow your team configures.
            </p>
            <p>
              After you are signed in, you can set notification preferences on your dashboard or right on the home page
              after joining.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {pending === "both" ? (
        <Card className="border-brand-gold/30 bg-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-primary">Almost there</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>We sent a magic link to your email and an SMS code to your phone (if SMS is enabled in the project).</p>
            <p>Open the email link to finish signing in. If you prefer SMS-only next time, leave the email field blank.</p>
          </CardContent>
        </Card>
      ) : null}

      <RegisterForm />

      <p className="text-center text-xs text-muted-foreground">
        Already joined?{" "}
        <Link className="font-medium text-brand-teal underline-offset-4 hover:underline" href="/dashboard">
          Go to your dashboard
        </Link>
        .
      </p>
    </div>
  );
}
