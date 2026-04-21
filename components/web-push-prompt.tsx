"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Browser push opt-in. Requires NEXT_PUBLIC_VAPID_PUBLIC_KEY (see .env.example).
 * Sending pushes happens server-side / Edge with the private VAPID key + web-push (not bundled here).
 */
export function WebPushPrompt() {
  const [busy, setBusy] = useState(false);
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  async function enablePush() {
    if (!vapid) {
      toast.error("VAPID public key is not configured yet.");
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Push notifications are not supported in this browser.");
      return;
    }
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
      const json = sub.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || res.statusText);
      }
      toast.success("You will receive gentle nudges when we go live.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not enable notifications.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Web push (PWA)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          Install the church app from your browser menu, then enable notifications here for “Live now” and reminder
          alerts.
        </p>
        {!vapid ? (
          <p className="rounded-md bg-muted px-2 py-1 text-xs">
            Add <code className="font-mono">NEXT_PUBLIC_VAPID_PUBLIC_KEY</code> from{" "}
            <code className="font-mono">npx web-push generate-vapid-keys</code>.
          </p>
        ) : null}
        <Button type="button" onClick={() => void enablePush()} disabled={busy}>
          {busy ? "Working…" : "Enable web push on this device"}
        </Button>
      </CardContent>
    </Card>
  );
}
