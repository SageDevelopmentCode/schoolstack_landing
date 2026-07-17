import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export const BUTTON_LOADING_LAYOUT_CLASS = "inline-flex items-center justify-center gap-2";

type ButtonLoadingLabelProps = {
  loading: boolean;
  loadingLabel: string;
  children: ReactNode;
  iconClassName?: string;
};

export default function ButtonLoadingLabel({
  loading,
  loadingLabel,
  children,
  iconClassName = "h-4 w-4 shrink-0 animate-spin",
}: ButtonLoadingLabelProps) {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <>
      <Loader2 className={iconClassName} aria-hidden />
      {loadingLabel}
    </>
  );
}
