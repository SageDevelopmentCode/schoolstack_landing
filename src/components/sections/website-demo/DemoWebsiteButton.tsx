import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "soft" | "outline";

export default function DemoWebsiteButton({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold font-secondary transition-all duration-200 cursor-pointer disabled:cursor-default disabled:opacity-60";

  const styles: Record<Variant, React.CSSProperties> = {
    primary: {
      backgroundColor: "var(--demo-primary)",
      color: "#ffffff",
      borderRadius: "var(--demo-radius-button)",
      boxShadow: "var(--demo-shadow-pill)",
    },
    soft: {
      backgroundColor: "var(--demo-primary-soft)",
      color: "var(--demo-primary)",
      borderRadius: "var(--demo-radius-button)",
      border: "1px solid color-mix(in srgb, var(--demo-primary) 22%, transparent)",
    },
    outline: {
      backgroundColor: "transparent",
      color: "var(--demo-ink)",
      borderRadius: "var(--demo-radius-button)",
      border: "1px solid var(--demo-line)",
    },
  };

  const sizeClass = variant === "soft" ? "px-5 py-2.5 text-sm" : "px-6 py-3 text-sm";

  return (
    <button
      type="button"
      className={`${base} ${sizeClass} ${className}`}
      style={styles[variant]}
      {...props}
    >
      {children}
    </button>
  );
}
