import { listInvoices } from "@/lib/data-store";
import { predictPortfolioRisk } from "@/lib/ml/payment-predictor";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const invoices = await listInvoices();

  if (invoices.length === 0) {
    return Response.json(
      {
        error:
          "No invoice data found. Upload CSV data first to generate payment risk predictions."
      },
      { status: 404 }
    );
  }

  const prediction = predictPortfolioRisk(invoices);
  return Response.json(prediction);
}
