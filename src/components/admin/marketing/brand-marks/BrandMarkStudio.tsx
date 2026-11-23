"use client";

import { useCallback, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import JSZip from "jszip";
import { AdminSwitch } from "@/components/admin/ui/AdminSwitch";
import { dataUrlBase64, downloadUrl, nodeToPng } from "@/components/admin/marketing/export-png";
import { MarkStage, svgSrc } from "@/components/admin/marketing/brand-marks/mark-kit";
import { BOWL_VECTOR } from "@/components/admin/marketing/brand-marks/bowl-vector";
import {
  BRAND_MARKS,
  brandMarksOfKind,
  coverInFormat,
  DEFAULT_BRAND_MARK_ID,
  designCount,
  formatMonthDay,
  getBrandMark,
  iosHeaderSibling,
  seasonTiming,
  type SeasonTiming,
} from "@/components/admin/marketing/brand-marks/registry";
import {
  COVER_FORMAT_ORDER,
  COVER_FORMATS,
  IOS_HEADER_FORMAT_ORDER,
  IOS_HEADER_FORMATS,
  type BrandMark,
  type BrandMarkKind,
  type LogoSection,
} from "@/components/admin/marketing/brand-marks/types";

const KIND_ORDER: BrandMarkKind[] = ["avatar", "app-icon", "cover", "ios-header", "link-preview", "logo"];
const KIND_LABEL: Record<BrandMarkKind, string> = { avatar: "Avatars", "app-icon": "App icons", cover: "Covers", "ios-header": "App Store", "link-preview": "Link previews", logo: "Logos" };
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
/** Print resolution the Logos tab quotes sizes against. */
const PRINT_DPI = 300;

type Backdrop = "checker" | "white" | "kraft" | "dark";
const BACKDROPS: Array<{ value: Backdrop; label: string }> = [
  { value: "checker", label: "Transparent" },
  { value: "white", label: "White" },
  { value: "kraft", label: "Kraft" },
  { value: "dark", label: "Dark" },
];
function backdropStyle(backdrop: Backdrop, cell = 16): CSSProperties {
  if (backdrop === "white") return { background: "#FFFFFF" };
  if (backdrop === "kraft") return { background: "#C9A878" };
  if (backdrop === "dark") return { background: "#2B2F33" };
  return { background: `repeating-conic-gradient(#E6E2DC 0% 25%, #FFFFFF 0% 50%) 0 0 / ${cell}px ${cell}px` };
}
/** Wide banners (covers, App Store art) vs square marks. */
const isWide = (kind: BrandMarkKind) => kind === "cover" || kind === "ios-header" || kind === "link-preview";
/** iOS-style continuous-corner approximation. */
const SQUIRCLE = "22.37%";

function MarkView({ mark, size }: { mark: BrandMark; size: number }) {
  return (
    <MarkStage width={size} height={Math.round((size * mark.height) / mark.width)} stageW={mark.stage.w} stageH={mark.stage.h} background={mark.background}>
      {mark.render()}
    </MarkStage>
  );
}

/** A mark clipped to how platforms show it: a circle for avatars, a rounded square for icons. */
function Masked({ mark, size, ring = false }: { mark: BrandMark; size: number; ring?: boolean }) {
  if (mark.kind === "logo") return <LogoFit mark={mark} size={size} backdrop="checker" ring={ring} />;
  if (isWide(mark.kind)) {
    return (
      <div className={`shrink-0 overflow-hidden rounded-[4px] ${ring ? "ring-1 ring-black/10" : ""}`}>
        <MarkView mark={mark} size={size} />
      </div>
    );
  }
  return (
    <div
      className={ring ? "ring-1 ring-black/10" : undefined}
      style={{ width: size, height: size, overflow: "hidden", borderRadius: mark.kind === "avatar" ? "50%" : SQUIRCLE, flexShrink: 0 }}
    >
      <MarkView mark={mark} size={size} />
    </div>
  );
}

/** A logo sticker fitted into a size×size box over a backdrop (bumpers sit centred). */
function LogoFit({ mark, size, backdrop, ring = false, rounded = 6 }: { mark: BrandMark; size: number; backdrop: Backdrop; ring?: boolean; rounded?: number }) {
  const w = mark.width >= mark.height ? size : Math.round((size * mark.width) / mark.height);
  return (
    <div
      className={ring ? "ring-1 ring-black/10" : undefined}
      style={{ ...backdropStyle(backdrop, Math.max(6, Math.round(size / 24))), width: size, height: size, borderRadius: rounded, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <MarkView mark={mark} size={w} />
    </div>
  );
}

function timingLabel(timing: SeasonTiming) {
  if (timing.state === "now") return "In season";
  if (timing.daysUntil === 1) return "Tomorrow";
  return `In ${timing.daysUntil} days`;
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

async function imagesReady(node: HTMLElement) {
  await Promise.all(
    Array.from(node.querySelectorAll("img")).map((img) => img.decode().catch(() => undefined)),
  );
}

export default function BrandMarkStudio() {
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
  const [exportError, setExportError] = useState<string | null>(null);
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

  async function downloadOne() {
    setExporting("one");
    setExportError(null);
    try {
      downloadUrl(await capture(selected), `mudkitchen-${selected.fileName}`);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Could not export this design.");
    } finally {
      setExporting(null);
    }
  }

  async function downloadAll() {
    setExporting("all");
    setExportError(null);
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
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Could not export the set.");
    } finally {
      setProgress(null);
      setExporting(null);
      setExportMark(selected);
    }
  }

  const exportSize = exportMark.width;

  return (
    <div className="flex h-[calc(100vh-3rem)] min-h-0 overflow-hidden">
      <aside className="flex w-80 shrink-0 flex-col overflow-hidden border-r border-admin-border bg-admin-surface">
        <div className="shrink-0 border-b border-admin-border px-4 py-3">
          <div role="tablist" aria-label="Design type" className="grid grid-cols-2 gap-1 rounded-admin-md bg-admin-canvas p-1">
            {KIND_ORDER.map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={kind === option}
                onClick={() => switchKind(option)}
                className={`rounded-admin-md px-2 py-1.5 text-xs font-medium transition-colors ${
                  kind === option ? "bg-admin-surface text-admin-text shadow-sm" : "text-admin-muted hover:text-admin-text"
                }`}
              >
                {KIND_LABEL[option]} · {designCount(option)}
              </button>
            ))}
          </div>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3" aria-label={KIND_LABEL[kind]}>
          {groups.map((group) =>
            group.items.length ? (
              <section key={group.label} className="flex flex-col gap-1.5">
                <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-admin-faint">
                  {group.label} · {group.items.length}
                </p>
                {group.items.map(({ mark, timing }) => {
                  const isSelected = mark.id === selected.id;
                  return (
                    <button
                      key={mark.id}
                      type="button"
                      aria-current={isSelected ? "true" : undefined}
                      onClick={() => select(mark.id)}
                      className={`flex w-full items-center gap-3 rounded-admin-md border px-2 py-2 text-left transition-colors ${
                        isSelected
                          ? "border-admin-accent/30 bg-admin-accent/10"
                          : "border-transparent hover:border-admin-border hover:bg-admin-canvas/50"
                      }`}
                    >
                      <Masked mark={mark} size={isWide(kind) ? 92 : 44} ring />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-admin-text">{mark.title}</span>
                        <span className="block truncate text-[11px] text-admin-muted">
                          {mark.season ? `${formatMonthDay(mark.season.from)} – ${formatMonthDay(mark.season.to)}` : mark.description}
                        </span>
                      </span>
                      {timing && timing.state !== "later" ? (
                        <span
                          className={`shrink-0 rounded-admin-sm px-1.5 py-0.5 text-[10px] font-medium ${
                            timing.state === "now" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {timingLabel(timing)}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </section>
            ) : null,
          )}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-admin-border bg-admin-surface px-6 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-semibold text-admin-text">{selected.title}</h1>
              {selected.season ? (
                <span className="rounded-admin-sm border border-admin-border px-1.5 py-0.5 text-[11px] text-admin-muted">
                  {selected.season.label} · {formatMonthDay(selected.season.from)} – {formatMonthDay(selected.season.to)}
                  {selectedTiming && selectedTiming.state !== "later" ? ` · ${timingLabel(selectedTiming)}` : ""}
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 truncate text-xs text-admin-muted">
              {selected.description ? `${selected.description} · ` : ""}
              {selected.width}×{selected.height} PNG
              {kind === "app-icon"
                ? " · square, no transparency (the phone rounds the corners)"
                : kind === "cover" && selected.format
                  ? ` · ${COVER_FORMATS[selected.format].label}`
                  : kind === "ios-header" && selected.iosFormat
                    ? ` · ${IOS_HEADER_FORMATS[selected.iosFormat].label}${selected.textless ? " · art only" : ""}`
                    : kind === "link-preview"
                      ? ` · link preview for ${selected.pages?.join(", ") ?? ""} · save into public/og/`
                      : kind === "logo"
                        ? ` · transparent · prints sharp up to ${(selected.width / PRINT_DPI).toFixed(1)}×${(selected.height / PRINT_DPI).toFixed(1)} in at ${PRINT_DPI} dpi`
                        : " · shown as a circle on most platforms"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {kind === "cover" ? (
              <div role="tablist" aria-label="Cover size" className="flex gap-1 rounded-admin-md bg-admin-canvas p-1">
                {COVER_FORMAT_ORDER.map((format) => (
                  <button
                    key={format}
                    type="button"
                    role="tab"
                    aria-selected={selected.format === format}
                    onClick={() => {
                      const sibling = coverInFormat(selected, format);
                      if (sibling) select(sibling.id);
                    }}
                    className={`rounded-admin-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      selected.format === format ? "bg-admin-surface text-admin-text shadow-sm" : "text-admin-muted hover:text-admin-text"
                    }`}
                  >
                    {COVER_FORMATS[format].short}
                  </button>
                ))}
              </div>
            ) : null}
            {kind === "ios-header" ? (
              <>
                <Segmented
                  label="Artwork size"
                  options={IOS_HEADER_FORMAT_ORDER.map((format) => ({ value: format, label: IOS_HEADER_FORMATS[format].short }))}
                  value={selected.iosFormat}
                  onChange={(format) => {
                    const sibling = iosHeaderSibling(selected, { format });
                    if (sibling) select(sibling.id);
                  }}
                />
                <Segmented
                  label="Text"
                  options={[
                    { value: "text", label: "With text" },
                    { value: "art", label: "Art only" },
                  ]}
                  value={selected.textless ? "art" : "text"}
                  onChange={(mode) => {
                    const sibling = iosHeaderSibling(selected, { textless: mode === "art" });
                    if (sibling) select(sibling.id);
                  }}
                />
              </>
            ) : null}
            {kind === "logo" ? (
              <Segmented label="Preview on" options={BACKDROPS} value={backdrop} onChange={setBackdrop} />
            ) : (
              <label className="flex items-center gap-2">
                <AdminSwitch checked={showCrop} onChange={setShowCrop} label="Show crop" />
                <span className="text-sm text-admin-text">Show crop</span>
              </label>
            )}
            <button
              type="button"
              onClick={() => void downloadOne()}
              disabled={exporting != null}
              className="inline-flex items-center gap-1.5 rounded-admin-md border border-admin-border bg-admin-surface px-3 py-1.5 text-sm font-medium text-admin-text disabled:opacity-60"
            >
              {exporting === "one" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Download PNG
            </button>
            <button
              id="brand-mark-download-all"
              type="button"
              onClick={() => void downloadAll()}
              disabled={exporting != null}
              className="inline-flex items-center gap-1.5 rounded-admin-md bg-admin-accent px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {exporting === "all" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {progress ? `Exporting ${progress}` : `Download all ${allOfKind.length}`}
            </button>
          </div>
        </header>

        {exportError ? <p className="border-b border-admin-border px-6 py-2 text-sm text-red-700">{exportError}</p> : null}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-center gap-8 px-6 py-8">
            {kind === "cover" ? (
              <CoverPreview mark={selected} showCrop={showCrop} />
            ) : kind === "ios-header" ? (
              <IosHeaderPreview mark={selected} showCrop={showCrop} />
            ) : kind === "link-preview" ? (
              <LinkPreviewPreview mark={selected} showCrop={showCrop} />
            ) : kind === "logo" ? (
              <figure className="flex flex-col items-center gap-3">
                <div className="rounded-admin-md shadow-sm ring-1 ring-black/5">
                  <LogoFit mark={selected} size={460} backdrop={backdrop} rounded={8} />
                </div>
                <figcaption className="text-xs text-admin-muted">
                  {backdrop === "checker" ? "Checks = transparent. The printer cuts along the outer border." : "Full image, as downloaded"}
                </figcaption>
              </figure>
            ) : (
              <figure className="flex flex-col items-center gap-3">
                <div className="relative overflow-hidden rounded-admin-md shadow-sm ring-1 ring-black/5" style={{ width: 460, height: 460 }}>
                  <MarkView mark={selected} size={460} />
                  {showCrop ? (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        borderRadius: kind === "avatar" ? "50%" : SQUIRCLE,
                        boxShadow: "0 0 0 400px rgba(20,16,12,.62)",
                        outline: "2px dashed rgba(255,255,255,.8)",
                        outlineOffset: -2,
                      }}
                    />
                  ) : null}
                </div>
                <figcaption className="text-xs text-admin-muted">
                  {showCrop ? "Shaded area is cropped away when shown" : "Full image, as downloaded"}
                </figcaption>
              </figure>
            )}

            <div className={`flex flex-col gap-6 ${isWide(kind) ? "w-[820px]" : "w-[360px]"}`}>
              {kind === "avatar" ? (
                <AvatarMocks mark={selected} />
              ) : kind === "app-icon" ? (
                <IconMocks mark={selected} />
              ) : kind === "ios-header" ? (
                <IosHeaderMocks mark={selected} />
              ) : kind === "link-preview" ? (
                <LinkPreviewMocks mark={selected} />
              ) : kind === "logo" ? (
                <LogoMocks mark={selected} />
              ) : (
                <CoverMocks mark={selected} />
              )}
            </div>
          </div>
        </div>

        {/* Parked fully off-screen to the left, however wide the design (App Store art is 5244px). */}
        <div aria-hidden className="pointer-events-none fixed top-0" style={{ left: -(exportMark.width + 200) }}>
          <div ref={exportRef} style={{ width: exportMark.width, height: exportMark.height, overflow: "hidden", position: "relative" }}>
            <MarkView mark={exportMark} size={exportSize} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Segmented<T extends string>({ label, options, value, onChange }: { label: string; options: Array<{ value: T; label: string }>; value: T | undefined; onChange: (value: T) => void }) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 rounded-admin-md bg-admin-canvas p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-admin-md px-2.5 py-1 text-xs font-medium transition-colors ${
            value === option.value ? "bg-admin-surface text-admin-text shadow-sm" : "text-admin-muted hover:text-admin-text"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function MockCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-admin-md border border-admin-border bg-admin-surface p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-admin-faint">{title}</p>
      {children}
    </section>
  );
}

function AvatarMocks({ mark }: { mark: BrandMark }) {
  return (
    <>
      <MockCard title="Profile header">
        <div className="overflow-hidden rounded-admin-md border border-admin-border">
          <div className="h-20" style={{ background: "linear-gradient(120deg, #2E4A3C, #A6B89A)" }} />
          <div className="px-4 pb-4">
            <div className="-mt-10 inline-block rounded-full border-4 border-white bg-white">
              <Masked mark={mark} size={88} />
            </div>
            <p className="mt-1 text-sm font-semibold text-admin-text">MudKitchen</p>
            <p className="text-xs text-admin-muted">trymudkitchen.com</p>
          </div>
        </div>
      </MockCard>
      <MockCard title="In a feed">
        <div className="flex flex-col gap-3">
          {[
            { size: 40, line: "Posted a new photo" },
            { size: 32, line: "Replied to a comment" },
          ].map((row) => (
            <div key={row.size} className="flex items-center gap-3">
              <Masked mark={mark} size={row.size} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-admin-text">MudKitchen</p>
                <p className="text-xs text-admin-muted">{row.line}</p>
              </div>
            </div>
          ))}
        </div>
      </MockCard>
      <MockCard title="Small sizes">
        <div className="flex items-end gap-4">
          {[110, 64, 40, 24].map((size) => (
            <div key={size} className="flex flex-col items-center gap-1">
              <Masked mark={mark} size={size} ring />
              <span className="text-[10px] text-admin-faint">{size}px</span>
            </div>
          ))}
        </div>
      </MockCard>
    </>
  );
}

const PLACEHOLDER_APPS = ["#6FB7F2", "#7BC47F", "#FFCF3F", "#B98BEA", "#FF7A6B", "#E3EDFB", "#2B241D"];

function IconMocks({ mark }: { mark: BrandMark }) {
  return (
    <>
      <MockCard title="Home screen">
        <div className="rounded-[22px] p-5" style={{ background: "linear-gradient(160deg, #1F3329 0%, #556b5d 55%, #c9b79c 100%)" }}>
          <div className="grid grid-cols-4 gap-x-4 gap-y-3">
            {PLACEHOLDER_APPS.slice(0, 5).map((color, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="block h-[60px] w-[60px] opacity-80" style={{ borderRadius: SQUIRCLE, background: color }} />
                <span className="h-1.5 w-10 rounded-full bg-white/40" />
              </div>
            ))}
            <div className="flex flex-col items-center gap-1">
              <Masked mark={mark} size={60} />
              <span className="text-[10px] font-medium text-white">MudKitchen</span>
            </div>
            {PLACEHOLDER_APPS.slice(5).map((color, i) => (
              <div key={`b${i}`} className="flex flex-col items-center gap-1">
                <span className="block h-[60px] w-[60px] opacity-80" style={{ borderRadius: SQUIRCLE, background: color }} />
                <span className="h-1.5 w-10 rounded-full bg-white/40" />
              </div>
            ))}
          </div>
        </div>
      </MockCard>
      <MockCard title="Sizes">
        <div className="flex items-end gap-4">
          {[120, 60, 40, 29].map((size) => (
            <div key={size} className="flex flex-col items-center gap-1">
              <Masked mark={mark} size={size} ring />
              <span className="text-[10px] text-admin-faint">{size}pt</span>
            </div>
          ))}
        </div>
      </MockCard>
      <MockCard title="Using it">
        <p className="text-xs leading-relaxed text-admin-muted">
          The download is the 1024×1024 master for the App Store. To ship one, replace <code>apps/mobile/assets/images/icon.png</code> and
          make a new build. Android draws its icon from the separate adaptive-icon layers, so it keeps the classic bowl.
        </p>
      </MockCard>
    </>
  );
}

const PREVIEW_W = 820;

/** Wide cover preview with the profile-photo overlap and (Facebook) mobile crop shaded. */
function CoverPreview({ mark, showCrop }: { mark: BrandMark; showCrop: boolean }) {
  const spec = mark.format ? COVER_FORMATS[mark.format] : null;
  const k = PREVIEW_W / mark.width;
  const shade = "rgba(20,16,12,.55)";
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative overflow-hidden rounded-admin-md shadow-sm ring-1 ring-black/5" style={{ width: PREVIEW_W, height: Math.round(mark.height * k) }}>
        <MarkView mark={mark} size={PREVIEW_W} />
        {showCrop && spec ? (
          <>
            {spec.mobile ? (
              <>
                <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0" style={{ width: Math.round(spec.mobile.x * k), background: shade }} />
                <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0" style={{ width: Math.round((mark.width - spec.mobile.x - spec.mobile.w) * k), background: shade }} />
              </>
            ) : null}
            <span
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                left: Math.round(spec.photo.x * k),
                top: Math.round(spec.photo.y * k),
                width: Math.round(spec.photo.w * k),
                height: Math.round(spec.photo.h * k),
                borderRadius: spec.photo.shape === "circle" ? "50%" : 12,
                background: shade,
                outline: "2px dashed rgba(255,255,255,.85)",
              }}
            />
          </>
        ) : null}
      </div>
      <figcaption className="text-xs text-admin-muted">
        {showCrop
          ? spec?.mobile
            ? "Shaded: covered by the profile photo, and cut off on phones"
            : "Shaded: covered by the profile photo or page logo"
          : "Full image, as downloaded"}
      </figcaption>
    </figure>
  );
}

/** Generic page header with the cover and the default sticker avatar over it. */
function CoverMocks({ mark }: { mark: BrandMark }) {
  const avatar = getBrandMark(DEFAULT_BRAND_MARK_ID);
  const format = mark.format ?? "facebook";
  const spec = COVER_FORMATS[format];
  const w = 520;
  const k = w / mark.width;
  const photo = Math.round(spec.photo.w * k);
  const square = spec.photo.shape === "square";
  return (
    <MockCard title={`${spec.label} — how it sits`}>
      <div className="overflow-hidden rounded-admin-md border border-admin-border bg-white" style={{ width: w }}>
        <MarkView mark={mark} size={w} />
        <div className="relative px-4 pb-4" style={{ paddingTop: Math.round(photo * 0.5) + 6 }}>
          {avatar ? (
            <div
              className="absolute border-4 border-white bg-white"
              style={{ left: Math.round(spec.photo.x * k), top: -Math.round(photo * 0.5), borderRadius: square ? 10 : 999, overflow: "hidden" }}
            >
              <div style={{ borderRadius: square ? 6 : 999, overflow: "hidden" }}>
                <MarkView mark={avatar} size={photo} />
              </div>
            </div>
          ) : null}
          <p className="text-sm font-semibold text-admin-text">MudKitchen</p>
          <p className="text-xs text-admin-muted">trymudkitchen.com</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-admin-muted">
        Platforms move the photo around between layouts, so keep words and faces out of the shaded areas in the preview.
      </p>
    </MockCard>
  );
}

/** App Store artwork with the safe zone outlined and Apple's title band shaded. */
function IosHeaderPreview({ mark, showCrop }: { mark: BrandMark; showCrop: boolean }) {
  const spec = mark.iosFormat ? IOS_HEADER_FORMATS[mark.iosFormat] : null;
  const k = PREVIEW_W / (spec?.stage.w ?? mark.width);
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative overflow-hidden rounded-admin-md shadow-sm ring-1 ring-black/5" style={{ width: PREVIEW_W, height: Math.round((mark.height * PREVIEW_W) / mark.width) }}>
        <MarkView mark={mark} size={PREVIEW_W} />
        {showCrop && spec ? (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0"
              style={{ top: Math.round(spec.overlay.y * k), height: Math.round(spec.overlay.h * k) + 1, background: "linear-gradient(to bottom, rgba(20,16,12,.15), rgba(20,16,12,.6))" }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                left: Math.round(spec.safe.x * k),
                top: Math.round(spec.safe.y * k),
                width: Math.round(spec.safe.w * k),
                height: Math.round(spec.safe.h * k),
                outline: "2px dashed rgba(255,255,255,.9)",
                boxShadow: "0 0 0 2000px rgba(20,16,12,.28)",
              }}
            />
          </>
        ) : null}
      </div>
      <figcaption className="text-xs text-admin-muted">
        {showCrop ? "Keep faces and words inside the dashed box. Apple may crop the edges and put the title in the bottom band." : "Full image, as downloaded"}
      </figcaption>
    </figure>
  );
}

/** A featured App Store card, plus a centred 4:3 crop to check nothing important is lost. */
function IosHeaderMocks({ mark }: { mark: BrandMark }) {
  const icon = getBrandMark(`${DEFAULT_BRAND_MARK_ID}-icon`);
  const w = 520;
  const h = Math.round((mark.height * w) / mark.width);
  const cropH = 240;
  const cropW = Math.round((cropH * 4) / 3);
  const fullW = Math.round((cropH * mark.width) / mark.height);
  return (
    <>
      <MockCard title="Featured card">
        <div className="relative overflow-hidden rounded-[22px] shadow-sm" style={{ width: w, height: h }}>
          <MarkView mark={mark} size={w} />
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 px-4 pb-3 pt-10" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.55))" }}>
            {icon ? (
              <div className="overflow-hidden ring-1 ring-white/30" style={{ width: 40, height: 40, borderRadius: SQUIRCLE, flexShrink: 0 }}>
                <MarkView mark={icon} size={40} />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">MudKitchen</p>
              <p className="text-xs text-white/80">Microschools, families &amp; staff</p>
            </div>
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#0A84FF]">Get</span>
          </div>
        </div>
      </MockCard>
      <MockCard title="If cropped to 4:3">
        <div className="relative overflow-hidden rounded-[18px] ring-1 ring-black/10" style={{ width: cropW, height: cropH }}>
          <div className="absolute top-0" style={{ left: -Math.round((fullW - cropW) / 2) }}>
            <MarkView mark={mark} size={fullW} />
          </div>
        </div>
        <p className="mt-3 text-xs text-admin-muted">
          The safe zone is our own conservative guess, not Apple&apos;s template. If Apple sends a template, update <code>IOS_HEADER_FORMATS</code> in{" "}
          <code>brand-marks/types.ts</code>.
        </p>
      </MockCard>
    </>
  );
}

/** Link preview at studio size; the crop view marks the safe box and the square thumbnail some apps cut. */
function LinkPreviewPreview({ mark, showCrop }: { mark: BrandMark; showCrop: boolean }) {
  const h = Math.round((mark.height * PREVIEW_W) / mark.width);
  const k = PREVIEW_W / mark.width;
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative overflow-hidden rounded-admin-md shadow-sm ring-1 ring-black/5" style={{ width: PREVIEW_W, height: h }}>
        <MarkView mark={mark} size={PREVIEW_W} />
        {showCrop ? (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute"
              style={{ left: Math.round(60 * k), top: Math.round(40 * k), right: Math.round(60 * k), bottom: Math.round(40 * k), outline: "2px dashed rgba(255,255,255,.9)" }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute top-0 bottom-0"
              style={{ left: Math.round((PREVIEW_W - h) / 2), width: h, outline: "2px dotted rgba(20,16,12,.55)" }}
            />
          </>
        ) : null}
      </div>
      <figcaption className="text-xs text-admin-muted">
        {showCrop ? "Keep words inside the dashed box. The dotted square is the thumbnail some apps (WhatsApp, SMS) cut from the middle." : "Full image, as downloaded"}
      </figcaption>
    </figure>
  );
}

/** How the card looks when the link is pasted into a chat. */
function LinkPreviewMocks({ mark }: { mark: BrandMark }) {
  const w = 300;
  const h = Math.round((mark.height * w) / mark.width);
  return (
    <>
      <MockCard title="iMessage">
        <div className="flex justify-end rounded-admin-md bg-[#1c1c1e] p-4">
          <div className="overflow-hidden rounded-[18px] bg-[#2c2c2e]" style={{ width: w }}>
            <MarkView mark={mark} size={w} />
            <div className="px-3 py-2">
              <p className="truncate text-[13px] font-semibold text-white">{mark.title} · MudKitchen</p>
              <p className="text-[12px] text-white/55">trymudkitchen.com</p>
            </div>
          </div>
        </div>
      </MockCard>
      <MockCard title="Slack / LinkedIn feed">
        <div className="flex gap-3">
          <span className="w-1 shrink-0 rounded-full bg-admin-border" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-admin-text">MudKitchen</p>
            <p className="mb-2 text-xs text-admin-muted">{mark.pages?.join(", ")}</p>
            <div className="overflow-hidden rounded-admin-md ring-1 ring-black/10" style={{ width: 420, height: Math.round((mark.height * 420) / mark.width) }}>
              <MarkView mark={mark} size={420} />
            </div>
          </div>
        </div>
      </MockCard>
      <MockCard title="Square thumbnail (WhatsApp, SMS)">
        <div className="flex items-center gap-3 rounded-admin-md bg-[#dcf8c6] p-2">
          <div className="relative shrink-0 overflow-hidden rounded-admin-sm" style={{ width: 72, height: 72 }}>
            <div className="absolute top-0" style={{ left: -Math.round((((72 * mark.width) / mark.height) - 72) / 2) }}>
              <MarkView mark={mark} size={Math.round((72 * mark.width) / mark.height)} />
            </div>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-[#111]">{mark.title} · MudKitchen</p>
            <p className="text-[12px] text-black/55">trymudkitchen.com</p>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-admin-muted">{h}px tall in a 300px chat bubble.</p>
      </MockCard>
    </>
  );
}

/** Where the sticker ends up, how big it prints, and the redraw next to the original bowl. */
function LogoMocks({ mark }: { mark: BrandMark }) {
  const wide = mark.width > mark.height;
  const inch = 30;
  return (
    <>
      <MockCard title="On a laptop lid">
        <div className="relative flex h-[200px] items-center justify-center overflow-hidden rounded-[18px]" style={{ background: "linear-gradient(150deg, #4A4F55, #2E3236)" }}>
          <span className="absolute h-7 w-7 rounded-full bg-white/10" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} />
          <div style={{ position: "absolute", right: 34, bottom: 22, transform: "rotate(-8deg)" }}>
            <MarkView mark={mark} size={wide ? 150 : 110} />
          </div>
          <div style={{ position: "absolute", left: 30, top: 26, transform: "rotate(6deg)", opacity: 0.9 }}>
            <MarkView mark={mark} size={wide ? 110 : 76} />
          </div>
        </div>
      </MockCard>
      <MockCard title="Real size">
        <div className="flex items-end gap-5 rounded-admin-md p-3" style={backdropStyle("kraft")}>
          {(wide ? [3, 4.5] : [2, 3, 4]).map((inches) => (
            <div key={inches} className="flex flex-col items-center gap-1">
              <MarkView mark={mark} size={Math.round(inches * inch)} />
              <span className="text-[10px] font-medium text-white/90">{inches}&quot; wide</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-admin-muted">
          Shown roughly to scale. A 4&quot; sticker needs {4 * PRINT_DPI}px at {PRINT_DPI} dpi; this file is {mark.width}px wide, so it stays sharp up to{" "}
          {(mark.width / PRINT_DPI).toFixed(1)}&quot; wide.
        </p>
      </MockCard>
      <MockCard title="Redraw vs original">
        <div className="flex items-center justify-around gap-4">
          <figure className="flex flex-col items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- comparing the raw source files */}
            <img src="/images/Logo.png" alt="Original bowl logo" width={130} height={130} style={{ width: 130, height: 130, objectFit: "cover", objectPosition: "50% 50%" }} />
            <figcaption className="text-[10px] text-admin-faint">Original (Logo.png, 308px art)</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- comparing the raw source files */}
            <img src={svgSrc(BOWL_VECTOR)} alt="Vector redraw of the bowl" width={100} height={101} style={{ width: 100, height: 101, margin: "15px" }} />
            <figcaption className="text-[10px] text-admin-faint">Vector redraw (any size)</figcaption>
          </figure>
        </div>
      </MockCard>
      <MockCard title="Printing">
        <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-admin-muted">
          <li>Upload the PNG as-is. The background is transparent and the sticker printer draws its die-cut line around the outer border.</li>
          <li>Pick &ldquo;die cut&rdquo; (or &ldquo;contour cut&rdquo;). Badges and circles also work as plain circle stickers.</li>
          <li>The white border is part of the art, so ask for no extra border or bleed.</li>
          <li>&ldquo;Download all&rdquo; gives every design, sorted into bowl, wordmark and badge folders.</li>
        </ul>
      </MockCard>
    </>
  );
}
