import type { CSSProperties, ReactNode } from "react";

export default function DemoWebsiteCard({
  children,
  className = "",
  style,
  padding = "default",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padding?: "default" | "compact" | "none";
}) {
  const paddingClass =
    padding === "none" ? "" : padding === "compact" ? "p-5" : "p-6 sm:p-7";

  return (
    <div
      className={`border bg-white ${paddingClass} ${className}`}
      style={{
        borderColor: "var(--demo-line)",
        borderRadius: "var(--demo-radius-card)",
        boxShadow: "var(--demo-shadow-card)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
