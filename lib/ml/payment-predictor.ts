import { differenceInCalendarDays } from "date-fns";
import { Matrix, inverse } from "ml-matrix";
import { mean, standardDeviation } from "simple-statistics";

import {
  ClientRiskPrediction,
  InvoiceRecord,
  PortfolioPrediction
} from "@/lib/types";

interface ClientFeatures {
  avgDaysLate: number;
  lateRate: number;
  paymentVolatility: number;
  avgInvoiceAmount: number;
  openInvoices: number;
  openBalance: number;
  medianTermDays: number;
}

function toDayDiff(from: string, to: string): number {
  return differenceInCalendarDays(new Date(to), new Date(from));
}

function invoiceDaysLate(invoice: InvoiceRecord): number {
  const endDate = invoice.paidDate ?? new Date().toISOString().slice(0, 10);
  return Math.max(0, toDayDiff(invoice.dueDate, endDate));
}

function collectionPlaybook(risk: number, predictedDaysLate: number): string {
  if (risk >= 80) {
    return "Require upfront deposit on next project, enable automated reminders at T-5/T+1/T+5 days, and escalate personally by day 7.";
  }

  if (risk >= 60) {
    return "Send reminder 5 days before due date, follow up same day if unpaid, and offer ACH autopay for future invoices.";
  }

  if (risk >= 40) {
    return "Keep standard reminder cadence and move this client to weekly aging review until behavior stabilizes.";
  }

  return "Maintain current invoicing terms and continue standard pre-due reminder automation.";
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeClientFeatures(invoices: InvoiceRecord[]): ClientFeatures {
  const paid = invoices.filter((invoice) => invoice.status === "paid" && invoice.paidDate);
  const lateValues = paid.map(invoiceDaysLate);
  const avgDaysLate = lateValues.length ? mean(lateValues) : 0;
  const lateRate = lateValues.length
    ? lateValues.filter((value) => value > 0).length / lateValues.length
    : 0;
  const paymentVolatility = lateValues.length > 1 ? standardDeviation(lateValues) : 0;

  const openInvoices = invoices.filter((invoice) => invoice.status === "unpaid").length;
  const openBalance = invoices
    .filter((invoice) => invoice.status === "unpaid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const avgInvoiceAmount = invoices.length
    ? invoices.reduce((sum, invoice) => sum + invoice.amount, 0) / invoices.length
    : 0;

  const terms = invoices.map((invoice) => toDayDiff(invoice.invoiceDate, invoice.dueDate));
  const sortedTerms = [...terms].sort((a, b) => a - b);
  const medianTermDays = sortedTerms.length
    ? sortedTerms[Math.floor(sortedTerms.length / 2)]
    : 30;

  return {
    avgDaysLate,
    lateRate,
    paymentVolatility,
    avgInvoiceAmount,
    openInvoices,
    openBalance,
    medianTermDays
  };
}

function buildTrainingSet(invoices: InvoiceRecord[]): { x: number[][]; y: number[] } {
  const grouped = new Map<string, InvoiceRecord[]>();

  for (const invoice of invoices) {
    const key = invoice.clientName.trim().toLowerCase();
    const existing = grouped.get(key) ?? [];
    existing.push(invoice);
    grouped.set(key, existing);
  }

  const x: number[][] = [];
  const y: number[] = [];

  for (const clientInvoices of grouped.values()) {
    const ordered = clientInvoices
      .filter((invoice) => invoice.status === "paid" && invoice.paidDate)
      .sort((a, b) => a.invoiceDate.localeCompare(b.invoiceDate));

    for (let idx = 1; idx < ordered.length; idx += 1) {
      const prior = ordered.slice(0, idx);
      const current = ordered[idx];

      const priorLate = prior.map(invoiceDaysLate);
      const priorAvg = priorLate.length ? mean(priorLate) : 0;
      const priorLateRate = priorLate.length
        ? priorLate.filter((value) => value > 0).length / priorLate.length
        : 0;
      const priorVol = priorLate.length > 1 ? standardDeviation(priorLate) : 0;

      const termDays = toDayDiff(current.invoiceDate, current.dueDate);
      const targetLate = invoiceDaysLate(current) > 0 ? 1 : 0;

      x.push([
        1,
        priorAvg,
        priorLateRate,
        priorVol,
        current.amount,
        termDays,
        idx
      ]);
      y.push(targetLate);
    }
  }

  return { x, y };
}

function fitWeights(x: number[][], y: number[]): number[] {
  if (x.length < 4) {
    return [
      -2.1,
      0.06,
      2.4,
      0.03,
      0.00005,
      0.02,
      0.01
    ];
  }

  const xMatrix = new Matrix(x);
  const yMatrix = Matrix.columnVector(y);

  const xt = xMatrix.transpose();
  const ridgePenalty = Matrix.eye(xMatrix.columns).mul(0.15);
  const normalMatrix = xt.mmul(xMatrix).add(ridgePenalty);

  try {
    const solved = inverse(normalMatrix).mmul(xt.mmul(yMatrix));
    return solved.to1DArray();
  } catch {
    return [
      -2.1,
      0.06,
      2.4,
      0.03,
      0.00005,
      0.02,
      0.01
    ];
  }
}

function topDrivers(features: ClientFeatures): string[] {
  const drivers: string[] = [];

  if (features.lateRate >= 0.5) {
    drivers.push("More than half of historical invoices were paid late.");
  }

  if (features.avgDaysLate >= 7) {
    drivers.push(`Average delay is ${Math.round(features.avgDaysLate)} days.`);
  }

  if (features.paymentVolatility >= 8) {
    drivers.push("Payment timing is inconsistent month to month.");
  }

  if (features.openBalance >= 5000) {
    drivers.push("Open balance is large enough to affect near-term cash flow.");
  }

  if (drivers.length === 0) {
    drivers.push("Recent payment behavior is stable with low delinquency signals.");
  }

  return drivers;
}

function predictClientRisk(
  clientName: string,
  clientEmail: string | undefined,
  invoices: InvoiceRecord[],
  weights: number[]
): ClientRiskPrediction {
  const features = computeClientFeatures(invoices);
  const recency = invoices.length;
  const averageAmount = features.avgInvoiceAmount;

  const scoreInput = [
    1,
    features.avgDaysLate,
    features.lateRate,
    features.paymentVolatility,
    averageAmount,
    features.medianTermDays,
    recency
  ];

  const linearScore = scoreInput.reduce(
    (sum, value, idx) => sum + value * (weights[idx] ?? 0),
    0
  );

  const baseRisk = sigmoid(linearScore);
  const penalty = clamp(features.openInvoices * 0.03, 0, 0.2);
  const adjustedRisk = clamp(baseRisk + penalty, 0, 0.98);
  const riskScore = Math.round(adjustedRisk * 100);

  const predictedDaysLate = Math.max(
    0,
    Math.round(features.avgDaysLate * (0.5 + adjustedRisk) + features.paymentVolatility * 0.4)
  );

  const confidence = clamp(
    45 + Math.log2(Math.max(2, invoices.length)) * 15,
    40,
    95
  );

  return {
    clientName,
    clientEmail,
    riskScore,
    confidence: Math.round(confidence),
    predictedDaysLate,
    outstandingAmount: Number(features.openBalance.toFixed(2)),
    recentOnTimeRate: Math.round((1 - features.lateRate) * 100),
    recommendedAction: collectionPlaybook(riskScore, predictedDaysLate),
    drivers: topDrivers(features)
  };
}

export function predictPortfolioRisk(invoices: InvoiceRecord[]): PortfolioPrediction {
  const grouped = new Map<string, InvoiceRecord[]>();

  for (const invoice of invoices) {
    const key = invoice.clientName.trim().toLowerCase();
    const existing = grouped.get(key) ?? [];
    existing.push(invoice);
    grouped.set(key, existing);
  }

  const { x, y } = buildTrainingSet(invoices);
  const weights = fitWeights(x, y);

  const clients: ClientRiskPrediction[] = [];

  for (const [key, clientInvoices] of grouped.entries()) {
    const first = clientInvoices[0];
    clients.push(
      predictClientRisk(first.clientName || key, first.clientEmail, clientInvoices, weights)
    );
  }

  clients.sort((a, b) => b.riskScore - a.riskScore);

  const averageRisk = clients.length
    ? Number((clients.reduce((sum, client) => sum + client.riskScore, 0) / clients.length).toFixed(1))
    : 0;

  const highRiskClients = clients.filter((client) => client.riskScore >= 70).length;
  const totalOutstanding = clients.reduce(
    (sum, client) => sum + client.outstandingAmount,
    0
  );
  const predictedLateRevenue = clients.reduce(
    (sum, client) => sum + client.outstandingAmount * (client.riskScore / 100),
    0
  );

  return {
    summary: {
      generatedAt: new Date().toISOString(),
      averageRisk,
      highRiskClients,
      totalOutstanding: Number(totalOutstanding.toFixed(2)),
      predictedLateRevenue: Number(predictedLateRevenue.toFixed(2))
    },
    clients
  };
}
