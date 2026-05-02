export type InvoiceStatus = "paid" | "unpaid";

export interface InvoiceRecord {
  id: string;
  clientName: string;
  clientEmail?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paidDate?: string;
  amount: number;
  status: InvoiceStatus;
}

export interface PurchaseRecord {
  email: string;
  source: "stripe" | "manual";
  purchasedAt: string;
  customerName?: string;
}

export interface PredictionSummary {
  generatedAt: string;
  averageRisk: number;
  highRiskClients: number;
  totalOutstanding: number;
  predictedLateRevenue: number;
}

export interface ClientRiskPrediction {
  clientName: string;
  clientEmail?: string;
  riskScore: number;
  confidence: number;
  predictedDaysLate: number;
  outstandingAmount: number;
  recentOnTimeRate: number;
  recommendedAction: string;
  drivers: string[];
}

export interface PortfolioPrediction {
  summary: PredictionSummary;
  clients: ClientRiskPrediction[];
}
