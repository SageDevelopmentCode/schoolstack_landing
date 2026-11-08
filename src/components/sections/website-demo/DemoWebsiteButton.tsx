import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  DEMO_GHOST_PILL_ON_DARK,
  DEMO_OUTLINE_PILL,
  DEMO_PRIMARY_PILL,
  DEMO_WHITE_PILL,
} from "./bright-demo-theme";

type Variant = "primary" | "outline" | "white" | "ghostDark";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: DEMO_PRIMARY_PILL,
  outline: DEMO_OUTLINE_PILL,
  white: DEMO_WHITE_PILL,
  ghostDark: DEMO_GHOST_PILL_ON_DARK,
};

export default function DemoWebsiteButton({
  variant = "primary",
  children,
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      className={`${VARIANT_CLASS[variant]} cursor-pointer disabled:cursor-default disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
