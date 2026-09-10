"use client";

import { SCALE_MAX, SCALE_MIN } from "@/lib/types";

function labelFor(value: number): string {
  if (value <= 2) return "Low";
  if (value === 3) return "Medium";
  return "High";
}

interface ScaleButtonGroupProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  accent?: "indigo" | "emerald" | "blue" | "orange" | "zinc";
  disabled?: boolean;
}

const ACCENT_CLASSES: Record<string, { active: string; ring: string }> = {
  indigo: {
    active: "bg-indigo-600 text-white border-indigo-600",
    ring: "focus-visible:ring-indigo-400",
  },
  emerald: {
    active: "bg-emerald-600 text-white border-emerald-600",
    ring: "focus-visible:ring-emerald-400",
  },
  blue: {
    active: "bg-blue-600 text-white border-blue-600",
    ring: "focus-visible:ring-blue-400",
  },
  orange: {
    active: "bg-orange-600 text-white border-orange-600",
    ring: "focus-visible:ring-orange-400",
  },
  zinc: {
    active: "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100",
    ring: "focus-visible:ring-zinc-400",
  },
};

export function ScaleButtonGroup({
  label,
  value,
  onChange,
  accent = "zinc",
  disabled = false,
}: ScaleButtonGroupProps) {
  const accentClasses = ACCENT_CLASSES[accent];
  const options = Array.from(
    { length: SCALE_MAX - SCALE_MIN + 1 },
    (_, i) => SCALE_MIN + i
  );

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {value} · {labelFor(value)}
        </span>
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid grid-cols-5 gap-1.5"
      >
        {options.map((v) => {
          const selected = v === value;
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${label}: ${v}`}
              disabled={disabled}
              onClick={() => onChange(v)}
              className={`h-10 rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 ${accentClasses.ring} ${
                selected
                  ? `${accentClasses.active} shadow-sm`
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              } ${disabled ? "opacity-50" : ""}`}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}
