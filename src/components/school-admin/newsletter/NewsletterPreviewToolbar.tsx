"use client";

import { Check, Download, Eye, EyeOff, History, Monitor, Smartphone } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import SchoolAdminSegmentedControl from "@/components/school-admin/ui/SchoolAdminSegmentedControl";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { PreviewDevice } from "./NewsletterPreviewPanel";
import styles from "./newsletter-workspace.module.css";

const iconBtnClass = "!px-[7px] !py-[7px] !gap-0";
const publishBtnClass = `${iconBtnClass} !text-[10px] !leading-none whitespace-nowrap`;

type NewsletterPreviewToolbarProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  device: PreviewDevice;
  locked: boolean;
  previewVisible: boolean;
  variant?: "default" | "pagehead";
  className?: string;
  onTogglePreview: () => void;
  onDeviceChange: (device: PreviewDevice) => void;
  onExport: () => void;
  onVersionHistory: () => void;
  onPublish: () => void;
};

export default function NewsletterPreviewToolbar({
  theme,
  C,
  device,
  locked,
  previewVisible,
  variant = "pagehead",
  className = "",
  onTogglePreview,
  onDeviceChange,
  onExport,
  onVersionHistory,
  onPublish,
}: NewsletterPreviewToolbarProps) {
  const previewToggleLabel = previewVisible ? "Hide preview" : "Show preview";

  const tools = (
    <div className={`${styles.previewTools} ${styles.previewToolsCompact}`}>
      {previewVisible ? (
        <SchoolAdminSegmentedControl
          C={C}
          value={device}
          iconOnly
          onChange={(value) => onDeviceChange(value as PreviewDevice)}
          ariaLabel="Preview device"
          options={[
            { value: "desktop", label: "Desktop", icon: Monitor },
            { value: "mobile", label: "Mobile", icon: Smartphone },
          ]}
        />
      ) : null}
      <AdminButton
        theme={theme}
        variant="outline"
        size="compact"
        className={iconBtnClass}
        aria-label="Export"
        onClick={onExport}
      >
        <Download size={14} strokeWidth={1.65} aria-hidden />
      </AdminButton>
      <AdminButton
        theme={theme}
        variant="outline"
        size="compact"
        className={iconBtnClass}
        aria-label={previewToggleLabel}
        onClick={onTogglePreview}
      >
        {previewVisible ? (
          <EyeOff size={14} strokeWidth={1.65} aria-hidden />
        ) : (
          <Eye size={14} strokeWidth={1.65} aria-hidden />
        )}
      </AdminButton>
      <AdminButton
        theme={theme}
        variant="outline"
        size="compact"
        className={iconBtnClass}
        aria-label="Version history"
        onClick={onVersionHistory}
      >
        <History size={14} strokeWidth={1.65} aria-hidden />
      </AdminButton>
      <AdminButton
        theme={theme}
        variant="primary"
        size="compact"
        className={publishBtnClass}
        onClick={onPublish}
      >
        {locked ? (
          <Eye size={14} strokeWidth={1.65} aria-hidden />
        ) : (
          <Check size={14} strokeWidth={1.65} aria-hidden />
        )}
        {locked ? "View edition" : "Review & publish"}
      </AdminButton>
    </div>
  );

  if (variant === "pagehead") {
    return (
      <div className={`${styles.pageheadToolbarRoot} ${className}`.trim()}>{tools}</div>
    );
  }

  return (
    <div className={`${styles.previewToolbar} ${className}`.trim()}>
      <div className={styles.previewToolbarSpacer} aria-hidden />
      {tools}
    </div>
  );
}
