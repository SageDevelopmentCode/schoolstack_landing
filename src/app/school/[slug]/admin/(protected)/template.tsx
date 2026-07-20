import type { ReactNode } from "react";

type SchoolAdminTemplateProps = {
  children: ReactNode;
};

export default function SchoolAdminTemplate({ children }: SchoolAdminTemplateProps) {
  return <>{children}</>;
}
