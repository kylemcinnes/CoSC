import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { signOut } from "@/app/actions/auth";
import { updateNotificationPreferences } from "@/app/actions/profile";
import { NotificationPreferences } from "@/components/notification-preferences";
import { WelcomeToast } from "@/components/welcome-toast";
import { WebPushPrompt } from "@/components/web-push-prompt";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";

import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My dashboard",
  alternates: { canonical: `${getSiteUrl()}/dashboard` },
};

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12 sm:px-6">
      <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 text-brand-teal")}>
        ← Back to home
      </Link>

      <Suspense>
        <WelcomeToast />
      </Suspense>

      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-primary">Welcome home</h1>
        <p className="text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">{user.email ?? user.phone ?? profile?.email}</span>
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">How we can reach you</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateNotificationPreferences} className="space-y-6">
            <NotificationPreferences
              idPrefix="dash"
              defaults={{
                email: profile?.notify_email ?? true,
                sms: profile?.notify_sms ?? false,
                push: profile?.notify_push ?? false,
              }}
            />
            <Button type="submit">Save preferences</Button>
          </form>
        </CardContent>
      </Card>

      <WebPushPrompt />

      <Separator />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/live" className={cn(buttonVariants({ variant: "outline" }), "inline-flex justify-center")}>
          Go to live worship
        </Link>
        <Link href="/sermons" className={cn(buttonVariants({ variant: "outline" }), "inline-flex justify-center")}>
          Browse sermons
        </Link>
      </div>

      <form action={signOut}>
        <Button type="submit" variant="secondary">
          Sign out
        </Button>
      </form>
    </div>
  );
}
