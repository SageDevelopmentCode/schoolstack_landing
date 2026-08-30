import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentTextLinkProps = {
  theme: ParentThemeTokens;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  light?: boolean;
};

export default function ParentTextLink({
  theme,
  href,
  onClick,
  children,
  className = "",
  light = false,
}: ParentTextLinkProps) {
  const style = {
    color: light ? "#D8EFD8" : theme.primary,
  };

  const classes = `inline-flex items-center gap-1 text-[13px] font-bold transition-opacity hover:opacity-80 ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} style={style}>
        {children}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes} style={style}>
      {children}
      <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}
