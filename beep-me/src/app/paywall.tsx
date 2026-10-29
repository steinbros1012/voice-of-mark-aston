import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Notice, Pill, Screen, Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/hooks/use-theme';
import { useAnalytics } from '@/lib/analytics';
import { usePlus, type PlusPackage } from '@/lib/purchases';

const PERKS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  { icon: 'arrow-up-circle-outline', title: 'Premium placement for drivers', body: 'Your rides lead the feed for the day they depart, with a Plus badge.' },
  { icon: 'pricetag-outline', title: 'No booking fees for riders', body: 'Skip the $1 booking fee on every seat you book.' },
  { icon: 'sparkles-outline', title: 'Support a student-built app', body: 'Plus keeps Beep Me running without ads.' },
];

export default function PaywallScreen() {
  const router = useRouter();
  const theme = useTheme();
  const analytics = useAnalytics();
  const { profile, refreshProfile } = useAuth();
  const plus = usePlus(Boolean(profile?.plus_active));
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    analytics.track('paywall_viewed', { source: 'profile' });
  }, [analytics]);


  const selected: PlusPackage | null = plus.packages.find((p) => p.id === chosenId) ?? plus.packages[0] ?? null;

  async function buy() {
    if (!selected) return;
    setBusy(true);
    const ok = await plus.purchase(selected);
    if (ok) {
      analytics.track('subscription_started', { product_id: selected.id });
      await refreshProfile();
      setDone(true);
    }
    setBusy(false);
  }

  const active = plus.isPlus;

  return (
    <Screen
      footer={
        active ? (
          <Button title="Done" onPress={() => router.back()} />
        ) : (
          <Button
            title={selected ? `Start Plus · ${selected.priceString}` : 'Start Plus'}
            variant="accent"
            loading={busy}
            disabled={!plus.available || !selected}
            onPress={buy}
          />
        )
      }>
      <View style={styles.hero}>
        <View style={[styles.badge, { backgroundColor: theme.accent }]}>
          <Ionicons name="sparkles" size={26} color={theme.accentText} />
        </View>
        <Text variant="display">Beep Me Plus</Text>
        <Text color="textSecondary">More riders for drivers, no fees for riders.</Text>
        {active ? <Pill label="You're on Plus" tone="accent" icon="checkmark-circle" /> : null}
      </View>

      {done ? <Notice message="Welcome to Plus. Your perks are active now." tone="success" /> : null}

      <Card flush style={styles.perks}>
        {PERKS.map((perk, i) => (
          <View key={perk.title} style={[styles.perk, i < PERKS.length - 1 ? { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth } : null]}>
            <Ionicons name={perk.icon} size={22} color={theme.text} />
            <View style={styles.perkText}>
              <Text variant="bodyStrong">{perk.title}</Text>
              <Text variant="caption" color="textSecondary">
                {perk.body}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      {!active ? (
        plus.loading ? (
          <Text variant="caption" color="textSecondary" align="center">
            Loading plans…
          </Text>
        ) : plus.packages.length ? (
          <View style={styles.plans}>
            {plus.packages.map((pkg) => {
              const isSelected = selected?.id === pkg.id;
              return (
                <Card
                  key={pkg.id}
                  onPress={() => setChosenId(pkg.id)}
                  accessibilityLabel={`${pkg.title} ${pkg.priceString}`}
                  style={[styles.plan, isSelected ? { borderColor: theme.ink, borderWidth: 2 } : null]}>
                  <View style={styles.planRow}>
                    <View>
                      <Text variant="bodyStrong">{pkg.title}</Text>
                      <Text variant="caption" color="textSecondary">
                        {pkg.period === 'ANNUAL' ? 'Billed yearly' : pkg.period === 'MONTHLY' ? 'Billed monthly' : pkg.period}
                      </Text>
                    </View>
                    <Text variant="heading">{pkg.priceString}</Text>
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          <Notice message={plus.available ? 'No plans are configured yet in RevenueCat.' : 'Subscriptions are available in the iOS and Android app.'} tone="info" />
        )
      ) : null}
      {plus.error ? <Notice message={plus.error} /> : null}

      <View style={styles.footer}>
        {!active && plus.available ? <Button title="Restore purchases" variant="ghost" onPress={() => void plus.restore()} /> : null}
        <Text variant="tiny" color="textMuted" align="center">
          Subscriptions renew automatically until cancelled in your App Store or Google Play settings. Managed by RevenueCat.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.sm, textAlign: 'center' },
  badge: { width: 56, height: 56, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
  perks: { paddingHorizontal: Spacing.lg },
  perk: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.md, alignItems: 'flex-start' },
  perkText: { flex: 1, gap: 2 },
  plans: { gap: Spacing.sm },
  plan: {},
  planRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  footer: { gap: Spacing.sm },
});
