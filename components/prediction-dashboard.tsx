"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { ClientRiskTable } from "@/components/client-risk-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortfolioPrediction } from "@/lib/types";

interface PredictionDashboardProps {
  prediction: PortfolioPrediction;
}

export function PredictionDashboard({ prediction }: PredictionDashboardProps) {
  const chartData = prediction.clients.slice(0, 8).map((client) => ({
    name: client.clientName,
    risk: client.riskScore,
    outstanding: client.outstandingAmount
  }));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Average Portfolio Risk</CardDescription>
            <CardTitle>{prediction.summary.averageRisk}%</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>High-Risk Clients</CardDescription>
            <CardTitle>{prediction.summary.highRiskClients}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Outstanding Receivables</CardDescription>
            <CardTitle>${prediction.summary.totalOutstanding.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>At-Risk Revenue Forecast</CardDescription>
            <CardTitle>${prediction.summary.predictedLateRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Risk Distribution</CardTitle>
          <CardDescription>
            High score means a client is likely to pay late on their next invoice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis
                  dataKey="name"
                  stroke="#8b949e"
                  angle={-25}
                  textAnchor="end"
                  height={70}
                  interval={0}
                />
                <YAxis stroke="#8b949e" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#161b22",
                    borderColor: "#30363d",
                    color: "#c9d1d9"
                  }}
                />
                <Bar dataKey="risk" fill="#58a6ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-[#f0f6fc]">Recommended Collection Priorities</h2>
        <ClientRiskTable clients={prediction.clients} />
      </div>
    </div>
  );
}
