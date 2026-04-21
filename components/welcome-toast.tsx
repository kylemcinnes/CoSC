"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

/** Shows a gentle welcome after magic-link redirect (?welcome=1). */
export function WelcomeToast() {
  const params = useSearchParams();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    if (params.get("welcome") === "1") {
      shown.current = true;
      toast.success("You are home. Peace to you in Christ.", {
        description: "We are grateful you joined the family. You can update notification preferences below.",
      });
    }
  }, [params]);

  return null;
}
