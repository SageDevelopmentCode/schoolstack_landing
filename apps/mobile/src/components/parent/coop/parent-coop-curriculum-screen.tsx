import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ParentCoopCurriculumSkeleton } from '@/components/parent/coop/parent-coop-curriculum-skeleton';
import { ParentCoopCurriculumStoryHeader } from '@/components/parent/coop/parent-coop-curriculum-story-header';
import { ParentKeyboardAwareScrollView } from '@/components/parent/parent-keyboard-aware-scroll-view';
import { ParentEmbeddedPdfPreview } from '@/components/parent/shared/parent-embedded-pdf-preview';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryPillNav } from '@/components/story/story-pill-nav';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryCardPadding, StoryFonts, StoryRadius } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { cacheParentCoopCurriculumPdf } from '@/lib/pdf/cache-authenticated-parent-pdf';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';
import {
  fetchParentCoopCurriculumDiscussion,
  fetchParentCoopCurriculumPageData,
  postParentCoopCurriculumDiscussionMessage,
  type ParentCoopCurriculumRecord,
} from '@/lib/parent/parent-portal-api';

type ParentCoopCurriculumScreenProps = {
  organizationId: string;
  programId: string;
};

function PdfSkeletonBlock() {
  return (
    <View
      style={{
        minHeight: 360,
        borderRadius: StoryRadius.card,
        backgroundColor: Story.line,
        opacity: 0.55,
      }}
    />
  );
}

