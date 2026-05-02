import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";

import csv from "csv-parser";
import { format, isValid, parse, parseISO } from "date-fns";
import { z } from "zod";

import { InvoiceRecord } from "@/lib/types";

const REQUIRED_KEYS = ["client", "invoice", "invoiceDate", "dueDate", "amount"] as const;

const JsonInvoiceSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email().optional(),
  invoiceNumber: z.string().min(1),
  invoiceDate: z.string().min(1),
  dueDate: z.string().min(1),
  paidDate: z.string().optional(),
  amount: z.number().positive(),
  status: z.enum(["paid", "unpaid"]).optional()
});

const JsonInvoiceListSchema = z.array(JsonInvoiceSchema).min(1);

function normalizeDate(input: string): string {
  const value = input.trim();
  const candidates = [
    parseISO(value),
    parse(value, "yyyy-MM-dd", new Date()),
    parse(value, "MM/dd/yyyy", new Date()),
    parse(value, "M/d/yyyy", new Date()),
    new Date(value)
  ];

  const date = candidates.find((candidate) => isValid(candidate));
  if (!date) {
    throw new Error(`Invalid date value: ${input}`);
  }

  return format(date, "yyyy-MM-dd");
}

function parseAmount(rawValue: string): number {
  const cleaned = rawValue.replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid amount value: ${rawValue}`);
  }

  return parsed;
}

function mapRow(rawRow: Record<string, unknown>): InvoiceRecord {
  const row = Object.fromEntries(
    Object.entries(rawRow).map(([key, value]) => [
      key.trim().toLowerCase(),
      String(value ?? "").trim()
    ])
  );

  const clientName =
    row.client_name ?? row.client ?? row.customer_name ?? row.customer ?? row.company;
  const invoiceNumber = row.invoice_number ?? row.invoice_id ?? row.invoice ?? row.number;
  const invoiceDate = row.invoice_date ?? row.issued_date ?? row.issue_date;
  const dueDate = row.due_date ?? row.due;
  const amount = row.amount ?? row.total ?? row.invoice_amount;
  const paidDate = row.paid_date ?? row.payment_date ?? row.settled_at;
  const clientEmail = row.client_email ?? row.email;

  const mapped = {
    client: String(clientName ?? ""),
    invoice: String(invoiceNumber ?? ""),
    invoiceDate: String(invoiceDate ?? ""),
    dueDate: String(dueDate ?? ""),
    amount: String(amount ?? "")
  };

  for (const key of REQUIRED_KEYS) {
    if (!mapped[key].trim()) {
      throw new Error(`Missing required CSV column value: ${key}`);
    }
  }

  const paidValue = String(paidDate ?? "").trim();
  const statusField = String(row.status ?? "").trim().toLowerCase();
  const normalizedPaidDate = paidValue ? normalizeDate(paidValue) : undefined;
  const status: "paid" | "unpaid" =
    statusField === "paid" || normalizedPaidDate ? "paid" : "unpaid";

  return {
    id: randomUUID(),
    clientName: mapped.client,
    clientEmail: clientEmail ? String(clientEmail).toLowerCase() : undefined,
    invoiceNumber: mapped.invoice,
    invoiceDate: normalizeDate(mapped.invoiceDate),
    dueDate: normalizeDate(mapped.dueDate),
    paidDate: normalizedPaidDate,
    amount: parseAmount(mapped.amount),
    status
  };
}

export async function parseInvoiceCsv(rawCsv: string): Promise<InvoiceRecord[]> {
  const rows: InvoiceRecord[] = [];

  await new Promise<void>((resolve, reject) => {
    Readable.from(rawCsv)
      .pipe(csv())
      .on("data", (row) => {
        try {
          rows.push(mapRow(row));
        } catch (error) {
          reject(error);
        }
      })
      .on("error", reject)
      .on("end", () => resolve());
  });

  if (rows.length === 0) {
    throw new Error("No invoice rows found in CSV.");
  }

  return rows;
}

export function parseInvoiceJson(payload: unknown): InvoiceRecord[] {
  const parsed = JsonInvoiceListSchema.parse(payload);

  return parsed.map((item) => {
    const paidDate = item.paidDate ? normalizeDate(item.paidDate) : undefined;
    const status: "paid" | "unpaid" = item.status ?? (paidDate ? "paid" : "unpaid");

    return {
      id: randomUUID(),
      clientName: item.clientName,
      clientEmail: item.clientEmail,
      invoiceNumber: item.invoiceNumber,
      invoiceDate: normalizeDate(item.invoiceDate),
      dueDate: normalizeDate(item.dueDate),
      paidDate,
      amount: item.amount,
      status
    };
  });
}
