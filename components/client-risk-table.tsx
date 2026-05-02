import { ClientRiskPrediction } from "@/lib/types";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface ClientRiskTableProps {
  clients: ClientRiskPrediction[];
}

function riskVariant(riskScore: number): "high" | "medium" | "low" {
  if (riskScore >= 70) {
    return "high";
  }

  if (riskScore >= 40) {
    return "medium";
  }

  return "low";
}

export function ClientRiskTable({ clients }: ClientRiskTableProps) {
  return (
    <div className="rounded-xl border border-[#30363d] bg-[#0d1117]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Predicted Delay</TableHead>
            <TableHead>On-Time Rate</TableHead>
            <TableHead>Outstanding</TableHead>
            <TableHead>Recommended Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.clientName}>
              <TableCell>
                <div className="font-medium text-[#f0f6fc]">{client.clientName}</div>
                <div className="text-xs text-[#8b949e]">{client.clientEmail ?? "No email on file"}</div>
              </TableCell>
              <TableCell>
                <Badge variant={riskVariant(client.riskScore)}>{client.riskScore}%</Badge>
              </TableCell>
              <TableCell>{client.predictedDaysLate} days</TableCell>
              <TableCell>{client.recentOnTimeRate}%</TableCell>
              <TableCell>${client.outstandingAmount.toLocaleString()}</TableCell>
              <TableCell className="max-w-sm text-[#8b949e]">
                {client.recommendedAction}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
