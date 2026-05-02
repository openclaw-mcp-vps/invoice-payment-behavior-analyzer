import { promises as fs } from "node:fs";
import path from "node:path";

import { InvoiceRecord, PurchaseRecord } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "lib", "data");
const INVOICES_FILE = path.join(DATA_DIR, "invoices.json");
const PURCHASES_FILE = path.join(DATA_DIR, "purchases.json");

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function writeJson<T>(filePath: string, payload: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch (error) {
    const fsError = error as NodeJS.ErrnoException;
    if (fsError.code === "ENOENT") {
      return fallback;
    }

    throw error;
  }
}

function invoiceKey(invoice: InvoiceRecord): string {
  return [
    invoice.clientName.trim().toLowerCase(),
    invoice.invoiceNumber.trim().toLowerCase()
  ].join("::");
}

export async function listInvoices(): Promise<InvoiceRecord[]> {
  return readJson<InvoiceRecord[]>(INVOICES_FILE, []);
}

export async function replaceInvoices(invoices: InvoiceRecord[]): Promise<void> {
  await writeJson(INVOICES_FILE, invoices);
}

export async function mergeInvoices(invoices: InvoiceRecord[]): Promise<InvoiceRecord[]> {
  const existing = await listInvoices();
  const merged = new Map<string, InvoiceRecord>();

  for (const invoice of [...existing, ...invoices]) {
    merged.set(invoiceKey(invoice), invoice);
  }

  const normalized = [...merged.values()].sort((a, b) =>
    a.invoiceDate.localeCompare(b.invoiceDate)
  );

  await replaceInvoices(normalized);
  return normalized;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function listPurchases(): Promise<PurchaseRecord[]> {
  return readJson<PurchaseRecord[]>(PURCHASES_FILE, []);
}

export async function savePurchase(purchase: PurchaseRecord): Promise<void> {
  const purchases = await listPurchases();
  const map = new Map<string, PurchaseRecord>();

  for (const row of purchases) {
    map.set(normalizeEmail(row.email), row);
  }

  map.set(normalizeEmail(purchase.email), {
    ...purchase,
    email: normalizeEmail(purchase.email)
  });

  await writeJson(PURCHASES_FILE, [...map.values()]);
}

export async function hasPurchased(email: string): Promise<boolean> {
  const target = normalizeEmail(email);
  const purchases = await listPurchases();
  return purchases.some((purchase) => normalizeEmail(purchase.email) === target);
}
