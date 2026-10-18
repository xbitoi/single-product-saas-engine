"use client";

import { useMemo, useState } from "react";
import {
  PayPalButtons,
  PayPalScriptProvider,
} from "@paypal/react-paypal-js";
import { CheckCircle2, Loader2, Lock, ShieldCheck } from "lucide-react";
import type { ProductView } from "@/lib/data";
import { formatMoney } from "@/lib/utils";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { useNotice } from "@/components/ui/NoticeProvider";

interface CustomerForm {
  customerName: string;
  phone: string;
  address: string;
}

const EMPTY: CustomerForm = {
  customerName: "",
  phone: "",
  address: "",
};

type Status =
  | { kind: "idle" }
  | { kind: "paying" }
  | { kind: "done"; orderId: string }
  | { kind: "error"; message: string };

export function CheckoutSection({
  product,
  paypalClientId,
  paypalConfigured,
}: {
  product: ProductView;
  paypalClientId: string | null;
  paypalConfigured: boolean;
}) {
  const { t } = useI18n();
  const popup = useNotice();
  const [form, setForm] = useState<CustomerForm>(EMPTY);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [touched, setTouched] = useState(false);

  const errors = useMemo(() => validate(form, t), [form, t]);
  const formValid = Object.keys(errors).length === 0;

  function set<K extends keyof CustomerForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreateOrder(): Promise<string> {
    if (!formValid) {
      setTouched(true);
      const issues = Object.values(errors).filter(Boolean) as string[];
      popup.error(t("checkout.completeFirst"), issues);
      throw new Error(t("checkout.completeFirst"));
    }
    const res = await fetch("/api/checkout/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
    const data = (await res.json()) as {
      paypalOrderId?: string;
      error?: string;
      details?: string[];
    };
    if (!res.ok || !data.paypalOrderId) {
      popup.error(data.error ?? "Could not start payment.", data.details);
      throw new Error(data.error ?? "Could not start payment.");
    }
    return data.paypalOrderId;
  }

  async function handleApprove(paypalOrderId: string): Promise<void> {
    setStatus({ kind: "paying" });
    try {
      const res = await fetch("/api/checkout/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productId: product.id, paypalOrderId }),
      });
      const data = (await res.json()) as {
        orderId?: string;
        error?: string;
        details?: string[];
      };
      if (!res.ok || !data.orderId) {
        throw Object.assign(new Error(data.error ?? "Payment failed."), {
          details: data.details,
        });
      }
      setStatus({ kind: "done", orderId: data.orderId });
      popup.success(t("checkout.confirmedTitle"), [
        `${t("checkout.orderRef")}: ${data.orderId}`,
        t("checkout.confirmedText"),
      ]);
    } catch (error) {
      const details =
        error && typeof error === "object" && "details" in error
          ? ((error as { details?: string[] }).details ?? [])
          : [];
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Payment failed.",
      });
      popup.error(
        error instanceof Error ? error.message : "Payment failed.",
        details.length > 0
          ? details
          : [
              "Your payment was not completed, so you were not charged.",
              "Check your PayPal details and try again.",
              "If it keeps failing, contact support from the chat.",
            ],
      );
    }
  }

  if (status.kind === "done") {
    return (
      <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-600" />
        <h2 className="text-xl font-bold text-green-800">
          {t("checkout.confirmedTitle")}
        </h2>
        <p className="mt-1 text-sm text-green-700">
          {t("checkout.confirmedText")}
        </p>
        <p className="mt-3 text-xs text-green-600">
          {t("checkout.orderRef")}: <code>{status.orderId}</code>
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Lock className="h-4 w-4 text-brand-600" />
        <h2 className="text-lg font-semibold">{t("checkout.title")}</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label={t("checkout.fullName")}
          value={form.customerName}
          onChange={(v) => set("customerName", v)}
          placeholder="Jane Doe"
          error={touched ? errors.customerName : undefined}
        />
        <Field
          label={t("checkout.phone")}
          value={form.phone}
          onChange={(v) => set("phone", v)}
          placeholder="+1 555 000 0000"
          error={touched ? errors.phone : undefined}
        />
        <div className="sm:col-span-2">
          <Field
            label={t("checkout.address")}
            value={form.address}
            onChange={(v) => set("address", v)}
            placeholder="Street, city, country, postal code"
            error={touched ? errors.address : undefined}
            textarea
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm text-slate-500">{t("checkout.total")}</span>
        <span className="text-xl font-bold text-brand-700">
          {formatMoney(product.price, product.currency)}
        </span>
      </div>

      {status.kind === "error" && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {status.message}
        </p>
      )}

      <div className="mt-4">
        {!paypalConfigured || !paypalClientId ? (
          <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {t("checkout.paypalMissing")}
          </div>
        ) : status.kind === "paying" ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("checkout.processing")}
          </div>
        ) : (
          <PayPalScriptProvider
            options={{
              clientId: paypalClientId,
              currency: product.currency || "USD",
              intent: "capture",
              components: "buttons",
            }}
          >
            <PayPalButtons
              style={{ layout: "vertical", shape: "rect", label: "pay" }}
              forceReRender={[formValid]}
              createOrder={() => handleCreateOrder()}
              onApprove={async (data) => {
                if (data.orderID) await handleApprove(data.orderID);
              }}
              onError={(err) => {
                setStatus({
                  kind: "error",
                  message:
                    err instanceof Error ? err.message : "Payment error.",
                });
              }}
            />
          </PayPalScriptProvider>
        )}
      </div>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5" />
        {t("checkout.secureNote")}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  textarea?: boolean;
}) {
  const base =
    "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2";
  const tone = error
    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
    : "border-slate-300 focus:border-brand-500 focus:ring-brand-100";

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${base} ${tone} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${base} ${tone}`}
        />
      )}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

function validate(
  form: CustomerForm,
  t: (path: string) => string,
): Partial<Record<keyof CustomerForm, string>> {
  const errors: Partial<Record<keyof CustomerForm, string>> = {};
  if (!form.customerName.trim()) errors.customerName = t("checkout.nameRequired");
  if (form.phone.trim().length < 3) errors.phone = t("checkout.phoneRequired");
  if (form.address.trim().length < 5)
    errors.address = t("checkout.addressRequired");
  return errors;
}
