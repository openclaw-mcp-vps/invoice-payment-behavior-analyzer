import { ZodError, z } from "zod";

import { mergeInvoices, listInvoices } from "@/lib/data-store";
import { parseInvoiceCsv, parseInvoiceJson } from "@/lib/invoice-parser";

export const runtime = "nodejs";

const JsonPayloadSchema = z.object({
  invoices: z.unknown().optional(),
  csv: z.string().min(1).optional()
});

export async function GET(): Promise<Response> {
  const invoices = await listInvoices();
  return Response.json({ invoices, count: invoices.length });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let parsedInvoices;

    if (contentType.includes("text/csv")) {
      const csvBody = await request.text();
      parsedInvoices = await parseInvoiceCsv(csvBody);
    } else {
      const payload = JsonPayloadSchema.parse(await request.json());

      if (payload.csv) {
        parsedInvoices = await parseInvoiceCsv(payload.csv);
      } else if (payload.invoices) {
        parsedInvoices = parseInvoiceJson(payload.invoices);
      } else {
        return Response.json(
          { error: "Provide either a CSV body or an invoices array." },
          { status: 400 }
        );
      }
    }

    const merged = await mergeInvoices(parsedInvoices);

    return Response.json({
      message: `Ingested ${parsedInvoices.length} invoices.`,
      count: merged.length,
      invoices: merged
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: "Invalid invoice payload.", details: error.flatten() },
        { status: 400 }
      );
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while ingesting invoices."
      },
      { status: 400 }
    );
  }
}
