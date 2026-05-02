import crypto from "node:crypto";

interface StripeHeaderSignature {
  timestamp: string;
  v1: string;
}

function parseStripeSignature(headerValue: string): StripeHeaderSignature | null {
  const sections = headerValue.split(",").map((section) => section.trim());
  const parsed: Partial<StripeHeaderSignature> = {};

  for (const section of sections) {
    const [key, value] = section.split("=");
    if (key === "t") {
      parsed.timestamp = value;
    }

    if (key === "v1") {
      parsed.v1 = value;
    }
  }

  if (!parsed.timestamp || !parsed.v1) {
    return null;
  }

  return parsed as StripeHeaderSignature;
}

export function verifyStripeSignature(body: string, signatureHeader: string, secret: string): boolean {
  const parsed = parseStripeSignature(signatureHeader);
  if (!parsed) {
    return false;
  }

  const signedPayload = `${parsed.timestamp}.${body}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  const received = Buffer.from(parsed.v1, "hex");
  const local = Buffer.from(expected, "hex");

  if (received.length !== local.length) {
    return false;
  }

  return crypto.timingSafeEqual(received, local);
}
