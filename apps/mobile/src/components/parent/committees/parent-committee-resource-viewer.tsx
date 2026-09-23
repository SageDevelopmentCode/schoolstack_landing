import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ParentEmbeddedPdfPreview } from '@/components/parent/shared/parent-embedded-pdf-preview';
import { StoryButton } from '@/components/story/story-button';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { resolveCommitteeResourceUrl } from '@/lib/parent/committees/mutations';
import type { CommitteeResource } from '@/lib/parent/parent-committees-types';
import { buildEmbeddedPdfViewerUrl } from '@/lib/school-bulletin/bulletin-format';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { SupabaseClient } from '@supabase/supabase-js';

type ParentCommitteeResourceViewerProps = {
  supabase: SupabaseClient;
  resource: CommitteeResource;
};

export function ParentCommitteeResourceViewer({
  supabase,
  resource,
}: ParentCommitteeResourceViewerProps) {
  const theme = useParentTheme();
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
          setError(resolveError instanceof Error ? resolveError.message : 'Failed to open resource.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resource, supabase]);

  const openExternally = useCallback(async () => {
    if (!url) return;
    await WebBrowser.openBrowserAsync(url);
  }, [url]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (error || !url) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorCopy, { color: theme.alert }]}>
          {error ?? 'This resource cannot be opened.'}
        </Text>
      </View>
    );
  }

  if (resource.type === 'pdf') {
    return (
      <ParentEmbeddedPdfPreview
        url={buildEmbeddedPdfViewerUrl(url)}
        title={resource.title}
        minHeight={420}
      />
    );
  }

  return (
    <View style={styles.externalWrap}>
      <Text style={[styles.externalCopy, { color: theme.muted }]}>
        {resource.type === 'doc'
          ? 'Word documents open in your browser.'
          : 'This resource opens in your browser.'}
      </Text>
      <StoryButton label="Open resource" previewSafe onPress={() => void openExternally()} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  errorCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    textAlign: 'center',
  },
  externalWrap: {
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  externalCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
