import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export default function SchoolParentLayout({ children }: LayoutProps) {
  return children;
}
