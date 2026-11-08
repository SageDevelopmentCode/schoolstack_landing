import { poppins } from "@/lib/fonts";

/**
 * Applies Poppins to school website demos (bright layout). Overrides global Lora
 * on headings via Tailwind `!` utilities scoped to demo shells.
 */
export default function SchoolDemoWebsiteFonts({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${poppins.variable} demo-website-bright-shell [&_.font-heading]:font-[family-name:var(--font-poppins)]! [&_.font-heading]:font-bold! [&_.font-heading]:tracking-[-0.03em]! [&_.font-secondary]:font-[family-name:var(--font-poppins)]`}
    >
      {children}
    </div>
  );
}
