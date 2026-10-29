import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';

import { FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconName = keyof typeof Ionicons.glyphMap;
type TabIconProps = { color: ColorValue; size: number; focused: boolean };

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  index: { active: 'compass', inactive: 'compass-outline' },
  trips: { active: 'ticket', inactive: 'ticket-outline' },
  inbox: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  profile: { active: 'person-circle', inactive: 'person-circle-outline' },
};

function iconColor(color: ColorValue): string | undefined {
  return typeof color === 'string' ? color : undefined;
}

function TabIcon({ route, color, size, focused }: TabIconProps & { route: string }) {
  const icons = TAB_ICONS[route] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
  return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={iconColor(color)} />;
}

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarLabelStyle: { fontSize: FontSize.tiny, fontWeight: '600' },
        tabBarIcon: (props) => <TabIcon route={route.name} {...props} />,
      })}>
      <Tabs.Screen name="index" options={{ title: 'Explore' }} />
      <Tabs.Screen name="trips" options={{ title: 'Trips' }} />
      <Tabs.Screen name="inbox" options={{ title: 'Inbox' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
