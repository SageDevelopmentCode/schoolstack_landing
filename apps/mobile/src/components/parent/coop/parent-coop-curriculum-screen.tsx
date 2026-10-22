import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ParentCoopCurriculumStoryHeader } from '@/components/parent/coop/parent-coop-curriculum-story-header';
import { ParentEmbeddedPdfPreview } from '@/components/parent/shared/parent-embedded-pdf-preview';
import { StoryButton } from '@/components/story/story-button';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';
import {
  fetchParentCoopCurriculumDiscussion,
  fetchParentCoopCurriculumPageData,
  fetchParentCoopCurriculumPdfDataUri,
  postParentCoopCurriculumDiscussionMessage,
  type ParentCoopCurriculumRecord,
} from '@/lib/parent/parent-portal-api';
import { buildEmbeddedPdfViewerUrl } from '@/lib/school-bulletin/bulletin-format';

type ParentCoopCurriculumScreenProps = {
  organizationId: string;
  programId: string;
};

export function ParentCoopCurriculumScreen({
  organizationId,
  programId,
}: ParentCoopCurriculumScreenProps) {
  const theme = useParentTheme();
  const previewReadOnly = usePortalReadOnly();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [curricula, setCurricula] = useState<ParentCoopCurriculumRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [messages, setMessages] = useState<
    Awaited<ReturnType<typeof fetchParentCoopCurriculumDiscussion>>['messages']
  >([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [currentGuardianId, setCurrentGuardianId] = useState<string | null>(null);

  const activeCurriculum = useMemo(
    () => curricula.find((record) => record.id === activeId) ?? curricula[0] ?? null,
    [activeId, curricula],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchParentCoopCurriculumPageData(organizationId, programId);
      setCurricula(data.curricula);
      setCurrentGuardianId(data.currentGuardianId);
      setMessages(data.discussionMessages);
      if (data.curricula[0]) {
        setActiveId(data.curricula[0].id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load curriculum.');
    } finally {
      setLoading(false);
    }
  }, [organizationId, programId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!activeCurriculum) {
      setPdfUrl(null);
      return;
    }

    let cancelled = false;
    setPdfLoading(true);
    void fetchParentCoopCurriculumPdfDataUri(
      organizationId,
      programId,
      activeCurriculum.id,
    )
      .then((dataUri) => {
        if (!cancelled) {
          setPdfUrl(buildEmbeddedPdfViewerUrl(dataUri));
        }
      })
      .catch(() => {
        if (!cancelled) setPdfUrl(null);
      })
      .finally(() => {
        if (!cancelled) setPdfLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCurriculum, organizationId, programId]);

  const refreshDiscussion = useCallback(async () => {
    const payload = await fetchParentCoopCurriculumDiscussion(
      organizationId,
      programId,
      activeCurriculum?.id ?? null,
    );
    setMessages(payload.messages);
  }, [activeCurriculum?.id, organizationId, programId]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || previewReadOnly) return;
    setSending(true);
    try {
      await postParentCoopCurriculumDiscussionMessage({
        organizationId,
        programId,
        body,
        curriculumId: activeCurriculum?.id ?? null,
      });
      setDraft('');
      await refreshDiscussion();
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <Text style={[styles.error, { color: theme.muted }]}>{error}</Text>
        <StoryButton label="Try again" previewSafe onPress={() => void load()} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: Story.paper }]}>
      <View
        style={[
          styles.headerWrap,
          { borderBottomColor: theme.line, backgroundColor: theme.white },
        ]}>
        <ParentCoopCurriculumStoryHeader />
      </View>

      {curricula.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ color: theme.muted }}>No curriculum guides yet.</Text>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.guideRow}
            style={[styles.guideScroll, { borderBottomColor: theme.line }]}>
            {curricula.map((guide) => {
              const selected = guide.id === activeCurriculum?.id;
              return (
                <Pressable
                  key={guide.id}
                  onPress={() => setActiveId(guide.id)}
                  style={[
                    styles.guideChip,
                    {
                      backgroundColor: selected ? theme.primarySoft : theme.white,
                      borderColor: selected ? theme.primary : theme.line,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.guideChipText,
                      { color: selected ? theme.primary : theme.ink },
                    ]}>
                    {guide.displayName ?? guide.fileName}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.pdfSection}>
            {pdfLoading ? (
              <ActivityIndicator color={theme.primary} style={styles.pdfLoader} />
            ) : pdfUrl ? (
              <ParentEmbeddedPdfPreview
                url={pdfUrl}
                title={activeCurriculum?.displayName ?? activeCurriculum?.fileName ?? 'Curriculum'}
                minHeight={360}
              />
            ) : (
              <Text style={[styles.error, { color: theme.muted }]}>Could not load this guide.</Text>
            )}
          </View>

          <Pressable
            onPress={() => {
              setDiscussionOpen((open) => !open);
              if (!discussionOpen) void refreshDiscussion();
            }}
            style={[styles.discussionToggle, { borderTopColor: theme.line }]}>
            <Text style={[styles.discussionToggleText, { color: theme.primary }]}>
              {discussionOpen ? 'Hide discussion' : 'Open discussion'}
            </Text>
          </Pressable>

          {discussionOpen ? (
            <View style={styles.discussionPanel}>
              <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={[styles.messageRow, { borderColor: theme.line }]}>
                    <Text style={[styles.messageAuthor, { color: theme.ink }]}>
                      {item.guardianName}
                      {item.guardianId === currentGuardianId ? ' (you)' : ''}
                    </Text>
                    <Text style={{ color: theme.ink }}>{item.body}</Text>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={{ color: theme.muted, padding: Spacing.three }}>
                    No messages yet. Start the conversation.
                  </Text>
                }
              />
              {!previewReadOnly ? (
                <View style={styles.composeRow}>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    placeholder="Write a message…"
                    placeholderTextColor={theme.muted}
                    style={[
                      styles.composeInput,
                      { borderColor: theme.line, color: theme.ink, backgroundColor: theme.white },
                    ]}
                    multiline
                  />
                  <StoryButton
                    label={sending ? 'Sending…' : 'Send'}
                    disabled={sending || !draft.trim()}
                    onPress={() => void handleSend()}
                  />
                </View>
              ) : null}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.three,
  },
  headerWrap: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  error: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    textAlign: 'center',
  },
  guideScroll: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    maxHeight: 56,
  },
  guideRow: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  guideChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  guideChipText: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 13,
  },
  pdfSection: {
    flex: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.three,
  },
  pdfLoader: { marginTop: Spacing.six },
  discussionToggle: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.three,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    alignItems: 'center',
  },
  discussionToggleText: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
  },
  discussionPanel: {
    maxHeight: 280,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  messageRow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: Spacing.two,
    marginBottom: Spacing.two,
    gap: 4,
  },
  messageAuthor: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 13,
  },
  composeRow: {
    gap: Spacing.two,
  },
  composeInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.two,
    minHeight: 72,
    fontFamily: StoryFonts.body,
    fontSize: 15,
  },
});
