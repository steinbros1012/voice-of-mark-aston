import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { QueryState } from '@/hooks/use-query';

import { BeepCard } from './beep-card';
import type { BeepWithDriver } from './api';

type BeepListProps = {
  query: QueryState<BeepWithDriver[]>;
  emptyTitle: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  header?: React.ReactElement;
};

/** Feed/search list with loading, error, empty and pull-to-refresh states. */
export function BeepList({ query, emptyTitle, emptyDescription, emptyActionLabel, onEmptyAction, header }: BeepListProps) {
  const theme = useTheme();
  const { data, error, isLoading, isRefreshing, refetch } = query;

  let empty: React.ReactElement | null = null;
  if (isLoading) empty = <LoadingState label="Finding rides…" />;
  else if (error && !data) empty = <ErrorState description={error} onAction={refetch} />;
  else if (data && data.length === 0) {
    empty = (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <BeepCard beep={item} />}
      ListHeaderComponent={header}
      ListEmptyComponent={empty ? <View style={styles.emptyWrap}>{empty}</View> : undefined}
      contentContainerStyle={styles.content}
      style={{ backgroundColor: theme.background }}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={theme.primary} />}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  emptyWrap: { flex: 1, minHeight: 320 },
});
