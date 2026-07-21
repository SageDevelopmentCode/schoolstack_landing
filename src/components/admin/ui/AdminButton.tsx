import type { ButtonHTMLAttributes, ReactNode } from "react";

type AdminButtonVariant = "primary" | "secondary" | "ghost";

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AdminButtonVariant;
  children: ReactNode;
};

const VARIANT_CLASSES: Record<AdminButtonVariant, string> = {
  primary:
    "bg-admin-accent text-white hover:bg-admin-accent-hover border border-admin-accent",
  secondary:
    "bg-admin-surface text-admin-text border border-admin-border hover:bg-admin-neutral-bg",
  ghost:
    "bg-transparent text-admin-muted border border-transparent hover:text-admin-text hover:bg-admin-neutral-bg",
};

export function AdminButton({
  variant = "secondary",
  className = "",
  children,
  ...props
}: AdminButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 h-9 px-3 text-sm font-medium rounded-admin-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30 disabled:opacity-60 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
