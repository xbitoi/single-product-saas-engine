import type { Metadata } from "next";
import { CreditCard } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { env } from "@/lib/env";
import { PaypalSettingsForm } from "@/components/dashboard/PaypalSettingsForm";

export const metadata: Metadata = { title: "Payments" };
export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <CreditCard className="h-6 w-6 text-brand-600" />
          Payments
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your PayPal API keys so the customer can tap Pay and pay through
          the real PayPal interface. Test the connection to fetch your account
          name.
        </p>
      </header>

      <PaypalSettingsForm
        clientId={settings.paypalClientId ?? ""}
        hasSecret={Boolean(settings.paypalSecret)}
        mode={settings.paypalMode}
        merchantName={settings.paypalMerchantName}
        envFallback={Boolean(env.PAYPAL_CLIENT_ID || env.PAYPAL_CLIENT_SECRET)}
      />
    </div>
  );
}
