import React from "react";

type SpinnerVariant = "primary" | "white" | "current";
type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  xs: "w-3 h-3 border",
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-2",
  xl: "w-10 h-10 border-2",
};

const variantMap: Record<SpinnerVariant, string> = {
  primary: "border-gray-200 border-t-primary",
  white:   "border-white/30 border-t-white",
  current: "border-current/30 border-t-current",
};

export default function Spinner({
  size = "lg",
  variant = "primary",
  className = "",
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full shrink-0 ${sizeMap[size]} ${variantMap[variant]} ${className}`}
    />
  );
}

/** Centred full-page spinner — drop-in for page-level loading states */
export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Spinner size="xl" />
    </div>
  );
}
