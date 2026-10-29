import { useRouter } from 'expo-router';
import { Linking } from 'react-native';

import { Card, ListRow, Screen, Text } from '@/components/ui';

const SUPPORT_EMAIL = 'support@beepme.app';

export default function HelpScreen() {
  const router = useRouter();
  return (
    <Screen>
      <Card flush style={{ paddingHorizontal: 16 }}>
        <ListRow icon="shield-checkmark-outline" title="How verification works" subtitle="Every student confirms a university .edu email with a one-time code. That proves campus membership only; Beep Me does not run background checks." />
        <ListRow icon="car-outline" title="Riding safely" subtitle="Check the driver's rating and reviews, agree on a public pickup spot in chat, and share the ride link with a friend." />
        <ListRow icon="cash-outline" title="Pricing and fees" subtitle="Drivers set a price per seat. Riders are charged when the driver accepts, plus a $1 booking fee (waived with Plus). Beep Me keeps 15% of the seat price; the driver is paid after the ride." />
        <ListRow icon="close-circle-outline" title="Cancellations" subtitle="Riders can cancel before departure for a full refund. Drivers who cancel a ride refund every rider." />
        <ListRow icon="flag-outline" title="Reporting and blocking" subtitle="Report a ride or a student from their page. Blocking hides your rides and requests from each other." last />
      </Card>
      <Card flush style={{ paddingHorizontal: 16 }}>
        <ListRow icon="call-outline" title="In an emergency" subtitle="Call 911, or UNCW Police at (910) 962-2222" onPress={() => void Linking.openURL('tel:911')} />
        <ListRow
          icon="alert-circle-outline"
          title="Report a safety issue"
          subtitle="Reaches a person on the Beep Me team. Include the ride and what happened."
          onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Safety issue')}`)}
        />
        <ListRow icon="mail-outline" title="Contact support" subtitle={SUPPORT_EMAIL} onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)} last />
      </Card>
      <Card flush style={{ paddingHorizontal: 16 }}>
        <ListRow icon="document-text-outline" title="Terms of Service" onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'terms' } })} />
        <ListRow icon="lock-closed-outline" title="Privacy Policy" onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'privacy' } })} />
        <ListRow icon="trash-outline" title="Delete my account" subtitle="Removes your profile, photo and messages. Payment records are kept as the policy explains." onPress={() => router.push('/delete-account')} destructive last />
      </Card>
      <Text variant="tiny" color="textMuted">
        Reports and safety emails are reviewed by a person. Student email verification confirms a campus address only; it is not a background check.
      </Text>
    </Screen>
  );
}
