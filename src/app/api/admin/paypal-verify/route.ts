import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateSettings } from "@/lib/settings";
import { verifyPaypalCredentials } from "@/lib/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Verifies the stored PayPal keys and caches the account name if available. */
export async function POST() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const info = await verifyPaypalCredentials();
    const accountName = info.accountName ?? info.email ?? null;
    if (accountName) {
      await updateSettings({ paypalMerchantName: accountName });
    }
    return NextResponse.json({ ok: true, ...info, accountName });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "PayPal verification failed.",
      },
      { status: 400 },
    );
  }
}
