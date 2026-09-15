import { StyleSheet, View } from 'react-native';

import { StoryPillNav } from '@/components/story/story-pill-nav';
import {
  countContactsByAudience,
  type MessageContactAudienceFilter,
} from '@/lib/messages/contact-filters';
import type { MessageContact } from '@/lib/messages/types';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';

type NewConversationContactFiltersProps = {
  contacts: MessageContact[];
  activeFilter: MessageContactAudienceFilter;
  onChange: (filter: MessageContactAudienceFilter) => void;
};

export function NewConversationContactFilters({
  contacts,
  activeFilter,
  onChange,
}: NewConversationContactFiltersProps) {
  const counts = countContactsByAudience(contacts);

  return (
    <View style={styles.container}>
      <StoryPillNav
        fullWidth
        items={[
          { key: 'all', label: `All · ${counts.all}` },
          { key: 'parents', label: `Parents · ${counts.parents}` },
          { key: 'staff', label: `Staff · ${counts.staff}` },
        ]}
        activeKey={activeFilter}
        onChange={(key) => onChange(key as MessageContactAudienceFilter)}
        accessibilityLabel="Contact audience"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    flexShrink: 0,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
});
