"use client";

import { Download, Eye, EyeOff, Monitor, Smartphone } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { NewsletterEdition } from "@/lib/school-admin/newsletter/newsletter-types";
import AdminStoryFilterPill from "@/components/school-admin/ui/story/AdminStoryFilterPill";
import type { PreviewDevice } from "./NewsletterPreviewPanel";
import styles from "./newsletter-workspace.module.css";

type NewsletterPreviewToolbarProps = {
  theme: ParentThemeTokens;
  edition: NewsletterEdition;
  device: PreviewDevice;
  locked: boolean;
  previewVisible: boolean;
  layoutSelectId?: string;
  className?: string;
  onTogglePreview: () => void;
  onDeviceChange: (device: PreviewDevice) => void;
  onLayoutChange: (layout: NewsletterEdition["layout"]) => void;
  onExport: () => void;
};

export default function NewsletterPreviewToolbar({
  theme,
  edition,
  device,
  locked,
  previewVisible,
  layoutSelectId = "newsletter-layout-select",
  className = "",
  onTogglePreview,
  onDeviceChange,
  onLayoutChange,
  onExport,
}: NewsletterPreviewToolbarProps) {
  return (
    <div className={`${styles.previewToolbar} ${className}`.trim()}>
      <div className={styles.previewLeft}>
        <label htmlFor={layoutSelectId} style={{ color: theme.muted }}>
          Layout
        </label>
        <select
          id={layoutSelectId}
          className={styles.layoutSelect}
          value={edition.layout}
          disabled={locked}
          style={{
            borderColor: theme.line,
            backgroundColor: theme.white,
            color: theme.ink,
          }}
          onChange={(e) =>
            onLayoutChange(e.target.value as NewsletterEdition["layout"])
          }
        >
          <option value="storybook">Storybook</option>
          <option value="brief">Weekly brief</option>
          <option value="journal">Classroom journal</option>
        </select>
      </div>
      <div className={styles.previewTools}>
        <AdminStoryFilterPill
          theme={theme}
          active={device === "desktop"}
          aria-label="Desktop preview"
          aria-pressed={device === "desktop"}
          label={<Monitor size={13} strokeWidth={1.65} aria-hidden />}
          onClick={() => onDeviceChange("desktop")}
        />
        <AdminStoryFilterPill
          theme={theme}
          active={device === "mobile"}
          aria-label="Mobile preview"
          aria-pressed={device === "mobile"}
          label={<Smartphone size={13} strokeWidth={1.65} aria-hidden />}
          onClick={() => onDeviceChange("mobile")}
        />
        <AdminStoryFilterPill
          theme={theme}
          active={false}
          label={
            <span className="inline-flex items-center gap-1">
              <Download size={12} strokeWidth={1.65} aria-hidden />
              Export
            </span>
          }
          onClick={onExport}
        />
        <AdminStoryFilterPill
          theme={theme}
          active={false}
          label={
            <span className="inline-flex items-center gap-1">
              {previewVisible ? (
                <EyeOff size={12} strokeWidth={1.65} aria-hidden />
              ) : (
                <Eye size={12} strokeWidth={1.65} aria-hidden />
              )}
              {previewVisible ? "Hide preview" : "Show preview"}
            </span>
          }
          onClick={onTogglePreview}
        />
      </div>
    </div>
  );
}
