import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, ErrorState, LoadingState, Notice, RequestStatusPill, Text } from '@/components/ui';
import { FontSize, MaxContentWidth, Radius, Spacing, TouchTarget } from '@/constants/theme';
import { describeAuthError, useAuth } from '@/features/auth';
import { listMessages, sendMessage, subscribeToMessages } from '@/features/messages';
import { getSeatRequest } from '@/features/requests';
import { useTheme } from '@/hooks/use-theme';
import { useQuery } from '@/hooks/use-query';
import { webInputReset } from '@/lib/platform';
import { formatDepartureDay, formatTime } from '@/lib/format';
import type { Message } from '@/types/database';

function Bubble({ message, mine }: { message: Message; mine: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : null]}>
      <View style={[styles.bubble, mine ? { backgroundColor: theme.ink } : { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
        <Text style={{ color: mine ? theme.inkText : theme.text }}>{message.body}</Text>
        <Text variant="tiny" style={{ color: mine ? theme.inkText : theme.textMuted, opacity: mine ? 0.7 : 1 }}>
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const listRef = useRef<FlatList<Message>>(null);

  const fetchRequest = useCallback(() => getSeatRequest(requestId), [requestId]);
  const request = useQuery(fetchRequest);
  const fetchMessages = useCallback(() => listMessages(requestId), [requestId]);
  const history = useQuery(fetchMessages);

  // Merge fetched history and live inserts, de-duplicated by id.
  useEffect(() => {
    if (!history.data) return;
    const loaded = history.data;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages((current) => {
      const known = new Set(loaded.map((m) => m.id));
      return [...loaded, ...current.filter((m) => !known.has(m.id))];
    });
  }, [history.data]);

  useEffect(() => {
    return subscribeToMessages(requestId, (message) => {
      setMessages((current) => (current.some((m) => m.id === message.id) ? current : [...current, message]));
    });
  }, [requestId]);

  async function send() {
    const body = draft.trim();
    if (!body || !user) return;
    setSending(true);
    setSendError(null);
    try {
      const message = await sendMessage(requestId, user.id, body);
      setMessages((current) => (current.some((m) => m.id === message.id) ? current : [...current, message]));
      setDraft('');
    } catch (err) {
      setSendError(describeAuthError(err));
    } finally {
      setSending(false);
    }
  }

  if (request.isLoading || (history.isLoading && messages.length === 0)) return <LoadingState />;
  if (request.error || !request.data) return <ErrorState description={request.error ?? 'Conversation not found.'} onAction={request.refetch} />;

  const detail = request.data;
  const isDriver = detail.beep.driver_id === user?.id;
  const other = isDriver ? detail.rider : detail.beep.driver;
  const canChat = detail.status === 'pending' || detail.status === 'accepted';

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/booking/[id]', params: { id: detail.id } })} style={styles.headerTitle}>
              <Avatar uri={other.avatar_url} name={other.display_name} size={32} />
              <View>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {other.display_name}
                </Text>
                <Text variant="tiny" color="textSecondary" numberOfLines={1}>
                  {detail.beep.destination} · {formatDepartureDay(detail.beep.departure_at)}
                </Text>
              </View>
            </Pressable>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <RequestStatusPill status={detail.status} />
            </View>
          ),
        }}
      />
      <KeyboardAvoidingView style={[styles.root, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <Bubble message={item} mine={item.sender_id === user?.id} />}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={28} color={theme.textMuted} />
              <Text variant="caption" color="textSecondary" align="center">
                Say hi and agree on a pickup spot. Keep plans in the app so both of you have a record.
              </Text>
            </View>
          }
          ListHeaderComponent={history.error ? <Notice message={history.error} /> : undefined}
          keyboardShouldPersistTaps="handled"
        />
        <View style={[styles.composer, { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
          <View style={styles.composerInner}>
            {sendError ? <Notice message={sendError} /> : null}
            {canChat ? (
              <View style={styles.inputRow}>
                <TextInput
                  accessibilityLabel="Message"
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Message…"
                  placeholderTextColor={theme.textMuted}
                  multiline
                  maxLength={2000}
                  style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }, webInputReset]}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Send"
                  disabled={!draft.trim() || sending}
                  onPress={send}
                  style={[styles.send, { backgroundColor: theme.ink, opacity: !draft.trim() || sending ? 0.4 : 1 }]}>
                  <Ionicons name="arrow-up" size={20} color={theme.inkText} />
                </Pressable>
              </View>
            ) : (
              <Text variant="caption" color="textSecondary" align="center">
                This conversation is closed because the request is {detail.status}.
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, maxWidth: 240 },
  headerRight: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  list: { flexGrow: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.lg, gap: Spacing.sm, justifyContent: 'flex-end' },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 2 },
  empty: { alignItems: 'center', gap: Spacing.sm, padding: Spacing.xl },
  composer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm, paddingHorizontal: Spacing.lg, alignItems: 'center' },
  composerInner: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  input: { flex: 1, minHeight: TouchTarget, maxHeight: 120, borderWidth: 1, borderRadius: Radius.xl, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, fontSize: FontSize.body },
  send: { width: TouchTarget, height: TouchTarget, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});
