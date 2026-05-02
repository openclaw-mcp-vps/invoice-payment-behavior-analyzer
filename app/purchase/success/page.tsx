"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function PurchaseSuccessPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function unlockAccess() {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not verify purchase.");
      }

      setSuccess("Access activated. Redirecting to your dashboard...");
      const nextPath =
        new URLSearchParams(window.location.search).get("next") || "/dashboard";
      window.setTimeout(() => {
        window.location.assign(nextPath);
      }, 700);
    } catch (accessError) {
      setError(accessError instanceof Error ? accessError.message : "Could not verify purchase.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Activate Your Access</CardTitle>
          <CardDescription>
            After checkout, enter the same billing email you used in Stripe. We verify the purchase and set your
            access cookie.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#c9d1d9]" htmlFor="email">
              Billing Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@agency.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={unlockAccess} disabled={submitting || !email.trim()}>
              {submitting ? "Verifying..." : "Unlock Dashboard"}
            </Button>
            <Link href="/" className="text-sm text-[#58a6ff] hover:underline">
              Back to homepage
            </Link>
          </div>

          {error ? <p className="text-sm text-[#ff7b72]">{error}</p> : null}
          {success ? <p className="text-sm text-[#3fb950]">{success}</p> : null}
        </CardContent>
      </Card>
    </main>
  );
}
