import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  SITE_BTN_GHOST_DARK,
  SITE_BTN_ON_DARK,
  SITE_BTN_OUTLINE,
  SITE_BTN_PRIMARY,
} from "./site-garden-theme";

type Variant = "primary" | "outline" | "onDark" | "ghostDark";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: SITE_BTN_PRIMARY,
  outline: SITE_BTN_OUTLINE,
  onDark: SITE_BTN_ON_DARK,
  ghostDark: SITE_BTN_GHOST_DARK,
};

/** Garden "toy" buttons in the school's colours. */
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
    <button type={type} className={`${VARIANT_CLASS[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
