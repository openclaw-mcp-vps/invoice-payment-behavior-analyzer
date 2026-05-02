import { savePurchase } from "@/lib/data-store";
import { verifyStripeSignature } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

interface StripeWebhookEvent {
  type: string;
  data?: {
    object?: {
      customer_email?: string;
      customer_details?: {
        email?: string;
        name?: string;
      };
      receipt_email?: string;
      billing_details?: {
        email?: string;
        name?: string;
      };
    };
  };
}

function getPurchaser(event: StripeWebhookEvent): { email?: string; name?: string } {
  const object = event.data?.object;
  return {
    email:
      object?.customer_email ??
      object?.customer_details?.email ??
      object?.receipt_email ??
      object?.billing_details?.email,
    name: object?.customer_details?.name ?? object?.billing_details?.name
  };
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    return Response.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const body = await request.text();
  const isValid = verifyStripeSignature(body, signature, secret);

  if (!isValid) {
    return Response.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const event = JSON.parse(body) as StripeWebhookEvent;

  if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
    const purchaser = getPurchaser(event);

    if (purchaser.email) {
      await savePurchase({
        email: purchaser.email,
        source: "stripe",
        customerName: purchaser.name,
        purchasedAt: new Date().toISOString()
      });
    }
  }

  return Response.json({ received: true });
}
