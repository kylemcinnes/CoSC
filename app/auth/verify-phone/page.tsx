import type { Metadata } from "next";

import { VerifyPhoneForm } from "@/app/auth/verify-phone/verify-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Verify phone",
  robots: { index: false, follow: false },
  alternates: { canonical: `${getSiteUrl()}/auth/verify-phone` },
};

export default function VerifyPhonePage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Enter your SMS code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Use the same phone number you submitted on the registration form, plus the code we texted you.</p>
          <VerifyPhoneForm />
        </CardContent>
      </Card>
    </div>
  );
}
