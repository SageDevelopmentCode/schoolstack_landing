"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

/*
 * Promise-based confirm for admin pages (replaces window.confirm). Garden
 * pages get GConfirmDialog through the skin.
 *
 *   const { confirm, dialog } = useAdminConfirm(C);
 *   if (!(await confirm({ title: "Waive $40 late fee?", confirmLabel: "Waive" }))) return;
 *   …render {dialog}
 */

export type AdminConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
};

export function useAdminConfirm(C: AdminThemeTokens): {
  confirm: (options: AdminConfirmOptions) => Promise<boolean>;
  dialog: ReactNode;
} {
  const [options, setOptions] = useState<AdminConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const settle = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const confirm = useCallback((next: AdminConfirmOptions) => {
    resolverRef.current?.(false);
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const dialog = (
    <ConfirmDialog
      C={C}
      open={options != null}
      title={options?.title ?? ""}
      description={options?.description ?? ""}
      confirmLabel={options?.confirmLabel ?? "Confirm"}
      cancelLabel={options?.cancelLabel}
      variant={options?.destructive === false ? "default" : "destructive"}
      onConfirm={() => settle(true)}
      onClose={() => settle(false)}
    />
  );

  return { confirm, dialog };
}
