"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import JSZip from "jszip";
import { dataUrlBase64, downloadUrl, nodeToPng } from "@/components/admin/marketing/export-png";
import {
  BRAND_MARKS,
  brandMarksOfKind,
  DEFAULT_BRAND_MARK_ID,
  getBrandMark,
  seasonTiming,
  type SeasonTiming,
} from "@/components/admin/marketing/brand-marks/registry";
import type { BrandMark, BrandMarkKind, LogoSection } from "@/components/admin/marketing/brand-marks/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

/*
 * State for the Avatars & icons studio (/admin/marketing/avatars): selection
 * in the URL (?mark=), kind switching, rail groups, PNG / zip export.
 * The Garden view (BrandMarkStudio) only renders what this returns.
 */

export const KIND_ORDER: BrandMarkKind[] = ["avatar", "app-icon", "cover", "ios-header", "link-preview", "logo"];
export const KIND_LABEL: Record<BrandMarkKind, string> = {
  avatar: "Avatars",
  "app-icon": "App icons",
  cover: "Covers",
  "ios-header": "App Store",
  "link-preview": "Link previews",
  logo: "Logos",
};
const ZIP_NAME: Record<BrandMarkKind, string> = {
  avatar: "mudkitchen-profile-pictures.zip",
  "app-icon": "mudkitchen-app-icons.zip",
  cover: "mudkitchen-covers.zip",
  "ios-header": "mudkitchen-app-store-artwork.zip",
  "link-preview": "mudkitchen-link-previews.zip",
  logo: "mudkitchen-logo-stickers.zip",
};
const LOGO_SECTIONS: Array<{ section: LogoSection; label: string }> = [
  { section: "bowl", label: "Bowl only" },
  { section: "wordmark", label: "Bowl + MudKitchen" },
  { section: "badge", label: "Badges & seals" },
];

export type Backdrop = "checker" | "white" | "kraft" | "dark";

/** Wide banners (covers, App Store art) vs square marks. */
export const isWide = (kind: BrandMarkKind) => kind === "cover" || kind === "ios-header" || kind === "link-preview";

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

async function imagesReady(node: HTMLElement) {
  await Promise.all(Array.from(node.querySelectorAll("img")).map((img) => img.decode().catch(() => undefined)));
}

