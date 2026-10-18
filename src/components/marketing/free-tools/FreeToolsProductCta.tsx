import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";
import { FREE_TOOLS_HUB_THEME } from "@/components/marketing/free-tools/free-tools-hub-theme";

const theme = FREE_TOOLS_HUB_THEME;

export default function FreeToolsProductCta() {
  return (
    <section
      className="my-9 flex flex-col items-start justify-between gap-6 rounded-[18px] border p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-7"
      style={{
        borderColor: "#C7DFCB",
        background: "linear-gradient(135deg, #E5F0E9, #F4F6EB)",
      }}
    >
      <div>
        <ParentSectionKicker theme={theme}>When you’re ready for the school day</ParentSectionKicker>
        <h2
          className="mt-1.5 font-heading text-[25px] font-medium tracking-[-0.035em]"
          style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
        >
          Planning is one part. Running school is the rest.
        </h2>
        <p
          className="mt-2 max-w-[720px] text-xs leading-[1.8]"
          style={{ color: theme.muted, fontFamily: theme.fontBody }}
        >
          Explore how MudKitchen brings enrollment, tuition, family communication, and
          school operations into a shared workspace.
        </p>
      </div>
      <ParentButtonLink
        theme={theme}
        href="/get-started"
        variant="outline"
        showArrow
        fullWidth={false}
        className="w-full shrink-0 sm:w-auto"
      >
        See MudKitchen
      </ParentButtonLink>
    </section>
  );
}
