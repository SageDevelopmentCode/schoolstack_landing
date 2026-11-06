import type { ProductPreviewTabGroup } from "@/lib/marketing/product-preview-tabs";

export const INK = "#1d1a16";

/**
 * Global `h1, h2, h3` rules are unlayered and beat Tailwind utilities, so the
 * bold sans heading treatment needs `!` to win.
 */
export const BOLD_HEADING =
  "font-secondary! font-bold! tracking-[-0.04em]! leading-[1.03]! text-[#1d1a16]";

export const ACCENT_HIGHLIGHT =
  "text-clay bg-[linear-gradient(transparent_64%,#F8DDCF_64%)] [box-decoration-break:clone]";

export const GROUP_TINTS: Record<ProductPreviewTabGroup, string> = {
  website: "#EEF3EC",
  parent: "#EAF1FD",
  teacher: "#E4F5EC",
  admin: "#FDEFE4",
};

export const DARK_PILL =
  "font-secondary inline-flex h-12 items-center gap-2 rounded-pill bg-[#1d1a16] px-7 text-[15px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-clay";

export const OUTLINE_PILL =
  "font-secondary inline-flex h-12 items-center gap-2 rounded-pill border border-black/15 bg-white px-7 text-[15px] font-semibold text-[#1d1a16] transition-all duration-200 hover:border-black/35";
