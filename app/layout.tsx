import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap"
});

const bodyFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://invoice-payment-behavior-analyzer.com"),
  title: "Invoice Payment Behavior Analyzer | Predict Late Payments Before They Happen",
  description:
    "Analyze invoice histories, predict late-paying clients, and get practical collection plays to protect cash flow.",
  openGraph: {
    title: "Invoice Payment Behavior Analyzer",
    description:
      "Predict which clients will pay late and take action before receivables hurt cash flow.",
    type: "website",
    url: "https://invoice-payment-behavior-analyzer.com",
    siteName: "Invoice Payment Behavior Analyzer"
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoice Payment Behavior Analyzer",
    description:
      "Machine-learning risk scores for client payment behavior, built for freelancers and agencies."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${headingFont.variable} ${bodyFont.variable} bg-[#0d1117] text-[#c9d1d9] antialiased`}
        style={{ fontFamily: "var(--font-body), ui-monospace, monospace" }}
      >
        <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </div>
      </body>
    </html>
  );
}