export function useBrandMarkStudioModel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = getBrandMark(searchParams.get("mark")) ?? getBrandMark(DEFAULT_BRAND_MARK_ID) ?? BRAND_MARKS[0];
  const kind = selected.kind;
  const allOfKind = useMemo(() => brandMarksOfKind(kind), [kind]);
  /** Covers and App Store art list one row per concept, in the selected format (and text mode). */
  const marks = useMemo(
    () =>
      kind === "cover"
        ? allOfKind.filter((m) => m.format === selected.format)
        : kind === "ios-header"
          ? allOfKind.filter((m) => m.iosFormat === selected.iosFormat && !!m.textless === !!selected.textless)
          : allOfKind,
    [allOfKind, kind, selected.format, selected.iosFormat, selected.textless],
  );

  const [showCrop, setShowCrop] = useState(true);
  const [backdrop, setBackdrop] = useState<Backdrop>("checker");
  const [exportMark, setExportMark] = useState<BrandMark>(selected);
  const [exporting, setExporting] = useState<"one" | "all" | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [today] = useState(() => new Date());

  const select = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("mark", id);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  function switchKind(next: BrandMarkKind) {
    if (next === kind) return;
    if (next === "logo") {
      select(brandMarksOfKind("logo")[0]?.id ?? DEFAULT_BRAND_MARK_ID);
      return;
    }
    if (isWide(next) || isWide(kind) || kind === "logo") {
      select(
        isWide(next)
          ? (brandMarksOfKind(next)[0]?.id ?? DEFAULT_BRAND_MARK_ID)
          : next === "avatar"
            ? DEFAULT_BRAND_MARK_ID
            : `${DEFAULT_BRAND_MARK_ID}-icon`,
      );
      return;
    }
    const base = selected.id.replace(/-icon$/, "");
    const counterpart = getBrandMark(next === "app-icon" ? `${base}-icon` : base);
    select(counterpart?.kind === next ? counterpart.id : (brandMarksOfKind(next)[0]?.id ?? DEFAULT_BRAND_MARK_ID));
  }

  const groups = useMemo(() => {
    if (kind === "logo") {
      return LOGO_SECTIONS.map(({ section, label }) => ({
        label,
        items: marks.filter((m) => m.section === section).map((mark) => ({ mark, timing: null as SeasonTiming | null })),
      }));
    }
    const timed = marks
      .filter((mark) => mark.season)
      .map((mark) => ({ mark, timing: seasonTiming(mark.season!, today) }))
      .sort((a, b) => a.timing.daysUntil - b.timing.daysUntil);
    return [
      { label: "Coming up", items: timed.filter((t) => t.timing.state !== "later") },
      { label: "Everyday", items: marks.filter((m) => m.group === "everyday").map((mark) => ({ mark, timing: null })) },
      { label: "The crew", items: marks.filter((m) => m.group === "crew").map((mark) => ({ mark, timing: null })) },
      { label: "Later this year", items: timed.filter((t) => t.timing.state === "later") },
    ];
  }, [kind, marks, today]);

  const selectedTiming = selected.season ? seasonTiming(selected.season, today) : null;

  /** Mounts `mark` in the off-screen export slot at full size and captures it. */
  async function capture(mark: BrandMark) {
    flushSync(() => setExportMark(mark));
    await nextFrame();
    const node = exportRef.current;
    if (!node) throw new Error("Export area is not ready.");
    await imagesReady(node);
    return nodeToPng(node, mark.width, mark.height);
  }

  async function downloadOne(): Promise<void> {
    setExporting("one");
    try {
      const name = `mudkitchen-${selected.fileName}`;
      downloadUrl(await capture(selected), name);
      adminToast.dismiss("brand-mark-export-error");
      adminToast.success(`${selected.title} downloaded.`, { id: "brand-mark-export", description: name });
    } catch (error) {
      adminToast.error("Couldn't export this design.", {
        id: "brand-mark-export-error",
        description: `${formatActionError(error, "The export failed.")} Nothing was downloaded.`,
        action: { label: "Retry", onClick: () => void downloadOne() },
      });
    } finally {
      setExporting(null);
    }
  }

  async function downloadAll(): Promise<void> {
    setExporting("all");
    try {
      const zip = new JSZip();
      for (let i = 0; i < allOfKind.length; i += 1) {
        const mark = allOfKind[i];
        setProgress(`${i + 1} / ${allOfKind.length}`);
        // Link previews unzip flat, straight into public/og/.
        const folder =
          mark.kind === "cover"
            ? `${mark.format}/`
            : mark.kind === "ios-header"
              ? `${mark.iosFormat}/${mark.textless ? "art-only" : "text"}/`
              : mark.kind === "link-preview"
                ? ""
                : mark.kind === "logo"
                  ? `${mark.section ?? "other"}/`
                  : `${mark.group}/`;
        zip.file(`${folder}${mark.fileName}`, dataUrlBase64(await capture(mark)), { base64: true });
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      downloadUrl(url, ZIP_NAME[kind]);
      URL.revokeObjectURL(url);
      adminToast.dismiss("brand-mark-export-error");
      adminToast.success(`${allOfKind.length} ${KIND_LABEL[kind].toLowerCase()} exported.`, {
        id: "brand-mark-export",
        description: ZIP_NAME[kind],
      });
    } catch (error) {
      adminToast.error("Couldn't export the set.", {
        id: "brand-mark-export-error",
        description: `${formatActionError(error, "The export failed.")} Nothing was downloaded.`,
        action: { label: "Retry", onClick: () => void downloadAll() },
      });
    } finally {
      setProgress(null);
      setExporting(null);
      setExportMark(selected);
    }
  }

  return {
    selected,
    kind,
    allOfKind,
    groups,
    selectedTiming,
    select,
    switchKind,
    showCrop,
    setShowCrop,
    backdrop,
    setBackdrop,
    exportMark,
    exportRef,
    exporting,
    progress,
    downloadOne,
    downloadAll,
  };
}
