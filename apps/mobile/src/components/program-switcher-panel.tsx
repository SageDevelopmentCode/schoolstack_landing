import {
  GardenSelectionList,
  GardenSelectionRow,
  GardenSelectionSkeleton,
} from '@/components/garden-nav/garden-more';

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
    return <GardenSelectionSkeleton kicker={sectionTitle} rowCount={2} />;
  }

  if (contexts.length < 2) {
    return null;
  }

  return (
    <GardenSelectionList kicker={sectionTitle} hint="Pick which program your tabs and menu show.">
      {contexts.map((context, index) => {
        const isCurrent = context.id === activeContextId;
        return (
          <GardenSelectionRow
            key={context.id}
            isFirst={index === 0}
            label={context.label}
            subtitle="Co-op program portal"
            icon={PROGRAM_ICON.icon}
            iconBg={PROGRAM_ICON.iconBg}
            selected={isCurrent}
            onPress={() => {
              if (!isCurrent) {
                onSelect(context);
              }
            }}
          />
        );
      })}
    </GardenSelectionList>
  );
}
