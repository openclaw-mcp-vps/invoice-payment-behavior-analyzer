import Link from "next/link";

import { PredictionDashboard } from "@/components/prediction-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listInvoices } from "@/lib/data-store";
import { predictPortfolioRisk } from "@/lib/ml/payment-predictor";

export const metadata = {
  title: "Payment Risk Dashboard | Invoice Payment Behavior Analyzer",
  description:
    "View client risk scores, predicted late payments, and collection priorities from your invoice history."
};

export default async function DashboardPage() {
  const invoices = await listInvoices();

  if (invoices.length === 0) {
    return (
      <main className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-[#f0f6fc]">Prediction Dashboard</h1>
          <p className="text-sm text-[#8b949e]">
            No invoice data is available yet. Upload your first CSV to generate risk scores.
          </p>
        </div>

        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Start By Uploading Invoice History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[#8b949e]">
            <p>
              Include invoice date, due date, paid date, amount, and client name columns so the model can train
              against real payment behavior.
            </p>
            <Link href="/upload">
              <Button>Go To Upload</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const prediction = predictPortfolioRisk(invoices);

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#f0f6fc]">Prediction Dashboard</h1>
        <p className="text-sm text-[#8b949e]">
          Generated from {invoices.length} invoices across {prediction.clients.length} clients.
        </p>
      </div>

      <PredictionDashboard prediction={prediction} />
    </main>
  );
}
