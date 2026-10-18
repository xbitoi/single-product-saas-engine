import { Check } from "lucide-react";

export function ProductFeatures({ features }: { features: string[] }) {
  return (
    <ul className="mt-6 grid gap-2 sm:grid-cols-2">
      {features.map((feature, i) => (
        <li
          key={`${feature}-${i}`}
          className="flex items-start gap-2 text-sm text-slate-700"
        >
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <Check className="h-3 w-3" />
          </span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}
