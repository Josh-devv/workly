import * as React from "react";
import { cn } from "@/app/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[linear-gradient(135deg,#cfeee5_0%,#0e5d53_100%)] text-white hover:brightness-105 shadow-[0_12px_30px_rgba(14,93,83,0.22)]",
  secondary: "bg-[#f7faf8] text-[#111827] border border-[#cfe4dd] hover:bg-[#edf7f2]",
  outline: "border border-[#cbe3db] bg-white/80 text-[#1f2937] hover:bg-[#f4faf7]",
  ghost: "text-[#374151] hover:bg-[#edf7f2] hover:text-[#111827]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if (asChild && React.isValidElement(children)) {
    const child = React.Children.only(children) as React.ReactElement<{ className?: string }>;

    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
    });
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
