import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type IconName = keyof typeof Ionicons.glyphMap;
type TabIconProps = { color: ColorValue; size: number; focused: boolean };

/** Tab bar colors are always strings in practice; drop the exotic ColorValue members for the icon prop. */
function iconColor(color: ColorValue): string | undefined {
  return typeof color === 'string' ? color : undefined;
}

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  index: { active: 'car', inactive: 'car-outline' },
  search: { active: 'search', inactive: 'search-outline' },
  post: { active: 'add-circle', inactive: 'add-circle-outline' },
  rides: { active: 'ticket', inactive: 'ticket-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

function TabIcon({ route, color, size, focused }: TabIconProps & { route: string }) {
  const icons = TAB_ICONS[route] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
  return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={iconColor(color)} />;
}

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border },
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
        tabBarIcon: (props) => <TabIcon route={route.name} {...props} />,
      })}>
      <Tabs.Screen name="index" options={{ title: 'Feed' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="post" options={{ title: 'Post a Beep', tabBarLabel: 'Post' }} />
      <Tabs.Screen name="rides" options={{ title: 'My rides' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
