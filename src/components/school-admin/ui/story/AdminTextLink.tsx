import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdminTextLinkProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  theme: ParentThemeTokens;
  children: ReactNode;
};

export default function AdminTextLink({
  theme,
  children,
  className = "",
  ...props
}: AdminTextLinkProps) {
  return (
    <button
      type="button"
      className={`cursor-pointer border-0 bg-transparent p-0 text-xs font-extrabold ${className}`}
      style={{ color: theme.primary }}
      {...props}
    >
      {children}
    </button>
  );
}