export function ParentCoopCurriculumScreen({
  organizationId,
  programId,
}: ParentCoopCurriculumScreenProps) {
  const theme = useParentTheme();
  const previewReadOnly = usePortalReadOnly();
  const { reportError } = useMobileErrorReporter(organizationId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [curricula, setCurricula] = useState<ParentCoopCurriculumRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pdfFileUri, setPdfFileUri] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);
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

  const activeCurriculumIdRef = useRef<string | null>(null);
  activeCurriculumIdRef.current = activeCurriculum?.id ?? null;
  const scrollRef = useRef<ScrollView>(null);

  const scrollDiscussionIntoView = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const guidePills = useMemo(
    () =>
      curricula.map((guide) => ({
        key: guide.id,
        label: guide.displayName ?? guide.fileName,
      })),
    [curricula],
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
      reportError('parent_coop_curriculum_load', loadError, {
        entityType: 'program',
        entityId: programId,
      });
      setError(loadError instanceof Error ? loadError.message : 'Failed to load curriculum.');
    } finally {
      setLoading(false);
    }
  }, [organizationId, programId, reportError]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!activeCurriculum) {
      setPdfFileUri(null);
      setPdfError(false);
      return;
    }

    let cancelled = false;
    setPdfLoading(true);
    setPdfError(false);
    setPdfFileUri(null);

    void cacheParentCoopCurriculumPdf({
      organizationId,
      programId,
      curriculumId: activeCurriculum.id,
    })
      .then((fileUri) => {
        if (!cancelled) {
          setPdfFileUri(fileUri);
        }
      })
      .catch((pdfError) => {
        if (!cancelled) {
          reportError('parent_coop_curriculum_pdf_cache', pdfError, {
            entityType: 'curriculum',
            entityId: activeCurriculum.id,
          });
          setPdfError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setPdfLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCurriculum, organizationId, programId, reportError]);

  const applyDiscussionMessages = useCallback(
    (
      forCurriculumId: string | null,
      newMessages: Awaited<
        ReturnType<typeof fetchParentCoopCurriculumDiscussion>
      >['messages'],
    ) => {
      if (forCurriculumId === activeCurriculumIdRef.current) {
        setMessages(newMessages);
      }
    },
    [],
  );

  const refreshDiscussion = useCallback(
    async (curriculumId?: string | null) => {
      const targetId = curriculumId ?? activeCurriculumIdRef.current;
      const payload = await fetchParentCoopCurriculumDiscussion(
        organizationId,
        programId,
        targetId,
      );
      applyDiscussionMessages(targetId, payload.messages);
    },
    [applyDiscussionMessages, organizationId, programId],
  );

  useEffect(() => {
    const curriculumId = activeCurriculum?.id ?? null;
    let cancelled = false;
    setMessages([]);

    if (!discussionOpen || !activeCurriculum) {
      return () => {
        cancelled = true;
      };
    }

    void fetchParentCoopCurriculumDiscussion(organizationId, programId, curriculumId)
      .then((payload) => {
        if (cancelled) return;
        applyDiscussionMessages(curriculumId, payload.messages);
      });

    return () => {
      cancelled = true;
    };
  }, [
    activeCurriculum,
    activeCurriculum?.id,
    applyDiscussionMessages,
    discussionOpen,
    organizationId,
    programId,
  ]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || previewReadOnly) return;
    const curriculumId = activeCurriculum?.id ?? null;
    setSending(true);
    try {
      await postParentCoopCurriculumDiscussionMessage({
        organizationId,
        programId,
        body,
        curriculumId,
      });
      setDraft('');
      await refreshDiscussion(curriculumId);
    } catch (sendError) {
      reportError('parent_coop_curriculum_discussion_send', sendError, {
        entityType: 'program',
        entityId: programId,
      });
    } finally {
      setSending(false);
    }
  };

  const retryPdf = () => {
    if (!activeCurriculum) return;
    setPdfLoading(true);
    setPdfError(false);
    void cacheParentCoopCurriculumPdf({
      organizationId,
      programId,
      curriculumId: activeCurriculum.id,
    })
      .then(setPdfFileUri)
      .catch((pdfError) => {
        reportError('parent_coop_curriculum_pdf_cache', pdfError, {
          entityType: 'curriculum',
          entityId: activeCurriculum.id,
        });
        setPdfError(true);
      })
      .finally(() => setPdfLoading(false));
  };

  if (loading) {
    return <ParentCoopCurriculumSkeleton />;
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <Text style={[styles.error, { color: theme.muted }]}>{error}</Text>
        <StoryButton label="Try again" previewSafe onPress={() => void load()} />
      </View>
    );
  }

  const pdfTitle = activeCurriculum?.displayName ?? activeCurriculum?.fileName ?? 'Curriculum';

  return (
    <ParentKeyboardAwareScrollView
      ref={scrollRef}
      testID="parent-coop-curriculum-ready"
      style={{ flex: 1, backgroundColor: Story.paper }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <Animated.View entering={FadeInDown.duration(280)}>
        <ParentCoopCurriculumStoryHeader />
      </Animated.View>

      {curricula.length === 0 ? (
        <Text style={[styles.empty, { color: theme.muted }]}>No curriculum guides yet.</Text>
      ) : (
        <>
          {guidePills.length > 1 ? (
            <Animated.View entering={FadeInDown.duration(300).delay(40)}>
              <StoryPillNav
                items={guidePills}
                activeKey={activeCurriculum?.id ?? guidePills[0]?.key ?? ''}
                onChange={setActiveId}
                size="compact"
              />
            </Animated.View>
          ) : null}

          <Animated.View entering={FadeInDown.duration(300).delay(60)}>
            <StoryCard>
              <View style={styles.pdfCardInner}>
                {pdfLoading ? (
                  <PdfSkeletonBlock />
                ) : pdfFileUri ? (
                  <ParentEmbeddedPdfPreview url={pdfFileUri} title={pdfTitle} minHeight={360} />
                ) : pdfError ? (
                  <View style={styles.pdfError}>
                    <Text style={[styles.error, { color: theme.muted }]}>
                      Could not load this guide.
                    </Text>
                    <StoryButton label="Try again" previewSafe onPress={retryPdf} />
                  </View>
                ) : (
                  <Text style={[styles.error, { color: theme.muted }]}>
                    Could not load this guide.
                  </Text>
                )}
              </View>
            </StoryCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(300).delay(80)}>
            <StoryCard>
              <Pressable
                onPress={() => setDiscussionOpen((open) => !open)}
                style={styles.discussionHeader}>
                <Text style={[styles.discussionTitle, { color: theme.ink }]}>Discussion</Text>
                <Text style={[styles.discussionToggle, { color: theme.primary }]}>
                  {discussionOpen ? 'Hide' : 'Show'}
                </Text>
              </Pressable>

              {discussionOpen ? (
                <View style={styles.discussionBody}>
                  {messages.length === 0 ? (
                    <Text style={{ color: theme.muted, fontFamily: StoryFonts.body, fontSize: 14 }}>
                      No messages yet. Start the conversation.
                    </Text>
                  ) : (
                    messages.map((item) => (
                      <View
                        key={item.id}
                        style={[styles.messageRow, { borderColor: theme.line }]}>
                        <Text style={[styles.messageAuthor, { color: theme.ink }]}>
                          {item.senderDisplayName}
                          {item.senderGuardianId === currentGuardianId ? ' (you)' : ''}
                        </Text>
                        <Text style={{ color: theme.ink, fontFamily: StoryFonts.body, fontSize: 14 }}>
                          {item.body}
                        </Text>
                      </View>
                    ))
                  )}
                  {!previewReadOnly ? (
                    <View style={styles.composeRow}>
                      <TextInput
                        value={draft}
                        onChangeText={setDraft}
                        placeholder="Write a message…"
                        placeholderTextColor={theme.muted}
                        onFocus={scrollDiscussionIntoView}
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
            </StoryCard>
          </Animated.View>
        </>
      )}
    </ParentKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.three,
  },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  empty: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    paddingVertical: Spacing.four,
  },
  error: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    textAlign: 'center',
  },
  pdfCardInner: {
    padding: StoryCardPadding,
    overflow: 'hidden',
    borderRadius: StoryRadius.card,
  },
  pdfError: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: StoryCardPadding,
  },
  discussionTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
  },
  discussionToggle: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
  },
  discussionBody: {
    paddingHorizontal: StoryCardPadding,
    paddingBottom: StoryCardPadding,
    gap: Spacing.two,
  },
  messageRow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: Spacing.two,
    gap: 4,
  },
  messageAuthor: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 13,
  },
  composeRow: {
    gap: Spacing.two,
    marginTop: Spacing.two,
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
