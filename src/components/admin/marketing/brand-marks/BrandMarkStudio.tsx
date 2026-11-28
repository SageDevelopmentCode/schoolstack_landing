"use client";

import type { CSSProperties, ReactNode } from "react";
import { ChevronRight, Download } from "lucide-react";
import { GChip, G_FOCUS, G_TOGGLE, G_TOGGLE_OFF, G_TOGGLE_ON, gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { BusyLabel, GardenSwitch } from "@/components/school-admin/garden/kit";
import { GardenGroupHeading } from "@/components/school-admin/garden/blocks";
import { MarkStage, svgSrc } from "@/components/admin/marketing/brand-marks/mark-kit";
import { BOWL_VECTOR } from "@/components/admin/marketing/brand-marks/bowl-vector";
import {
  coverInFormat,
  DEFAULT_BRAND_MARK_ID,
  designCount,
  formatMonthDay,
  getBrandMark,
  iosHeaderSibling,
  type SeasonTiming,
} from "@/components/admin/marketing/brand-marks/registry";
import {
  COVER_FORMAT_ORDER,
  COVER_FORMATS,
  IOS_HEADER_FORMAT_ORDER,
  IOS_HEADER_FORMATS,
  type BrandMark,
} from "@/components/admin/marketing/brand-marks/types";
import {
  isWide,
  KIND_LABEL,
  KIND_ORDER,
  useBrandMarkStudioModel,
  type Backdrop,
} from "@/components/admin/marketing/brand-marks/useBrandMarkStudioModel";
import { AccentLast, MarketingGardenHeader } from "@/components/admin/marketing/garden/MarketingGardenHeader";
import { MarketingStudioFrame, STUDIO_STAGE_CLASS } from "@/components/admin/marketing/garden/MarketingStudioFrame";
import { GardenSegmented, MarketingCanvas } from "@/components/admin/marketing/garden/marketing-ui";

/** Print resolution the Logos tab quotes sizes against. */
const PRINT_DPI = 300;

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
/** iOS-style continuous-corner approximation. */
const SQUIRCLE = "22.37%";

/**
 * One brand mark at `size` px wide. Shielded from the Garden type reset (it's
 * export art); the export slot passes `shield={false}` so its DOM stays as before.
 */
function MarkView({ mark, size, shield = true }: { mark: BrandMark; size: number; shield?: boolean }) {
  const stage = (
    <MarkStage width={size} height={Math.round((size * mark.height) / mark.width)} stageW={mark.stage.w} stageH={mark.stage.h} background={mark.background}>
      {mark.render()}
    </MarkStage>
  );
  return shield ? <MarketingCanvas>{stage}</MarketingCanvas> : stage;
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

/** /admin/marketing/avatars: profile pictures, app icons, covers, App Store art, link previews and logo stickers. */
export default function BrandMarkStudio() {
  const { exportRef, ...model } = useBrandMarkStudioModel();
  const { selected, kind, selectedTiming, showCrop, backdrop } = model;

  const specLine = [
    selected.description || null,
    `${selected.width}×${selected.height} PNG`,
    kind === "app-icon"
      ? "square, no transparency (the phone rounds the corners)"
      : kind === "cover" && selected.format
        ? COVER_FORMATS[selected.format].label
        : kind === "ios-header" && selected.iosFormat
          ? `${IOS_HEADER_FORMATS[selected.iosFormat].label}${selected.textless ? " · art only" : ""}`
          : kind === "link-preview"
            ? `link preview for ${selected.pages?.join(", ") ?? ""} · save into public/og/`
            : kind === "logo"
              ? `transparent · prints sharp up to ${(selected.width / PRINT_DPI).toFixed(1)}×${(selected.height / PRINT_DPI).toFixed(1)} in at ${PRINT_DPI} dpi`
              : "shown as a circle on most platforms",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <MarketingStudioFrame
      data-testid="brand-mark-studio"
      header={
        <MarketingGardenHeader
          compact
          title={<AccentLast text={selected.title} />}
          subtitle={
            <>
              {selected.season ? (
                <GChip tone={selectedTiming && selectedTiming.state === "now" ? "success" : selectedTiming && selectedTiming.state !== "later" ? "warning" : "neutral"} className="mr-2 align-[1px]">
                  {selected.season.label} · {formatMonthDay(selected.season.from)} – {formatMonthDay(selected.season.to)}
                  {selectedTiming && selectedTiming.state !== "later" ? ` · ${timingLabel(selectedTiming)}` : ""}
                </GChip>
              ) : null}
              {specLine}
            </>
          }
        />
      }
      rail={
        <>
          <div className="shrink-0 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 px-4 pb-3 pt-4">
            <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">Brand marks</p>
            <h2 className="m-0 text-[17px] font-extrabold text-[var(--sf-ink)]">{KIND_LABEL[kind]}</h2>
            <div role="tablist" aria-label="Design type" className="mt-3 grid grid-cols-2 gap-1.5">
              {KIND_ORDER.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={kind === option}
                  onClick={() => model.switchKind(option)}
                  className={`${G_TOGGLE} !min-h-[32px] !px-2.5 !text-[12.5px] ${kind === option ? G_TOGGLE_ON : G_TOGGLE_OFF}`}
                >
                  {KIND_LABEL[option]}
                  <span className={`ml-1 tabular-nums ${kind === option ? "text-white/80" : "text-[var(--sf-soft)]"}`}>{designCount(option)}</span>
                </button>
              ))}
            </div>
          </div>
          <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2.5 py-3" aria-label={KIND_LABEL[kind]}>
            {model.groups.map((group) =>
              group.items.length ? (
                <section key={group.label} aria-label={group.label}>
                  <div className="px-1.5">
                    <GardenGroupHeading count={group.items.length}>{group.label}</GardenGroupHeading>
                  </div>
                  <ul className="m-0 flex list-none flex-col gap-1 p-0">
                    {group.items.map(({ mark, timing }) => {
                      const isSelected = mark.id === selected.id;
                      return (
                        <li key={mark.id}>
                          <button
                            type="button"
                            aria-current={isSelected ? "true" : undefined}
                            onClick={() => model.select(mark.id)}
                            className={`flex w-full items-center gap-3 rounded-[14px] border-[1.5px] px-2 py-2 text-left transition-colors duration-200 ${
                              isSelected
                                ? "border-[var(--sf-clay)]/40 bg-[var(--sf-accent-wash)]"
                                : "border-transparent hover:bg-[var(--sf-accent-wash)]"
                            } ${G_FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0`}
                          >
                            <Masked mark={mark} size={isWide(kind) ? 92 : 44} ring />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{mark.title}</span>
                              <span className="block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                                {mark.season ? `${formatMonthDay(mark.season.from)} – ${formatMonthDay(mark.season.to)}` : mark.description}
                              </span>
                            </span>
                            {timing && timing.state !== "later" ? (
                              <GChip tone={timing.state === "now" ? "success" : "warning"}>{timingLabel(timing)}</GChip>
                            ) : (
                              <ChevronRight
                                className={`h-4 w-4 shrink-0 ${isSelected ? "text-[var(--sf-clay-deep)]" : "text-[var(--sf-ink)]/25"}`}
                                aria-hidden
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null,
            )}
          </nav>
        </>
      }
      overlays={
        /* Parked fully off-screen to the left, however wide the design (App Store art is 5244px). */
        <div aria-hidden className="pointer-events-none fixed top-0" style={{ left: -(model.exportMark.width + 200) }}>
          <div ref={exportRef} style={{ width: model.exportMark.width, height: model.exportMark.height, overflow: "hidden", position: "relative" }}>
            <MarkView mark={model.exportMark} size={model.exportMark.width} shield={false} />
          </div>
        </div>
      }
    >
      <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-3 rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-4 py-3 shadow-[0_3px_0_0_rgba(43,36,29,0.08)]">
        {kind === "cover" ? (
          <GardenSegmented
            label="Cover size"
            size="sm"
            value={selected.format}
            onChange={(format) => {
              const sibling = coverInFormat(selected, format);
              if (sibling) model.select(sibling.id);
            }}
            options={COVER_FORMAT_ORDER.map((format) => ({ value: format, label: COVER_FORMATS[format].short }))}
          />
        ) : null}
        {kind === "ios-header" ? (
          <>
            <GardenSegmented
              label="Artwork size"
              size="sm"
              value={selected.iosFormat}
              onChange={(format) => {
                const sibling = iosHeaderSibling(selected, { format });
                if (sibling) model.select(sibling.id);
              }}
              options={IOS_HEADER_FORMAT_ORDER.map((format) => ({ value: format, label: IOS_HEADER_FORMATS[format].short }))}
            />
            <GardenSegmented
              label="Text"
              size="sm"
              value={selected.textless ? "art" : "text"}
              onChange={(mode) => {
                const sibling = iosHeaderSibling(selected, { textless: mode === "art" });
                if (sibling) model.select(sibling.id);
              }}
              options={[
                { value: "text", label: "With text" },
                { value: "art", label: "Art only" },
              ]}
            />
          </>
        ) : null}
        {kind === "logo" ? (
          <GardenSegmented label="Preview on" size="sm" value={backdrop} onChange={model.setBackdrop} options={BACKDROPS} />
        ) : (
          <div className="min-w-[170px]">
            <GardenSwitch checked={showCrop} onChange={model.setShowCrop} label="Show crop" description="Shade what platforms cut" />
          </div>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void model.downloadOne()}
            disabled={model.exporting != null}
            aria-busy={model.exporting === "one" || undefined}
            className={gBtnOutlineSm}
          >
            <BusyLabel busy={model.exporting === "one"} busyLabel="Exporting…" icon={<Download className="h-4 w-4" aria-hidden />}>
              Download PNG
            </BusyLabel>
          </button>
          <button
            id="brand-mark-download-all"
            type="button"
            onClick={() => void model.downloadAll()}
            disabled={model.exporting != null}
            aria-busy={model.exporting === "all" || undefined}
            className={gBtnPopSm}
          >
            <BusyLabel
              busy={model.exporting === "all"}
              busyLabel={model.progress ? `Exporting ${model.progress}` : "Exporting…"}
              icon={<Download className="h-4 w-4" aria-hidden />}
            >
              {`Download all ${model.allOfKind.length}`}
            </BusyLabel>
          </button>
        </div>
      </div>

      <div className={`${STUDIO_STAGE_CLASS} overflow-y-auto max-lg:!min-h-0 max-lg:flex-none max-lg:!overflow-x-auto`}>
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-start justify-center gap-8 px-6 py-8">
          {kind === "cover" ? (
            <CoverPreview mark={selected} showCrop={showCrop} />
          ) : kind === "ios-header" ? (
            <IosHeaderPreview mark={selected} showCrop={showCrop} />
          ) : kind === "link-preview" ? (
            <LinkPreviewPreview mark={selected} showCrop={showCrop} />
          ) : kind === "logo" ? (
            <figure className="m-0 flex flex-col items-center gap-3">
              <div className="rounded-[10px] shadow-[0_8px_0_0_rgba(43,36,29,0.14)] ring-[1.5px] ring-[var(--sf-ink)]/12">
                <LogoFit mark={selected} size={460} backdrop={backdrop} rounded={8} />
              </div>
              <figcaption className="text-[12.5px] font-semibold text-[var(--sf-soft)]">
                {backdrop === "checker" ? "Checks = transparent. The printer cuts along the outer border." : "Full image, as downloaded"}
              </figcaption>
            </figure>
          ) : (
            <figure className="m-0 flex flex-col items-center gap-3">
              <div
                className="relative overflow-hidden rounded-[10px] shadow-[0_8px_0_0_rgba(43,36,29,0.14)] ring-[1.5px] ring-[var(--sf-ink)]/12"
                style={{ width: 460, height: 460 }}
              >
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
              <figcaption className="text-[12.5px] font-semibold text-[var(--sf-soft)]">
                {showCrop ? "Shaded area is cropped away when shown" : "Full image, as downloaded"}
              </figcaption>
            </figure>
          )}

          <div className={`flex flex-col gap-5 ${isWide(kind) ? "w-[820px] max-w-full" : "w-[360px] max-w-full"}`}>
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
    </MarketingStudioFrame>
  );
}

/** A platform mock-up as a Garden card (kicker = what it shows). */
function MockCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-4 shadow-[0_3px_0_0_rgba(43,36,29,0.08)]">
      <p className="m-0 mb-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">{title}</p>
      {children}
    </section>
  );
}

function AvatarMocks({ mark }: { mark: BrandMark }) {
  return (
    <>
      <MockCard title="Profile header">
        <div className="overflow-hidden rounded-[12px] border border-[var(--sf-ink)]/12">
          <div className="h-20" style={{ background: "linear-gradient(120deg, #2E4A3C, #A6B89A)" }} />
          <div className="px-4 pb-4">
            <div className="-mt-10 inline-block rounded-full border-4 border-white bg-white">
              <Masked mark={mark} size={88} />
            </div>
            <p className="mt-1 text-sm font-semibold text-[var(--sf-ink)]">MudKitchen</p>
            <p className="text-xs text-[var(--sf-soft)]">trymudkitchen.com</p>
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
                <p className="text-sm font-semibold text-[var(--sf-ink)]">MudKitchen</p>
                <p className="text-xs text-[var(--sf-soft)]">{row.line}</p>
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
              <span className="text-[10px] text-[var(--sf-soft)]">{size}px</span>
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
              <span className="text-[10px] text-[var(--sf-soft)]">{size}pt</span>
            </div>
          ))}
        </div>
      </MockCard>
      <MockCard title="Using it">
        <p className="text-xs leading-relaxed text-[var(--sf-soft)]">
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
    <figure className="m-0 flex flex-col items-center gap-3">
      <div className="relative overflow-hidden rounded-[12px] shadow-sm ring-1 ring-black/5" style={{ width: PREVIEW_W, height: Math.round(mark.height * k) }}>
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
      <figcaption className="text-[12.5px] font-semibold text-[var(--sf-soft)]">
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
      <div className="overflow-hidden rounded-[12px] border border-[var(--sf-ink)]/12 bg-white" style={{ width: w }}>
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
          <p className="text-sm font-semibold text-[var(--sf-ink)]">MudKitchen</p>
          <p className="text-xs text-[var(--sf-soft)]">trymudkitchen.com</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--sf-soft)]">
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
    <figure className="m-0 flex flex-col items-center gap-3">
      <div className="relative overflow-hidden rounded-[12px] shadow-sm ring-1 ring-black/5" style={{ width: PREVIEW_W, height: Math.round((mark.height * PREVIEW_W) / mark.width) }}>
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
      <figcaption className="text-[12.5px] font-semibold text-[var(--sf-soft)]">
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
        <p className="mt-3 text-xs text-[var(--sf-soft)]">
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
    <figure className="m-0 flex flex-col items-center gap-3">
      <div className="relative overflow-hidden rounded-[12px] shadow-sm ring-1 ring-black/5" style={{ width: PREVIEW_W, height: h }}>
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
      <figcaption className="text-[12.5px] font-semibold text-[var(--sf-soft)]">
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
        <div className="flex justify-end rounded-[12px] bg-[#1c1c1e] p-4">
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
          <span className="w-1 shrink-0 rounded-full bg-[var(--sf-ink)]/15" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--sf-ink)]">MudKitchen</p>
            <p className="mb-2 text-xs text-[var(--sf-soft)]">{mark.pages?.join(", ")}</p>
            <div className="overflow-hidden rounded-[12px] ring-1 ring-black/10" style={{ width: 420, height: Math.round((mark.height * 420) / mark.width) }}>
              <MarkView mark={mark} size={420} />
            </div>
          </div>
        </div>
      </MockCard>
      <MockCard title="Square thumbnail (WhatsApp, SMS)">
        <div className="flex items-center gap-3 rounded-[12px] bg-[#dcf8c6] p-2">
          <div className="relative shrink-0 overflow-hidden rounded-[8px]" style={{ width: 72, height: 72 }}>
            <div className="absolute top-0" style={{ left: -Math.round((((72 * mark.width) / mark.height) - 72) / 2) }}>
              <MarkView mark={mark} size={Math.round((72 * mark.width) / mark.height)} />
            </div>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-[#111]">{mark.title} · MudKitchen</p>
            <p className="text-[12px] text-black/55">trymudkitchen.com</p>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-[var(--sf-soft)]">{h}px tall in a 300px chat bubble.</p>
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
        <div className="flex items-end gap-5 rounded-[12px] p-3" style={backdropStyle("kraft")}>
          {(wide ? [3, 4.5] : [2, 3, 4]).map((inches) => (
            <div key={inches} className="flex flex-col items-center gap-1">
              <MarkView mark={mark} size={Math.round(inches * inch)} />
              <span className="text-[10px] font-medium text-white/90">{inches}&quot; wide</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[var(--sf-soft)]">
          Shown roughly to scale. A 4&quot; sticker needs {4 * PRINT_DPI}px at {PRINT_DPI} dpi; this file is {mark.width}px wide, so it stays sharp up to{" "}
          {(mark.width / PRINT_DPI).toFixed(1)}&quot; wide.
        </p>
      </MockCard>
      <MockCard title="Redraw vs original">
        <div className="flex items-center justify-around gap-4">
          <figure className="m-0 flex flex-col items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- comparing the raw source files */}
            <img src="/images/Logo.png" alt="Original bowl logo" width={130} height={130} style={{ width: 130, height: 130, objectFit: "cover", objectPosition: "50% 50%" }} />
            <figcaption className="text-[10px] text-[var(--sf-soft)]">Original (Logo.png, 308px art)</figcaption>
          </figure>
          <figure className="m-0 flex flex-col items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- comparing the raw source files */}
            <img src={svgSrc(BOWL_VECTOR)} alt="Vector redraw of the bowl" width={100} height={101} style={{ width: 100, height: 101, margin: "15px" }} />
            <figcaption className="text-[10px] text-[var(--sf-soft)]">Vector redraw (any size)</figcaption>
          </figure>
        </div>
      </MockCard>
      <MockCard title="Printing">
        <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-[var(--sf-soft)]">
          <li>Upload the PNG as-is. The background is transparent and the sticker printer draws its die-cut line around the outer border.</li>
          <li>Pick &ldquo;die cut&rdquo; (or &ldquo;contour cut&rdquo;). Badges and circles also work as plain circle stickers.</li>
          <li>The white border is part of the art, so ask for no extra border or bleed.</li>
          <li>&ldquo;Download all&rdquo; gives every design, sorted into bowl, wordmark and badge folders.</li>
        </ul>
      </MockCard>
    </>
  );
}
