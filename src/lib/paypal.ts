import { env } from "./env";
import { getSettings } from "./settings";

export interface PaypalConfig {
  clientId: string;
  secret: string;
  mode: "sandbox" | "live";
  api: string;
}

/** Reads PayPal credentials from the dashboard settings (env is a fallback). */
export async function getPaypalConfig(): Promise<PaypalConfig | null> {
  const s = await getSettings();
  if (!s.paypalClientId || !s.paypalSecret) return null;
  const mode: "sandbox" | "live" = s.paypalMode === "live" ? "live" : "sandbox";
  return {
    clientId: s.paypalClientId,
    secret: s.paypalSecret,
    mode,
    api:
      mode === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com",
  };
}

export async function isPaypalConfigured(): Promise<boolean> {
  return (await getPaypalConfig()) !== null;
}

export function getPaypalCurrency(): string {
  return env.PAYPAL_CURRENCY || "USD";
}

async function getAccessToken(cfg: PaypalConfig): Promise<string> {
  const auth = Buffer.from(`${cfg.clientId}:${cfg.secret}`).toString("base64");

  const res = await fetch(`${cfg.api}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`PayPal auth failed (HTTP ${res.status}). Check the client id/secret and mode.`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("PayPal auth returned no token.");
  return json.access_token;
}

export interface PaypalAccountInfo {
  mode: "sandbox" | "live";
  accountName: string | null;
  email: string | null;
  userId: string | null;
  clientId: string;
}

/**
 * Verifies the stored credentials by requesting an access token, then tries to
 * read the account name/email via the userinfo endpoint (best effort).
 */
export async function verifyPaypalCredentials(): Promise<PaypalAccountInfo> {
  const cfg = await getPaypalConfig();
  if (!cfg) {
    throw new Error("PayPal is not configured (missing client id/secret).");
  }

  const token = await getAccessToken(cfg);

  let accountName: string | null = null;
  let email: string | null = null;
  let userId: string | null = null;

  try {
    const res = await fetch(
      `${cfg.api}/v1/identity/oauth2/userinfo?schema=paypalv1.1`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );
    if (res.ok) {
      const j = (await res.json()) as {
        user_id?: string;
        payer_id?: string;
        name?: string;
        given_name?: string;
        family_name?: string;
        email?: string;
        emails?: Array<{ value?: string }>;
      };
      userId = j.user_id ?? j.payer_id ?? null;
      email = j.email ?? j.emails?.[0]?.value ?? null;
      accountName =
        j.name ??
        [j.given_name, j.family_name].filter(Boolean).join(" ") ??
        null;
      if (!accountName) accountName = null;
    }
  } catch {
    /* userinfo is optional; a valid token is enough to prove the keys work */
  }

  return { mode: cfg.mode, accountName, email, userId, clientId: cfg.clientId };
}

export interface CreateOrderArgs {
  amount: number;
  currency: string;
  description: string;
  referenceId: string;
}

export async function createPaypalOrder(
  args: CreateOrderArgs,
): Promise<{ id: string }> {
  const cfg = await getPaypalConfig();
  if (!cfg) throw new Error("PayPal is not configured (missing client id/secret).");

  const token = await getAccessToken(cfg);
  const res = await fetch(`${cfg.api}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: args.referenceId,
          description: args.description.slice(0, 127),
          amount: {
            currency_code: args.currency,
            value: args.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`PayPal create order failed (HTTP ${res.status})`);
  }
  const json = (await res.json()) as { id?: string };
  if (!json.id) throw new Error("PayPal returned no order id");
  return { id: json.id };
}

export interface CaptureResult {
  paypalOrderId: string;
  captureId: string | null;
  status: string;
  payerEmail: string | null;
  amountValue: number | null;
  currency: string | null;
}

export async function capturePaypalOrder(
  paypalOrderId: string,
): Promise<CaptureResult> {
  const cfg = await getPaypalConfig();
  if (!cfg) throw new Error("PayPal is not configured (missing client id/secret).");

  const token = await getAccessToken(cfg);
  const res = await fetch(
    `${cfg.api}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    },
  );

  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const message =
      (json as { message?: string }).message ?? `HTTP ${res.status}`;
    throw new Error(`PayPal capture failed: ${message}`);
  }

  const purchaseUnits =
    (json.purchase_units as Array<Record<string, unknown>>) ?? [];
  const payments = purchaseUnits[0]?.payments as
    | { captures?: Array<Record<string, unknown>> }
    | undefined;
  const capture = payments?.captures?.[0];
  const amountObj = (capture?.amount ?? purchaseUnits[0]?.amount) as
    | { value?: string; currency_code?: string }
    | undefined;

  return {
    paypalOrderId: String(json.id ?? paypalOrderId),
    captureId: capture?.id ? String(capture.id) : null,
    status: String(json.status ?? "UNKNOWN"),
    payerEmail:
      (json.payer as { email_address?: string } | undefined)?.email_address ??
      null,
    amountValue: amountObj?.value ? Number(amountObj.value) : null,
    currency: amountObj?.currency_code ?? null,
  };
}
