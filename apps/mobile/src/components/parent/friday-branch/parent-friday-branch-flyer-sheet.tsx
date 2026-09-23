import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { ParentEmbeddedPdfPreview } from '@/components/parent/shared/parent-embedded-pdf-preview';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ParentFridayBranchFlyerTarget } from '@/lib/parent/parent-friday-branch-types';
import { fetchParentFridayBranchFlyerDataUri } from '@/lib/parent/parent-portal-api';
import { buildEmbeddedPdfViewerUrl } from '@/lib/school-bulletin/bulletin-format';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentFridayBranchFlyerSheetProps = {
  visible: boolean;
  organizationId: string;
  target: ParentFridayBranchFlyerTarget | null;
  onClose: () => void;
};

export function ParentFridayBranchFlyerSheet({
  visible,
  organizationId,
  target,
  onClose,
}: ParentFridayBranchFlyerSheetProps) {
  const theme = useParentTheme();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !target) {
      setUrl(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetchParentFridayBranchFlyerDataUri(organizationId, target.classId)
      .then((dataUri) => {
        if (!cancelled) {
          setUrl(buildEmbeddedPdfViewerUrl(dataUri));
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load flyer.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [organizationId, target, visible]);

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={onClose}
      title={target?.fileName ?? 'Class flyer'}
      subtitle="Friday Branch">
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : null}
      {error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorCopy, { color: theme.alert }]}>{error}</Text>
        </View>
      ) : null}
      {!loading && !error && url ? (
        <ParentEmbeddedPdfPreview url={url} title={target?.fileName ?? 'Class flyer'} minHeight={420} />
      ) : null}
    </ParentBottomSheet>
  );
}

const styles = StyleSheet.create({
  centered: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  errorCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
