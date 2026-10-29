import { Linking } from 'react-native';

import { Card, ListRow, Screen } from '@/components/ui';

const SUPPORT_EMAIL = 'support@beepme.app';

export default function HelpScreen() {
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
        <ListRow icon="mail-outline" title="Contact support" subtitle={SUPPORT_EMAIL} onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)} />
        <ListRow icon="call-outline" title="In an emergency" subtitle="Call 911, or UNCW Police at (910) 962-2222" onPress={() => void Linking.openURL('tel:911')} last />
      </Card>
    </Screen>
  );
}
