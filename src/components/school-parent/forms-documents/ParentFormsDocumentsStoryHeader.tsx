import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentFormsDocumentsStoryHeaderProps = {
  theme: ParentThemeTokens;
};

export default function ParentFormsDocumentsStoryHeader({
  theme,
}: ParentFormsDocumentsStoryHeaderProps) {
  return (
    <header className="mb-6">
      <ParentSectionKicker
        theme={theme}
        className="normal-case tracking-normal font-semibold"
      >
        Forms & documents
      </ParentSectionKicker>
      <ParentDisplayHeading theme={theme}>Forms & Documents</ParentDisplayHeading>
      <p className="mt-1 text-sm" style={{ color: theme.muted }}>
        Review and sign forms from your child&apos;s teachers.
      </p>
    </header>
  );
}
