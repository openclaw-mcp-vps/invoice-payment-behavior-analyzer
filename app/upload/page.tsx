import { UploadForm } from "@/components/upload-form";

export const metadata = {
  title: "Upload Invoice Data | Invoice Payment Behavior Analyzer",
  description:
    "Upload invoice CSV data to generate client late-payment predictions and collection strategies."
};

export default function UploadPage() {
  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#f0f6fc]">Invoice Ingestion</h1>
        <p className="max-w-3xl text-sm text-[#8b949e]">
          Add your latest invoice export to refresh risk models. Include paid and unpaid invoices so the model can
          learn client behavior and calculate outstanding exposure.
        </p>
      </div>
      <UploadForm />
    </main>
  );
}
