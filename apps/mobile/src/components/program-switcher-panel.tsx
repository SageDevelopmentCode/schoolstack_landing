import { StoryEmbeddedSwitcherSection } from '@/components/story/more/story-embedded-switcher-section';
import { StoryEmbeddedSwitcherSkeleton } from '@/components/story/more/story-embedded-switcher-skeleton';
import { StoryMoreMenuIcon } from '@/components/story/more/story-more-menu-icon';
import { StoryMoreMenuSelectionRow } from '@/components/story/more/story-more-menu-selection-row';

export type ProgramSwitcherContext = {
  id: string;
  label: string;
};

type ProgramSwitcherPanelProps = {
  contexts: ProgramSwitcherContext[];
  activeContextId: string | null;
  loading?: boolean;
  sectionTitle?: string;
  onSelect: (context: ProgramSwitcherContext) => void;
};

const PROGRAM_ICON = {
  icon: 'school-outline' as const,
  iconBg: '#E9F2EA',
  iconColor: '#3D6B4F',
};

export function useProgramSwitcherVisibility(input: {
  loading: boolean;
  showSwitcher: boolean;
  contextCount: number;
}): boolean {
  return input.loading || (input.showSwitcher && input.contextCount >= 2);
}

export function ProgramSwitcherPanel({
  contexts,
  activeContextId,
  loading = false,
  sectionTitle = 'Program',
  onSelect,
}: ProgramSwitcherPanelProps) {
  if (loading) {
    return <StoryEmbeddedSwitcherSkeleton kicker={sectionTitle} rowCount={2} />;
  }

  if (contexts.length < 2) {
    return null;
  }

  return (
    <StoryEmbeddedSwitcherSection kicker={sectionTitle}>
      {contexts.map((context, index) => {
        const isCurrent = context.id === activeContextId;
        return (
          <StoryMoreMenuSelectionRow
            key={context.id}
            isFirst={index === 0}
            label={context.label}
            subtitle="Co-op program portal"
            selected={isCurrent}
            onPress={() => {
              if (!isCurrent) {
                onSelect(context);
              }
            }}
            icon={
              <StoryMoreMenuIcon
                name={PROGRAM_ICON.icon}
                iconBg={PROGRAM_ICON.iconBg}
                iconColor={PROGRAM_ICON.iconColor}
              />
            }
          />
        );
      })}
    </StoryEmbeddedSwitcherSection>
  );
}
