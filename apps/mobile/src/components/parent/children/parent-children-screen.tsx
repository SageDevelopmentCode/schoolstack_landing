import { useRouter } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import {
  PARENT_CHILD_ROW_SEPARATOR_INSET,
  ParentChildListRow,
} from '@/components/parent/children/parent-child-list-row';
import { ParentChildrenSkeleton } from '@/components/parent/children/parent-children-skeleton';
import { PARENT_FLOATING_TAB_BAR_HEIGHT } from '@/components/parent/parent-floating-tab-bar';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { useParentHome } from '@/contexts/parent-home-context';
import { Spacing } from '@/constants/theme';
import { resolveWebUrl, schoolApplyUrl } from '@/lib/admissions/school-apply-url';
import { parentChildDetailRoute } from '@/lib/parent/parent-nav';

type ParentChildrenScreenProps = {
  slug: string;
};

export function ParentChildrenScreen({ slug }: ParentChildrenScreenProps) {
  const theme = useAdminTheme();
  const router = useRouter();
  const { data, isLoading, isRefreshing, error, refresh } = useParentHome();

  const children = data?.familyChildren ?? [];

  const handleOpenApplyDashboard = async () => {
    await openBrowserAsync(resolveWebUrl(schoolApplyUrl(slug)), {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  };

  if (isLoading && !data) {
    return <ParentChildrenSkeleton />;
  }

  if (error && !data) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
          {error}
        </ThemedText>
        <PrimaryButton label="Try again" onPress={() => void refresh()} style={styles.retry} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: PARENT_FLOATING_TAB_BAR_HEIGHT + Spacing.six },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void refresh()}
          tintColor={theme.accent}
        />
      }>
      <ThemedText type="title" style={[styles.title, { color: theme.textPrimary }]}>
        My children
      </ThemedText>

      {children.length === 0 ? (
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
          We don&apos;t have any student records from your applications yet. Visit your{' '}
          <ThemedText
            type="smallBold"
            style={{ color: theme.accent }}
            onPress={() => void handleOpenApplyDashboard()}>
            application dashboard
          </ThemedText>{' '}
          to get started.
        </ThemedText>
      ) : (
        <View>
          {children.map((child, index) => (
            <View key={child.applicationId}>
              <ParentChildListRow
                child={child}
                onPress={() => router.push(parentChildDetailRoute(slug, child.applicationId))}
              />
              {index < children.length - 1 ? (
                <View
                  style={[
                    styles.divider,
                    {
                      backgroundColor: theme.border,
                      marginLeft: PARENT_CHILD_ROW_SEPARATOR_INSET,
                    },
                  ]}
                />
              ) : null}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  retry: {
    minWidth: 140,
  },
  content: {
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    paddingHorizontal: Spacing.four,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
