"use client";

import { Children, isValidElement, useMemo, type ReactNode } from "react";
import CustomSelect, {
  SUPER_ADMIN_SELECT_THEME,
  type CustomSelectOption,
} from "@/components/ui/CustomSelect";

type AdminSelectProps = {
  id?: string;
  value?: string;
  onChange?: (event: { target: { value: string } }) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  children: ReactNode;
};

function parseSelectOptions(children: ReactNode): CustomSelectOption[] {
  const options: CustomSelectOption[] = [];

  Children.forEach(children, (child) => {
    if (isValidElement<{ value?: string; children?: ReactNode }>(child) && child.type === "option") {
      options.push({
        value: String(child.props.value ?? ""),
        label: String(child.props.children ?? ""),
      });
    }
  });

  return options;
}

export function AdminSelect({
  id,
  value = "",
  onChange,
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
  children,
}: AdminSelectProps) {
  const options = useMemo(() => parseSelectOptions(children), [children]);

  return (
    <CustomSelect
      id={id}
      value={value}
      onChange={(nextValue) => onChange?.({ target: { value: nextValue } })}
      options={options}
      disabled={disabled}
      ariaLabel={ariaLabel ?? options.find((o) => o.value === value)?.label ?? "Select"}
      theme={SUPER_ADMIN_SELECT_THEME}
      className={className}
      triggerClassName="text-sm rounded-admin-md px-2.5 py-1.5"
    />
  );
}
