import type { ReactNode } from "react";

type AdminDataTableProps = {
  children: ReactNode;
  className?: string;
};

export function AdminDataTable({ children, className = "" }: AdminDataTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm text-left">{children}</table>
    </div>
  );
}

export function AdminDataTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-admin-bg border-b border-admin-border">
      <tr>{children}</tr>
    </thead>
  );
}

export function AdminDataTableHeaderCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-2.5 text-[11px] font-semibold text-admin-faint uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

export function AdminDataTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-admin-border">{children}</tbody>;
}

export function AdminDataTableRow({
  children,
  onClick,
  selected,
}: {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) {
  const Tag = onClick ? "button" : "tr";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`w-full text-left transition-colors ${
        onClick ? "hover:bg-admin-bg cursor-pointer" : "hover:bg-admin-bg/60"
      } ${selected ? "bg-admin-accent-soft" : "bg-admin-surface"}`}
    >
      {children}
    </Tag>
  );
}

export function AdminDataTableCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-3 text-admin-text align-middle ${className}`}>
      {children}
    </td>
  );
}
