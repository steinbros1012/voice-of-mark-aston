import { Ionicons } from '@expo/vector-icons';

import { Screen } from './screen';
import { EmptyState } from './states';

type PlaceholderScreenProps = {
  title: string;
  description: string;
  phase: number;
  icon?: keyof typeof Ionicons.glyphMap;
};

/** Stand-in for a screen whose phase has not landed yet. */
export function PlaceholderScreen({ title, description, phase, icon = 'construct-outline' }: PlaceholderScreenProps) {
  return (
    <Screen scroll={false}>
      <EmptyState title={title} description={`${description} Arrives in Phase ${phase}.`} icon={icon} />
    </Screen>
  );
}
