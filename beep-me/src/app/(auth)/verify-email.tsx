import { PlaceholderScreen } from '@/components/ui';

export default function VerifyEmailScreen() {
  return (
    <PlaceholderScreen
      title="Check your inbox"
      description="Enter the code we emailed to your .edu address to verify you are a student."
      phase={2}
      icon="mail-unread-outline"
    />
  );
}
