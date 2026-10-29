import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

type AvatarProps = {
  uri: string | null | undefined;
  name: string;
  size?: number;
};

/** Profile photo with an initials fallback. */
export function Avatar({ uri, name, size = 56 }: AvatarProps) {
  const theme = useTheme();
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={shape} contentFit="cover" accessibilityLabel={`${name}'s photo`} />;
  }
  return (
    <View style={[styles.fallback, shape, { backgroundColor: theme.surfaceSelected }]}>
      <Text variant="subheading" color="textSecondary" style={{ fontSize: size * 0.38, lineHeight: size * 0.5 }}>
        {initials || '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
