"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VerifyPhoneForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    setPending(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.replace("/dashboard?welcome=1");
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4">
      {message ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {message}
        </p>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          required
          autoComplete="tel"
          placeholder="+14165550100"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="token">SMS code</Label>
        <Input
          id="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          inputMode="numeric"
          required
          placeholder="123456"
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Verifying…" : "Verify and continue"}
      </Button>
    </form>
  );
}
