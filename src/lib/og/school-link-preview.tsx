/* eslint-disable @next/next/no-img-element -- Satori (next/og) draws plain <img> elements. */
import "server-only";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type SharpModule from "sharp";
import { DEFAULT_BRANDING } from "@/lib/organization-settings/catalog";
import {
  headlineSize,
  PREVIEW_INK,
  PREVIEW_SOFT,
  resolveSchoolLogoSource,
  schoolInitials,
  schoolPreviewPalette,
} from "@/lib/og/school-link-preview-core";
import type { SchoolPreviewCopy } from "@/lib/og/school-link-preview-copy";

// School link preview card: Garden craft in the school's colours. Dotted paper washed with the
// school accent, the logo on a taped, tilted white "toy" card with a hard shadow, a chunky
// headline, and a quiet "Powered by MudKitchen" tag. Satori has no CSS filters, so depth comes from
// borders and hard box-shadows, exactly like the Garden toy cards.

const W = 1200;
const H = 630;
const LOGO_BOX = { w: 300, h: 210 };
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

type Logo = { src: string; width: number; height: number };

const cwd = process.cwd();

let sharpModule: typeof SharpModule | null = null;
/**
 * Next.js ships its own sharp (0.34) for image optimisation and the repo depends on a newer one.
 * Loading both puts two libvips builds in one server process (libvips warns about it), so prefer
 * the copy Next already uses and fall back to ours.
 */
function sharp(...args: Parameters<typeof SharpModule>) {
  if (!sharpModule) {
    try {
      sharpModule = createRequire(join(cwd, "node_modules/next/package.json"))("sharp") as typeof SharpModule;
    } catch {
      sharpModule = createRequire(join(cwd, "package.json"))("sharp") as typeof SharpModule;
    }
  }
  return sharpModule(...args);
}
let fontsPromise: Promise<Array<{ name: string; data: Buffer; weight: 700 | 800; style: "normal" }>> | null = null;
let markPromise: Promise<string> | null = null;

function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(join(cwd, "src/fonts/og/bricolage-grotesque-800.ttf")),
    readFile(join(cwd, "src/fonts/og/nunito-700.ttf")),
  ]).then(([display, body]) => [
    { name: "Bricolage", data: display, weight: 800 as const, style: "normal" as const },
    { name: "Nunito", data: body, weight: 700 as const, style: "normal" as const },
  ]);
  return fontsPromise;
}

/** The MudKitchen bowl for the credit tag (Logo.png's art sits in x 102–410, y 94–406). */
function loadMudKitchenMark() {
  markPromise ??= readFile(join(cwd, "public/images/Logo.png"))
    .then((buf) => sharp(buf).extract({ left: 102, top: 94, width: 308, height: 312 }).resize(64, 65).png().toBuffer())
    .then((png) => `data:image/png;base64,${png.toString("base64")}`);
  return markPromise;
}

async function readLogoBytes(src: string): Promise<Buffer | null> {
  const source = resolveSchoolLogoSource(src, process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!source) return null;
  if (source.kind === "public") return readFile(join(cwd, "public", source.path));
  const response = await fetch(source.url, { signal: AbortSignal.timeout(3000), redirect: "error" });
  if (!response.ok) return null;
  const length = Number(response.headers.get("content-length") ?? 0);
  if (length > MAX_LOGO_BYTES) return null;
  const bytes = Buffer.from(await response.arrayBuffer());
  return bytes.length > MAX_LOGO_BYTES ? null : bytes;
}

/**
 * The school's logo as a PNG data URL sized to fit the card (logos are often webp or svg, which
 * Satori can't draw). `null` = no logo, a refused URL, or a failed load; the card shows initials.
 */
export async function loadSchoolLogo(src: string | null | undefined, slug: string): Promise<Logo | null> {
  if (!src?.trim()) return null;
  // mergeBranding fills in the Rooted Meadows demo logo when a school never set one.
  if (src.trim() === DEFAULT_BRANDING.logo.src && !slug.startsWith("rooted-meadows")) return null;
  try {
    const bytes = await readLogoBytes(src.trim());
    if (!bytes) return null;
    // Trim empty margins (transparent or flat background) so small marks still fill the card.
    const trimmed = await sharp(bytes, { density: 300 })
      .trim({ threshold: 12 })
      .png()
      .toBuffer()
      .catch(() => bytes);
    const { data, info } = await sharp(trimmed, { density: 300 })
      .resize({ width: LOGO_BOX.w * 2, height: LOGO_BOX.h * 2, fit: "inside" })
      .png()
      .toBuffer({ resolveWithObject: true });
    const scale = Math.min(LOGO_BOX.w / info.width, LOGO_BOX.h / info.height);
    return {
      src: `data:image/png;base64,${data.toString("base64")}`,
      width: Math.round(info.width * scale),
      height: Math.round(info.height * scale),
    };
  } catch {
    return null;
  }
}

