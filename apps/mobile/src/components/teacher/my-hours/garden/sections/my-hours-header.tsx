import { GBackHeader } from '@/components/parent/garden/back-header';

/** More-stack header: back to More, "My Hours" with the accent word, a data-only status line. */
export function MyHoursHeader({ onBack, subtitle }: { onBack: () => void; subtitle?: string | null }) {
  return (
    <GBackHeader
      backLabel="More"
      backAccessibilityLabel="Back to More"
      onBack={onBack}
      title="My Hours"
      accentWord="Hours"
      subtitle={subtitle ?? 'Clock in and out, see your week, and fix past days.'}
    />
  );
}
