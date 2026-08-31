import * as React from "react";
import { cn } from "@/app/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";

const badgeClasses: Record<BadgeVariant, string> = {
  default: "border-slate-200 bg-slate-100 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-rose-200 bg-rose-50 text-rose-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-[0.01em]",
        badgeClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
