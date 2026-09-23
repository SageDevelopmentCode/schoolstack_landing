import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { archiveCommittee, updateCommittee } from '@/lib/school-admin/committees/mutations';
import type { CommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { createSchoolAdminErrorReporter } from '@/lib/mobile-error-reporter';

export function SchoolAdminCommitteeSettingsSection({
  committee,
  organizationId,
  supabase,
  onCommitteeChange,
  onNavigate,
}: ParentCommitteeSectionProps) {
  const theme = useParentTheme();
  const reportError = createSchoolAdminErrorReporter(organizationId);

  const [name, setName] = useState(committee.name);
  const [description, setDescription] = useState(committee.description);
  const [termLabel, setTermLabel] = useState(committee.termLabel);
  const [termStart, setTermStart] = useState(committee.termStart ?? '');
  const [termEnd, setTermEnd] = useState(committee.termEnd ?? '');
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingTerm, setSavingTerm] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const isDetailsDirty = name !== committee.name || description !== committee.description;
  const isTermDirty =
    termLabel !== committee.termLabel ||
    termStart !== (committee.termStart ?? '') ||
    termEnd !== (committee.termEnd ?? '');

  const handleSaveDetails = async () => {
    if (!isDetailsDirty || !name.trim()) return;
    setSavingDetails(true);
    try {
      const updated = await updateCommittee(supabase, organizationId, committee.id, {
        name: name.trim(),
        description: description.trim(),
      });
      onCommitteeChange(updated);
    } catch (error) {
      reportError('committees.settings.save_details', error, {
        entityType: 'committee',
        entityId: committee.id,
      });
    } finally {
      setSavingDetails(false);
    }
  };

  const handleSaveTerm = async () => {
    if (!isTermDirty) return;
    setSavingTerm(true);
    try {
      const updated = await updateCommittee(supabase, organizationId, committee.id, {
        termLabel,
        termStart: termStart || null,
        termEnd: termEnd || null,
      });
      onCommitteeChange(updated);
    } catch (error) {
      reportError('committees.settings.save_term', error, {
        entityType: 'committee',
        entityId: committee.id,
      });
    } finally {
      setSavingTerm(false);
    }
  };

  const handleArchive = () => {
    Alert.alert(
      'Archive committee',
      'Mark this workspace as archived? History will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setArchiving(true);
              try {
                const updated = await archiveCommittee(supabase, organizationId, committee.id);
                onCommitteeChange(updated);
              } catch (error) {
                reportError('committees.archive', error, {
                  entityType: 'committee',
                  entityId: committee.id,
                });
              } finally {
                setArchiving(false);
              }
            })();
          },
        },
      ],
    );
  };

  const navigate = onNavigate ?? (() => undefined);

  return (
    <View style={styles.container}>
      <StoryDetailSection title="Committee details">
        <Text style={[styles.helpCopy, { color: theme.muted }]}>
          Short summary shown on the committees list and workspace header.
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Committee name"
          style={[styles.input, { color: theme.ink, borderColor: theme.line, backgroundColor: theme.white }]}
          placeholderTextColor={theme.muted}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Brief description for families and volunteers…"
          style={[
            styles.input,
            styles.textArea,
            { color: theme.ink, borderColor: theme.line, backgroundColor: theme.white },
          ]}
          placeholderTextColor={theme.muted}
        />
        <StoryButton
          label={savingDetails ? 'Saving…' : 'Save details'}
          onPress={() => void handleSaveDetails()}
          disabled={savingDetails || !isDetailsDirty || !name.trim()}
        />
      </StoryDetailSection>

      <StoryDetailSection title="Membership">
        <Text style={[styles.helpCopy, { color: theme.muted }]}>
          {committee.members.length} members · Term {committee.termLabel}
        </Text>
        <StoryTextLink
          label="Manage members in the Members tab →"
          onPress={() => navigate('members' as CommitteeWorkspaceSection)}
        />
      </StoryDetailSection>

      <StoryDetailSection title="Term dates">
        <TextInput
          value={termLabel}
          onChangeText={setTermLabel}
          placeholder="Term label"
          style={[styles.input, { color: theme.ink, borderColor: theme.line, backgroundColor: theme.white }]}
          placeholderTextColor={theme.muted}
        />
        <View style={styles.dateRow}>
          <TextInput
            value={termStart}
            onChangeText={setTermStart}
            placeholder="Start (YYYY-MM-DD)"
            style={[
              styles.input,
              styles.dateInput,
              { color: theme.ink, borderColor: theme.line, backgroundColor: theme.white },
            ]}
            placeholderTextColor={theme.muted}
          />
          <TextInput
            value={termEnd}
            onChangeText={setTermEnd}
            placeholder="End (YYYY-MM-DD)"
            style={[
              styles.input,
              styles.dateInput,
              { color: theme.ink, borderColor: theme.line, backgroundColor: theme.white },
            ]}
            placeholderTextColor={theme.muted}
          />
        </View>
        <StoryButton
          label={savingTerm ? 'Saving…' : 'Save term'}
          onPress={() => void handleSaveTerm()}
          disabled={savingTerm || !isTermDirty}
        />
      </StoryDetailSection>

      {committee.status === 'active' ? (
        <StoryCard compact style={styles.archiveCard}>
          <Text style={[styles.archiveTitle, { color: theme.ink }]}>Archive committee</Text>
          <Text style={[styles.helpCopy, { color: theme.muted }]}>
            Mark this workspace as archived at the end of the school year. History is preserved.
          </Text>
          <StoryButton
            label={archiving ? 'Archiving…' : 'Archive workspace'}
            variant="outline"
            onPress={handleArchive}
            disabled={archiving}
          />
        </StoryCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  helpCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  dateInput: {
    flex: 1,
  },
  archiveCard: {
    padding: StoryCardPadding,
    gap: Spacing.two,
    backgroundColor: '#FFF3DF',
    borderColor: '#F0D9A8',
  },
  archiveTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
  },
});
