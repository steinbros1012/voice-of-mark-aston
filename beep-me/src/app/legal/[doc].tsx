import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EmptyState, Screen, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { LEGAL_DOCS } from '@/features/legal';

export default function LegalDocScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const document = doc === 'terms' || doc === 'privacy' || doc === 'guidelines' ? LEGAL_DOCS[doc] : null;
  if (!document) {
    return (
      <Screen scroll={false}>
        <EmptyState title="Document not found" icon="document-text-outline" />
      </Screen>
    );
  }
  return (
    <>
      <Stack.Screen options={{ title: document.title }} />
      <Screen>
        <View style={styles.intro}>
          <Text variant="display">{document.title}</Text>
          <Text variant="caption" color="textSecondary">
            Last updated {document.updated}
          </Text>
          <Text>{document.intro}</Text>
        </View>
        {document.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text variant="heading">{section.heading}</Text>
            {section.paragraphs.map((p, i) => (
              <Text key={i} color="textSecondary">
                {p}
              </Text>
            ))}
          </View>
        ))}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  intro: { gap: Spacing.sm },
  section: { gap: Spacing.sm },
});
