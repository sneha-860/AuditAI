"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LeadCapture() {
  return (
    <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
      <Input type="email" placeholder="work@email.com" aria-label="Work email" />
      <Button type="submit">Send full report</Button>
    </form>
  );
}
