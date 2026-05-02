"use client";

import Link from "next/link";
import { type ChangeEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InvoiceRecord } from "@/lib/types";

interface UploadResponse {
  count: number;
  invoices: InvoiceRecord[];
  message: string;
}

const SAMPLE_HEADERS =
  "client_name,client_email,invoice_number,invoice_date,due_date,paid_date,amount,status";

const SAMPLE_ROW =
  "Northstar Design,finance@northstar.design,INV-1042,2026-01-03,2026-01-17,2026-01-29,2400,paid";

export function UploadForm() {
  const [csvText, setCsvText] = useState(`${SAMPLE_HEADERS}\n${SAMPLE_ROW}`);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const lineCount = useMemo(
    () => csvText.split(/\r?\n/).filter((line) => line.trim().length > 0).length,
    [csvText]
  );

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const content = await file.text();
    setCsvText(content);
    setResult(null);
    setError(null);
  }

  async function submitCsv() {
    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "text/csv"
        },
        body: csvText
      });

      const payload = (await response.json()) as UploadResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Upload failed.");
      }

      setResult(payload);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Invoice Data</CardTitle>
          <CardDescription>
            Import from exported billing CSV files or paste raw CSV directly. The model will use due dates,
            payment dates, and invoice value to predict delinquency.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#c9d1d9]" htmlFor="csv-upload">
              CSV File
            </label>
            <Input id="csv-upload" type="file" accept=".csv,text/csv" onChange={onFileChange} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#c9d1d9]" htmlFor="csv-text">
                CSV Content
              </label>
              <span className="text-xs text-[#8b949e]">{lineCount} non-empty lines</span>
            </div>
            <textarea
              id="csv-text"
              value={csvText}
              onChange={(event) => setCsvText(event.target.value)}
              className="min-h-72 w-full rounded-md border border-[#30363d] bg-[#0d1117] p-3 text-sm text-[#f0f6fc] placeholder:text-[#6e7681] focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
              placeholder="Paste your invoice CSV here"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={submitCsv} disabled={uploading || !csvText.trim()}>
              {uploading ? "Uploading..." : "Ingest Invoices"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCsvText(`${SAMPLE_HEADERS}\n${SAMPLE_ROW}`);
                setResult(null);
                setError(null);
              }}
            >
              Reset Template
            </Button>
            <Link href="/dashboard" className="text-sm text-[#58a6ff] hover:underline">
              View dashboard
            </Link>
          </div>

          {error ? <p className="text-sm text-[#ff7b72]">{error}</p> : null}

          {result ? (
            <div className="rounded-md border border-[#238636] bg-[#2386361a] p-3 text-sm text-[#3fb950]">
              <p>{result.message}</p>
              <p>
                Portfolio now contains <strong>{result.count}</strong> invoices.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
