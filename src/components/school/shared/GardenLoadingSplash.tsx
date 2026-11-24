import Image from "next/image";
import { gardenFontVariables } from "@/components/garden/fonts";
import { Tape } from "@/components/garden/ui";
import "@/components/garden/garden.css";

/**
 * MudKitchen loading splash in Calm Garden: the bowl on a taped paper card,
 * the wordmark and three bouncing dots. Matches the Expo app's
 * `apps/mobile/src/components/branded-splash-content.tsx`.
 *
 * CSS-only (no hooks), so it renders from server `loading.tsx` files and from
 * the client `MudKitchenLoadingOverlay`. It fades in after a short delay so
 * fast navigations don't flash it. Keyframes live in `garden.css`.
 *
 * It renders outside every Garden scope, so it brings its own fonts and
 * `.sf-garden` tokens. MudKitchen is speaking here (some of these routes have
 * no school theme yet), so the accent is MudKitchen clay.
 */

type GardenLoadingSplashProps = {
  /** `overlay` fills a positioned parent (the portal); `page` fixes itself to the viewport. */
  variant?: "overlay" | "page";
  /** Read to screen readers. */
  label?: string;
};

const DOTS = [
  { key: "butter", color: "var(--sf-butter)", delay: "0ms" },
  { key: "mint", color: "var(--sf-mint)", delay: "140ms" },
  { key: "sky", color: "var(--sf-sky)", delay: "280ms" },
] as const;

export default function GardenLoadingSplash({
  variant = "page",
  label = "Loading",
}: GardenLoadingSplashProps) {
  const position =
    variant === "overlay" ? "absolute inset-0" : "fixed inset-0 z-[300]";

  return (
    <div
      className={`${gardenFontVariables} sf-garden ${position} flex animate-[sf-loading-in_150ms_ease-out_80ms_both] items-center justify-center backdrop-blur-sm`}
      // `.sf-garden` paints solid cream; the splash is a see-through cream veil.
      style={{
        background: "color-mix(in srgb, var(--sf-cream) 92%, transparent)",
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>

      <div
        className="flex animate-[sf-loading-pop_150ms_cubic-bezier(0.16,1,0.3,1)_80ms_both] flex-col items-center motion-reduce:animate-none"
        aria-hidden="true"
      >
        <div
          className="relative flex h-[136px] w-[136px] items-center justify-center rounded-[30px] border-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] shadow-[0_5px_0_0_var(--sf-ink)]"
          style={{ rotate: "-2deg" }}
        >
          <Tape
            color="var(--sf-butter)"
            className="-top-3 left-1/2 -translate-x-1/2 -rotate-3"
          />
          {/* Counter-rotated so the bowl sits level on the tilted card. */}
          <Image
            src="/images/Logo.png"
            alt=""
            width={96}
            height={96}
            priority
            unoptimized
            className="h-24 w-24 object-contain"
            style={{ rotate: "2deg" }}
          />
        </div>

        <p className="sf-display mt-7 text-[2rem] leading-none text-[var(--sf-ink)]">
          Mud<span className="text-[var(--sf-clay)]">Kitchen</span>
        </p>

        <div className="mt-4 flex h-6 items-center gap-2.5">
          {DOTS.map((dot) => (
            <span
              key={dot.key}
              className="h-3 w-3 animate-[sf-loading-bounce_900ms_cubic-bezier(0.16,1,0.3,1)_infinite] rounded-full border-[1.5px] border-[var(--sf-ink)] motion-reduce:animate-none"
              style={{ backgroundColor: dot.color, animationDelay: dot.delay }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
