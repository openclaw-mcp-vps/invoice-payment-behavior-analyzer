import { z } from "zod";
import { NextResponse } from "next/server";

import { hasPurchased, normalizeEmail } from "@/lib/data-store";

export const runtime = "nodejs";

const AccessSchema = z.object({
  email: z.string().email()
});

const ACCESS_COOKIE = "invoice_behavior_paid";

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = AccessSchema.parse(await request.json());
    const email = normalizeEmail(payload.email);
    const purchased = await hasPurchased(email);

    if (!purchased) {
      return Response.json(
        {
          error:
            "No completed purchase is linked to this email yet. If you just paid, wait 30 seconds and retry."
        },
        { status: 403 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: ACCESS_COOKIE,
      value: "active",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production"
    });

    return response;
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not activate access."
      },
      { status: 400 }
    );
  }
}
