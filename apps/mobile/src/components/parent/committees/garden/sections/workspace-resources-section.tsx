import { Ionicons } from '@expo/vector-icons';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GInlineBanner } from '@/components/parent/garden/fields';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden } from '@/components/parent/garden/tokens';
import { GCard, GChip, GHand, GIcon, GPressable, GSkeleton, GToyButton, gText } from '@/components/parent/garden/ui';
import { ParentEmbeddedPdfPreview } from '@/components/parent/shared/parent-embedded-pdf-preview';
import { canAccessCommitteeResource } from '@/lib/committees/permissions';
import { openExternalUrlSafely } from '@/lib/open-external-url';
import { COMMITTEE_RESOURCE_TYPE_LABELS } from '@/lib/parent/committees/constants';
import { resolveCommitteeResourceUrl } from '@/lib/parent/committees/mutations';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import type { CommitteeResource, CommitteeResourceType } from '@/lib/parent/parent-committees-types';
import { buildEmbeddedPdfViewerUrl } from '@/lib/school-bulletin/bulletin-format';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const ICONS: Record<CommitteeResourceType, keyof typeof Ionicons.glyphMap> = {
  pdf: 'document-outline',
  doc: 'document-text-outline',
  link: 'link-outline',
  checklist: 'list-outline',
};
const TINTS: Record<CommitteeResourceType, string> = {
  pdf: Garden.peach,
  doc: Garden.sky,
  link: Garden.lav,
  checklist: Garden.mint,
};

function subtitleFor(resource: CommitteeResource): string | null {
  if (resource.fileName) return resource.fileName;
  if (resource.url) return 'External link';
  if (resource.storagePath) return 'Uploaded file';
  return null;
}

function ResourceViewer({
  organizationId,
  supabase,
  resource,
}: {
  organizationId: string;
  supabase: SupabaseClient;
  resource: CommitteeResource;
}) {
  const { reportError } = useMobileErrorReporter(organizationId);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resolved = await resolveCommitteeResourceUrl(supabase, resource);
        if (!cancelled) setUrl(resolved);
      } catch (resolveError) {
        if (!cancelled) {
          reportError('parent_committee_resource_resolve', resolveError, {
            entityType: 'committee_resource',
            entityId: resource.id,
          });
          setError(resolveError instanceof Error ? resolveError.message : 'Failed to open resource.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [organizationId, reportError, resource, supabase]);

  const openExternally = useCallback(async () => {
    if (!url) return;
    await openExternalUrlSafely(url, reportError, {
      operation: 'parent_committee_resource_open_external',
      entityType: 'committee_resource',
      entityId: resource.id,
      errorTitle: 'Could not open resource',
    });
  }, [reportError, resource.id, url]);

  if (loading) return <GSkeleton style={{ height: 220, borderRadius: 18 }} />;
  if (error || !url) {
    return <GInlineBanner tone="error" title="This resource can't be opened" description={error ?? 'This resource cannot be opened.'} />;
  }
  if (resource.type === 'pdf') {
    return (
      <ParentEmbeddedPdfPreview
        url={buildEmbeddedPdfViewerUrl(url)}
        title={resource.title}
        minHeight={420}
        reportEntityType="committee_resource"
        reportEntityId={resource.id}
      />
    );
  }
  return (
    <View style={styles.external}>
      <Text style={gText.meta}>
        {resource.type === 'doc' ? 'Word documents open in your browser.' : 'This resource opens in your browser.'}
      </Text>
      <GToyButton
        label="Open resource"
        icon="open-outline"
        size="md"
        fullWidth
        onPress={() => void openExternally()}
      />
    </View>
  );
}

/** Resources visible to this member's duty role(s). */
export function WorkspaceResourcesSection({
  committee,
  organizationId,
  supabase,
  currentMemberId,
  isAdmin = false,
  initialResourceId,
}: ParentCommitteeSectionProps) {
  const [selected, setSelected] = useState<CommitteeResource | null>(null);
  const deepLinkHandled = useRef(false);

  const visible = useMemo(
    () =>
      isAdmin
        ? committee.resources
        : committee.resources.filter((resource) => canAccessCommitteeResource(resource, currentMemberId, committee, false)),
    [committee, currentMemberId, isAdmin],
  );

  useEffect(() => {
    if (!initialResourceId || deepLinkHandled.current) return;
    const match = visible.find((resource) => resource.id === initialResourceId);
    if (!match) return;
    deepLinkHandled.current = true;
    queueMicrotask(() => setSelected(match));
  }, [initialResourceId, visible]);

  if (visible.length === 0) {
    const roleLimited = !isAdmin && committee.resources.length > 0;
    return (
      <GCard kicker="Resources" title={roleLimited ? 'Nothing shared with you yet' : 'No resources yet'} index={0}>
        <Text style={gText.body}>
          {roleLimited
            ? 'No resources shared with your committee role yet. Ask a committee lead if you need access.'
            : 'No resources yet.'}
        </Text>
        <View style={styles.hand}>
          <GHand>Guides and links will land here.</GHand>
        </View>
      </GCard>
    );
  }

  return (
    <>
      <GCard kicker="Resources" title={`${visible.length} guide${visible.length === 1 ? '' : 's'} & link${visible.length === 1 ? '' : 's'}`} index={0}>
        <View style={styles.notebook}>
          {visible.map((resource, i) => {
            const openable = Boolean(resource.url || resource.storagePath);
            const subtitle = subtitleFor(resource);
            return (
              <GPressable
                key={resource.id}
                accessibilityLabel={`${resource.title}, ${COMMITTEE_RESOURCE_TYPE_LABELS[resource.type]}${openable ? '. Open' : '. Not available'}`}
                accessibilityState={{ disabled: !openable }}
                disabled={!openable}
                pressedScale={0.99}
                onPress={() => setSelected(resource)}
                style={[styles.row, i > 0 && styles.rule]}>
                <GIcon name={ICONS[resource.type]} size="sm" bg={TINTS[resource.type]} />
                <View style={styles.flex}>
                  <Text style={gText.itemTitle} numberOfLines={2}>
                    {resource.title}
                  </Text>
                  {subtitle ? (
                    <Text style={gText.meta} numberOfLines={1}>
                      {subtitle}
                    </Text>
                  ) : null}
                  {resource.description ? (
                    <Text style={gText.meta} numberOfLines={2}>
                      {resource.description}
                    </Text>
                  ) : null}
                  <GChip label={COMMITTEE_RESOURCE_TYPE_LABELS[resource.type]} tone="info" style={styles.chip} />
                </View>
                <Ionicons
                  name={openable ? 'chevron-forward' : 'lock-closed-outline'}
                  size={16}
                  color={Garden.ink60}
                />
              </GPressable>
            );
          })}
        </View>
      </GCard>

      <GSheet
        visible={selected !== null}
        onClose={() => setSelected(null)}
        accessibilityLabel="Close resource"
        kicker={selected ? COMMITTEE_RESOURCE_TYPE_LABELS[selected.type] : undefined}
        title={selected?.title ?? ''}
        subtitle={selected?.description}>
        {selected ? <ResourceViewer organizationId={organizationId} supabase={supabase} resource={selected} /> : null}
      </GSheet>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 3 },
  hand: { marginTop: 10 },
  notebook: {
    backgroundColor: Garden.notebook,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Garden.ink10,
    overflow: 'hidden',
  },
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  rule: { borderTopWidth: 1, borderTopColor: 'rgba(46,74,60,0.1)' },
  chip: { marginTop: 4 },
  external: { gap: 14 },
});
