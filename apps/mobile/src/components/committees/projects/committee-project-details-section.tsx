import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  committeeProjectDisplayName,
  type CommitteeProject,
} from '@/lib/committees/committee-project-mappers';
import {
  deleteCommitteeProject,
  updateCommitteeProject,
} from '@/lib/committees/committee-projects';
import type { CommitteePortalApiNamespace } from '@/lib/committees/notify-committee-task-assignment';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type CommitteeProjectDetailsSectionProps = {
  project: CommitteeProject;
  organizationId: string;
  supabase: SupabaseClient;
  readOnly?: boolean;
  portalApiNamespace?: CommitteePortalApiNamespace;
  currentMemberId?: string;
  onProjectChange: (project: CommitteeProject) => void;
  onDeleted: () => void;
};

export function CommitteeProjectDetailsSection({
  project,
  organizationId,
  supabase,
  readOnly = false,
  portalApiNamespace = 'parent-portal',
  currentMemberId,
  onProjectChange,
  onDeleted,
}: CommitteeProjectDetailsSectionProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter(organizationId);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [active, setActive] = useState(project.status === 'active');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setName(project.name);
    setDescription(project.description);
    setActive(project.status === 'active');
  }, [project.id, project.name, project.description, project.status]);

  const persist = useCallback(
    async (patch: { name?: string; description?: string; status?: 'draft' | 'active' }) => {
      if (readOnly) return;
      try {
        const updated = await updateCommitteeProject(supabase, project.id, patch);
        onProjectChange({ ...project, ...updated, supplyItemCount: project.supplyItemCount });
      } catch (err) {
        reportError('committees.projects.update', err, {
          entityType: 'committee_project',
          entityId: project.id,
        });
      }
    },
    [onProjectChange, project, readOnly, reportError, supabase],
  );

  const scheduleSave = useCallback(
    (patch: { name?: string; description?: string; status?: 'draft' | 'active' }) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        void persist(patch);
      }, 450);
    },
    [persist],
  );

  const confirmDelete = () => {
    Alert.alert(
      'Delete project?',
      `Remove "${committeeProjectDisplayName(project)}" and its supply list? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void handleDelete(),
        },
      ],
    );
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCommitteeProject(supabase, project.id, {
        organizationId,
        workspaceRecord: {
          organizationId,
          portalApiNamespace,
          createdByMemberId: currentMemberId ?? null,
        },
      });
      onDeleted();
    } catch (err) {
      reportError('committees.projects.delete', err, {
        entityType: 'committee_project',
        entityId: project.id,
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <StoryDetailSection title="Project details">
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.muted }]}>Name</Text>
        <TextInput
          value={name}
          onChangeText={(value) => {
            setName(value);
            scheduleSave({ name: value, description, status: active ? 'active' : 'draft' });
          }}
          editable={!readOnly}
          style={[
            styles.input,
            { borderColor: theme.line, color: theme.ink, backgroundColor: theme.white },
          ]}
        />
      </View>
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.muted }]}>Description</Text>
        <TextInput
          value={description}
          onChangeText={(value) => {
            setDescription(value);
            scheduleSave({ name, description: value, status: active ? 'active' : 'draft' });
          }}
          editable={!readOnly}
          multiline
          style={[
            styles.input,
            styles.textArea,
            { borderColor: theme.line, color: theme.ink, backgroundColor: theme.white },
          ]}
        />
      </View>
      <View style={styles.toggleRow}>
        <Text style={[styles.label, { color: theme.ink }]}>Active</Text>
        <Switch
          value={active}
          onValueChange={(value) => {
            setActive(value);
            scheduleSave({ name, description, status: value ? 'active' : 'draft' });
          }}
          disabled={readOnly}
        />
      </View>
      {!readOnly ? (
        <StoryButton
          label={deleting ? 'Deleting…' : 'Delete project'}
          variant="outline"
          onPress={confirmDelete}
          disabled={deleting}
        />
      ) : null}
    </StoryDetailSection>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: Spacing.three,
    gap: Spacing.one,
  },
  label: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: StoryFonts.body,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
});