/** Dot-grid paper (Satori won't tile a CSS gradient, so the grid is one SVG). */
function dotGridSvg(color: string) {
  const step = 30;
  const dots: string[] = [];
  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) dots.push(`<circle cx="${x}" cy="${y}" r="2.2"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><g fill="${color}">${dots.join("")}</g></svg>`;
}

export type SchoolLinkPreviewInput = {
  schoolName: string;
  colors: { accent?: string; accentDark?: string } | null | undefined;
  logo: Logo | null;
  copy: SchoolPreviewCopy;
};

export async function renderSchoolLinkPreview({ schoolName, colors, logo, copy }: SchoolLinkPreviewInput) {
  const [fonts, mark] = await Promise.all([loadFonts(), loadMudKitchenMark()]);
  const palette = schoolPreviewPalette(colors);
  // Skip the name line when the headline already says it ("Apply to Sage Field").
  const showName = !copy.headline.toLowerCase().includes(schoolName.trim().toLowerCase());
  const dots = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(dotGridSvg(palette.dots))}`;
  const size = headlineSize(copy.headline);

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          position: "relative",
          backgroundColor: palette.paper,
          fontFamily: "Nunito",
          color: PREVIEW_INK,
        }}
      >
        <img src={dots} alt="" width={W} height={H} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} />
        {/* Copy column */}
        <div style={{ position: "absolute", left: 72, top: 0, bottom: 0, width: 640, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {copy.eyebrow ? (
            <div style={{ display: "flex", marginBottom: 26 }}>
              <div
                style={{
                  display: "flex",
                  padding: "8px 18px 9px",
                  borderRadius: 999,
                  border: `3px solid ${PREVIEW_INK}`,
                  backgroundColor: "#FFFFFF",
                  fontSize: 20,
                  letterSpacing: 1.2,
                  boxShadow: `0 4px 0 0 ${PREVIEW_INK}`,
                }}
              >
                {copy.eyebrow.toUpperCase()}
              </div>
            </div>
          ) : null}
          <div style={{ display: "flex", fontFamily: "Bricolage", fontSize: size, lineHeight: 1, letterSpacing: -size * 0.035 }}>
            {copy.headline}
          </div>
          {showName ? (
            <div style={{ display: "flex", marginTop: 24, fontSize: 32, color: palette.name }}>{schoolName}</div>
          ) : null}
          {copy.sub ? (
            <div style={{ display: "flex", marginTop: showName ? 10 : 24, fontSize: 24, lineHeight: 1.3, color: PREVIEW_SOFT, maxWidth: 600 }}>
              {copy.sub}
            </div>
          ) : null}
        </div>

        {/* Logo on a taped, tilted toy card */}
        <div style={{ position: "absolute", right: 80, top: 150, width: 380, height: 300, display: "flex", transform: "rotate(3deg)" }}>
          <div
            style={{
              width: 380,
              height: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              border: `4px solid ${PREVIEW_INK}`,
              borderRadius: 32,
              boxShadow: `0 12px 0 0 ${palette.shadow}`,
            }}
          >
            {logo ? (
              <img src={logo.src} alt="" width={logo.width} height={logo.height} style={{ width: logo.width, height: logo.height }} />
            ) : (
              <div
                style={{
                  width: 190,
                  height: 190,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: palette.accent,
                  color: palette.onAccent,
                  fontFamily: "Bricolage",
                  fontSize: 84,
                  letterSpacing: -3,
                }}
              >
                {schoolInitials(schoolName)}
              </div>
            )}
          </div>
          <div
            style={{
              position: "absolute",
              left: 120,
              top: -22,
              width: 150,
              height: 44,
              backgroundColor: "rgba(255,229,138,0.88)",
              transform: "rotate(-6deg)",
              display: "flex",
            }}
          />
        </div>

        {/* Powered by MudKitchen */}
        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: 30,
            display: "flex",
            alignItems: "center",
            padding: "6px 16px 6px 8px",
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.72)",
            fontSize: 19,
            color: PREVIEW_SOFT,
          }}
        >
          <img src={mark} alt="" width={30} height={30} style={{ width: 30, height: 30, marginRight: 8 }} />
          Powered by MudKitchen
        </div>
      </div>
    ),
    { width: W, height: H, fonts },
  );
}
