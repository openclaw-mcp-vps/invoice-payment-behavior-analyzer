import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LandingPageProps {
  searchParams?: Promise<{
    paywall?: string;
    next?: string;
  }>;
}

const faqItems = [
  {
    question: "How accurate are the late-payment predictions?",
    answer:
      "Accuracy improves as you ingest more invoices. Most teams see stable risk ranking once 80+ paid invoices are loaded, because the model can compare each client’s timing and volatility patterns."
  },
  {
    question: "Do I need to connect my invoicing platform?",
    answer:
      "No. You can start with CSV exports in under five minutes. API ingestion is available when you want automated nightly refreshes."
  },
  {
    question: "What actions does the app recommend?",
    answer:
      "Each client gets concrete next steps: reminder timing, escalation threshold, and terms adjustments like deposits or autopay enrollment."
  },
  {
    question: "Who is this best for?",
    answer:
      "Freelancers and agencies sending 20+ invoices monthly who want fewer surprises and more predictable cash collection."
  }
];

export default async function Home({ searchParams }: LandingPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const stripePaymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
  const blockedPath = resolvedSearchParams.next;

  return (
    <main className="space-y-20 pb-16">
      <header className="rounded-2xl border border-[#30363d] bg-[#161b22]/80 p-6 sm:p-10">
        <nav className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#8b949e]">invoice-billing SaaS</p>
            <p className="text-lg font-semibold text-[#f0f6fc]">Invoice Payment Behavior Analyzer</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/purchase/success" className="text-sm text-[#58a6ff] hover:underline">
              Unlock Purchased Access
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </nav>

        {resolvedSearchParams.paywall === "1" ? (
          <div className="mb-6 rounded-md border border-[#d29922] bg-[#d2992215] p-3 text-sm text-[#e3b341]">
            {blockedPath
              ? `You need an active subscription to open ${blockedPath}. Complete checkout, then unlock access.`
              : "You need an active subscription to use the prediction dashboard."}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-[#58a6ff] bg-[#58a6ff1a] px-3 py-1 text-xs font-semibold tracking-wide text-[#58a6ff]">
              Predict Which Clients Will Pay Invoices Late
            </p>
            <h1
              className="text-4xl font-bold leading-tight text-[#f0f6fc] sm:text-5xl"
              style={{ fontFamily: "var(--font-heading), system-ui, sans-serif" }}
            >
              Stop cash-flow surprises before they hit your bank account.
            </h1>
            <p className="max-w-2xl text-lg text-[#8b949e]">
              Late payments create an estimated $3T annual cash-flow drag for small businesses. This platform
              scores every client by payment risk, forecasts delayed revenue, and tells you exactly who to chase
              first.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={stripePaymentLink} target="_blank" rel="noreferrer">
                <Button size="lg">Start For $12 / month</Button>
              </a>
              <Link href="/upload">
                <Button size="lg" variant="outline">
                  See The Upload Workflow
                </Button>
              </Link>
            </div>
          </div>

          <Card className="bg-[#0f141b]">
            <CardHeader>
              <CardTitle>What You Get On Day One</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-[#c9d1d9]">
              <p>1. CSV ingestion from QuickBooks, Xero, FreshBooks, or Wave exports.</p>
              <p>2. Client-by-client risk scores with confidence and predicted delay days.</p>
              <p>3. Collection strategy suggestions tailored to each client profile.</p>
              <p>4. One dashboard for outstanding exposure and likely late revenue.</p>
            </CardContent>
          </Card>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">$3T</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#8b949e]">
            Annual small-business cash-flow pressure tied to late invoice payments.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">20+</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#8b949e]">
            Monthly invoices is where manual follow-up usually breaks and risk ranking starts paying off.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">10 min</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#8b949e]">
            Typical setup time from CSV export to the first risk-ranked collection list.
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2
          className="text-3xl font-semibold text-[#f0f6fc]"
          style={{ fontFamily: "var(--font-heading), system-ui, sans-serif" }}
        >
          Why Teams Use It
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Problem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[#8b949e]">
              <p>Most freelancers track overdue invoices in spreadsheets and react too late.</p>
              <p>Every missed follow-up increases days sales outstanding and forces cash-buffer stress.</p>
              <p>Manually spotting risky clients is almost impossible once volume grows.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Solution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[#8b949e]">
              <p>Behavior model surfaces likely late payers before due date.</p>
              <p>Risk tiers prioritize who gets reminders, calls, and terms updates first.</p>
              <p>Dashboard estimates how much outstanding revenue is at risk this cycle.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2
          className="text-3xl font-semibold text-[#f0f6fc]"
          style={{ fontFamily: "var(--font-heading), system-ui, sans-serif" }}
        >
          Pricing
        </h2>
        <Card className="border-[#58a6ff] bg-[#0f141b]">
          <CardHeader>
            <CardTitle>Single Plan: $12/month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[#c9d1d9]">
            <p>Unlimited invoice uploads, full prediction dashboard, and prioritized collection guidance.</p>
            <p>No contracts. Cancel anytime. Built for freelancers and small agencies.</p>
            <div className="pt-2">
              <a href={stripePaymentLink} target="_blank" rel="noreferrer">
                <Button size="lg">Buy Access</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2
          className="text-3xl font-semibold text-[#f0f6fc]"
          style={{ fontFamily: "var(--font-heading), system-ui, sans-serif" }}
        >
          FAQ
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {faqItems.map((item) => (
            <Card key={item.question}>
              <CardHeader>
                <CardTitle className="text-lg">{item.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#8b949e]">{item.answer}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
