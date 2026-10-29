import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, EmptyState, ErrorState, LoadingState, RequestStatusPill, Text } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { listConversations, type SeatRequestDetail } from '@/features/requests';
import { useTheme } from '@/hooks/use-theme';
import { useQuery } from '@/hooks/use-query';
import { formatDepartureDay } from '@/lib/format';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function ConversationRow({ item, userId, last }: { item: SeatRequestDetail; userId: string; last: boolean }) {
  const theme = useTheme();
  const router = useRouter();
  const isDriver = item.beep.driver_id === userId;
  const other = isDriver ? item.rider : item.beep.driver;
  const preview = item.last_message_preview ?? (isDriver ? `Requested ${item.seats_requested} seat${item.seats_requested === 1 ? '' : 's'}` : 'No messages yet. Say hi!');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${other.display_name} about ${item.beep.destination}`}
      onPress={() => router.push({ pathname: '/chat/[requestId]', params: { requestId: item.id } })}
      style={({ pressed }) => [styles.row, !last ? { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth } : null, { opacity: pressed ? 0.7 : 1 }]}>
      <Avatar uri={other.avatar_url} name={other.display_name} size={48} />
      <View style={styles.rowText}>
        <View style={styles.rowTop}>
          <Text variant="bodyStrong" numberOfLines={1} style={styles.name}>
            {other.display_name}
          </Text>
          <Text variant="tiny" color="textMuted">
            {item.last_message_at ? timeAgo(item.last_message_at) : formatDepartureDay(item.beep.departure_at)}
          </Text>
        </View>
        <Text variant="caption" color="textSecondary" numberOfLines={1}>
          {item.beep.origin} → {item.beep.destination} · {formatDepartureDay(item.beep.departure_at)}
        </Text>
        <View style={styles.rowBottom}>
          <Text variant="caption" numberOfLines={1} style={styles.preview}>
            {preview}
          </Text>
          <RequestStatusPill status={item.status} />
        </View>
      </View>
    </Pressable>
  );
}

export default function InboxScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const fetchConversations = useCallback(() => listConversations(userId), [userId]);
  const query = useQuery(fetchConversations, { enabled: Boolean(userId) });

  let empty: React.ReactElement | null = null;
  if (query.isLoading) empty = <LoadingState />;
  else if (query.error && !query.data) empty = <ErrorState description={query.error} onAction={query.refetch} />;
  else if (query.data && query.data.length === 0) {
    empty = <EmptyState title="No conversations" description="Chats open when you request a seat or someone requests one on your ride." icon="chatbubble-ellipses-outline" actionLabel="Explore rides" onAction={() => router.push('/')} />;
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: theme.background }]}>
      <FlatList
        data={query.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <ConversationRow item={item} userId={userId} last={index === (query.data?.length ?? 0) - 1} />}
        ListHeaderComponent={
          <Text variant="display" style={styles.title}>
            Inbox
          </Text>
        }
        ListEmptyComponent={empty ? <View style={styles.emptyWrap}>{empty}</View> : undefined}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xxl }]}
        refreshControl={<RefreshControl refreshing={query.isRefreshing} onRefresh={query.refetch} tintColor={theme.text} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: Spacing.lg },
  title: { paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.md },
  rowText: { flex: 1, gap: 2 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  name: { flex: 1 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm, marginTop: 2 },
  preview: { flex: 1 },
  emptyWrap: { flex: 1, minHeight: 360 },
});
