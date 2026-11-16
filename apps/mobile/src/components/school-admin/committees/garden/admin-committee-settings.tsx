import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { confirmDestructive, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GDateField, GTextField } from '@/components/parent/garden/fields';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GLink, GPressable } from '@/components/parent/garden/ui';
import { errorText } from '@/components/school-admin/garden/admin-sheet';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import { archiveCommittee, updateCommittee } from '@/lib/school-admin/committees/mutations';

/**
 * Admin workspace › Settings (Garden): details, term dates and archive. Same
 * mutations, confirm copy and `committees.settings.*` / `committees.archive`
 * operations as Story; each save now toasts (before, nothing showed).
 */
export function AdminCommitteeSettings({ committee, organizationId, supabase, onCommitteeChange, onNavigate }: ParentCommitteeSectionProps) {
  const accent = useGardenAccent();
  const action = useAdminAction(organizationId);
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [name, setName] = useState(committee.name);
  const [description, setDescription] = useState(committee.description);
  const [termLabel, setTermLabel] = useState(committee.termLabel);
  const [termStart, setTermStart] = useState(committee.termStart ?? '');
  const [termEnd, setTermEnd] = useState(committee.termEnd ?? '');
  const [busy, setBusy] = useState<'details' | 'term' | 'archive' | null>(null);

  const detailsDirty = name !== committee.name || description !== committee.description;
  const termDirty = termLabel !== committee.termLabel || termStart !== (committee.termStart ?? '') || termEnd !== (committee.termEnd ?? '');

  const saveDetails = async () => {
    if (!detailsDirty || !name.trim()) return;
    if (readOnly) return notifyReadOnly();
    setBusy('details');
    await action.run(
      async () => onCommitteeChange(await updateCommittee(supabase, organizationId, committee.id, { name: name.trim(), description: description.trim() })),
      {
        key: 'committee-details',
        operation: 'committees.settings.save_details',
        metadata: { committeeId: committee.id },
        retry: true,
        success: { title: 'Details saved', description: 'The committees list and header show the new name.' },
        error: (err) => ({ title: "Couldn't save details", description: `${errorText(err, 'Save failed.')} Your edits are still here.` }),
      },
    );
    setBusy(null);
  };

  const saveTerm = async () => {
    if (!termDirty) return;
    if (readOnly) return notifyReadOnly();
    setBusy('term');
    await action.run(
      async () =>
        onCommitteeChange(
          await updateCommittee(supabase, organizationId, committee.id, { termLabel, termStart: termStart || null, termEnd: termEnd || null }),
        ),
      {
        key: 'committee-term',
        operation: 'committees.settings.save_term',
        metadata: { committeeId: committee.id },
        retry: true,
        success: { title: 'Term saved', description: termLabel ? `Term: ${termLabel}` : undefined },
        error: (err) => ({ title: "Couldn't save the term", description: `${errorText(err, 'Save failed.')} Your edits are still here.` }),
      },
    );
    setBusy(null);
  };

  const archive = async () => {
    if (readOnly) return notifyReadOnly();
    const ok = await confirmDestructive({
      title: 'Archive committee',
      message: 'Mark this workspace as archived? History will be preserved.',
      confirmLabel: 'Archive',
    });
    if (!ok) return;
    setBusy('archive');
    await action.run(async () => onCommitteeChange(await archiveCommittee(supabase, organizationId, committee.id)), {
      key: 'committee-archive',
      operation: 'committees.archive',
      metadata: { committeeId: committee.id },
      retry: true,
      success: { title: `${committee.name} archived`, description: 'History is preserved. It moves to Archived on the list.' },
      error: (err) => ({ title: "Couldn't archive", description: `${errorText(err, 'Archive failed.')} The workspace is still active.` }),
    });
    setBusy(null);
  };

  return (
    <View style={styles.stack}>
      <GCard index={0} title="Committee details" style={action.flashKey === 'committee-details' && styles.flash}>
        <Text style={styles.help}>Short summary shown on the committees list and workspace header.</Text>
        <View style={styles.fields}>
          <GTextField label="Name" value={name} onChangeText={setName} placeholder="Committee name" error={name.trim() ? null : 'A name is required'} />
          <GTextField label="Description" value={description} onChangeText={setDescription} multiline placeholder="Brief description for families and volunteers…" />
        </View>
        <SaveRow label="Save details" dirty={detailsDirty && Boolean(name.trim())} saving={busy === 'details'} color={accent.clay} onPress={() => void saveDetails()} />
      </GCard>

      <GCard index={1} title="Membership">
        <Text style={styles.help}>
          {committee.members.length} members · Term {committee.termLabel}
        </Text>
        <GLink label="Manage members in the Members tab" onPress={() => onNavigate?.('members')} />
      </GCard>

      <GCard index={2} title="Term dates" style={action.flashKey === 'committee-term' && styles.flash}>
        <View style={styles.fields}>
          <GTextField label="Term label" value={termLabel} onChangeText={setTermLabel} placeholder="Term label" />
          <GDateField label="Start" value={termStart} onChange={setTermStart} placeholder="Select start" clearable />
          <GDateField label="End" value={termEnd} onChange={setTermEnd} placeholder="Select end" clearable />
        </View>
        <SaveRow label="Save term" dirty={termDirty} saving={busy === 'term'} color={accent.clay} onPress={() => void saveTerm()} />
      </GCard>

      {committee.status === 'active' ? (
        <GCard index={3} title="Archive">
          <Text style={styles.help}>Mark this workspace as archived at the end of the school year. History is preserved.</Text>
          <GPressable
            accessibilityLabel="Archive workspace"
            accessibilityState={{ busy: busy === 'archive', disabled: busy === 'archive' }}
            disabled={busy === 'archive'}
            onPress={() => void archive()}
            style={styles.danger}>
            {busy === 'archive' ? <ActivityIndicator size="small" color="#9F3A1E" /> : null}
            <Text style={styles.dangerLabel}>{busy === 'archive' ? 'Archiving…' : 'Archive workspace'}</Text>
          </GPressable>
        </GCard>
      ) : null}
    </View>
  );
}

function SaveRow({ label, dirty, saving, color, onPress }: { label: string; dirty: boolean; saving: boolean; color: string; onPress: () => void }) {
  return (
    <View style={styles.saveRow}>
      <Text style={styles.saveStatus}>{saving ? 'Saving…' : dirty ? 'Not saved yet' : 'Saved'}</Text>
      <GPressable
        accessibilityLabel={label}
        accessibilityState={{ disabled: saving || !dirty, busy: saving }}
        disabled={saving || !dirty}
        onPress={onPress}
        style={[styles.save, { backgroundColor: color }, (saving || !dirty) && styles.dim]}>
        {saving ? <ActivityIndicator size="small" color={Garden.white} /> : null}
        <Text style={styles.saveLabel}>{saving ? 'Saving…' : label}</Text>
      </GPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  flash: { backgroundColor: Garden.mint },
  help: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.soft, marginBottom: 10 },
  fields: { gap: 14 },
  saveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 14 },
  saveStatus: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft },
  save: { minHeight: 44, borderRadius: 999, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  saveLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.white },
  dim: { opacity: 0.5 },
  danger: {
    minHeight: 44,
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#C2714F',
    backgroundColor: '#F9E5DA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dangerLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: '#9F3A1E' },
});
