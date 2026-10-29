import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { UNIVERSITIES } from '@/constants/universities';
import { useAuth } from '@/features/auth';
import { BeepList, listBeeps } from '@/features/beeps';
import { useQuery } from '@/hooks/use-query';

export default function FeedScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const universityId = profile?.university_id ?? null;
  const university = UNIVERSITIES.find((u) => u.id === universityId);

  const fetchFeed = useCallback(() => listBeeps(universityId ?? ''), [universityId]);
  const query = useQuery(fetchFeed, { enabled: Boolean(universityId) });

  return (
    <BeepList
      query={query}
      header={
        <View style={styles.header}>
          <Text variant="caption" color="textSecondary">
            Upcoming rides leaving {university ? university.shortName : 'your campus'}
          </Text>
        </View>
      }
      emptyTitle="No Beeps yet"
      emptyDescription="Nobody has posted a ride from campus. Driving somewhere? Post the first one."
      emptyActionLabel="Post a Beep"
      onEmptyAction={() => router.push('/post')}
    />
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: Spacing.sm },
});
