"use client";

import { useState } from "react";
import type { ProductVariant, VariantOption } from "../../types";

interface Props {
  variants:         ProductVariant[];
  selectedVariantId: string | null;
  onChange:          (variantId: string) => void;
}

function groupOptions(variants: ProductVariant[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const v of variants) {
    if (!v.isActive) continue;
    for (const opt of v.options) {
      if (!map.has(opt.name)) map.set(opt.name, new Set());
      map.get(opt.name)!.add(opt.value);
    }
  }
  return map;
}

function findVariant(
  variants: ProductVariant[],
  selections: Record<string, string>
): ProductVariant | undefined {
  return variants.find((v) => {
    if (!v.isActive) return false;
    return v.options.every((o) => selections[o.name] === o.value);
  });
}

export default function ProductVariantSelector({ variants, selectedVariantId, onChange }: Props) {
  const active = variants.filter((v) => v.isActive);
  if (active.length === 0) return null;

  const optionGroups = groupOptions(active);
  const initialSelections = (() => {
    const sel: Record<string, string> = {};
    const selected = active.find((v) => v._id === selectedVariantId) || active[0];
    if (selected) {
      for (const opt of selected.options) sel[opt.name] = opt.value;
    }
    return sel;
  })();

  const [selections, setSelections] = useState<Record<string, string>>(initialSelections);

  const handleSelect = (optionName: string, value: string) => {
    const next = { ...selections, [optionName]: value };
    setSelections(next);
    const found = findVariant(active, next);
    if (found) onChange(found._id);
  };

  return (
    <div className="space-y-4">
      {Array.from(optionGroups.entries()).map(([optionName, values]) => (
        <div key={optionName}>
          <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-text)" }}>
            {optionName}:{" "}
            <span className="font-normal">{selections[optionName] ?? ""}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from(values).map((value) => {
              const isSelected = selections[optionName] === value;
              // Check if this combo would resolve to an active variant
              const testSel = { ...selections, [optionName]: value };
              const available = !!findVariant(active, testSel);
              return (
                <button
                  key={value}
                  onClick={() => available && handleSelect(optionName, value)}
                  disabled={!available}
                  className={`px-3 py-1.5 text-sm border rounded-md transition-all ${
                    isSelected
                      ? "font-semibold"
                      : "opacity-80 hover:opacity-100"
                  } ${!available ? "opacity-40 cursor-not-allowed line-through" : ""}`}
                  style={{
                    borderColor:      isSelected ? "var(--color-primary)"   : "var(--color-text)",
                    background:       isSelected ? "var(--color-primary)"   : "transparent",
                    color:            isSelected ? "var(--color-secondary)"  : "var(--color-text)",
                    borderRadius:     "var(--btn-radius, 8px)",
                  }}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
