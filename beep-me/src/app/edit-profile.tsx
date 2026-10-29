import { useRouter } from 'expo-router';

import { Screen } from '@/components/ui';
import { ProfileForm } from '@/features/profile/profile-form';

export default function EditProfileScreen() {
  const router = useRouter();
  return (
    <Screen>
      <ProfileForm submitLabel="Save" onSaved={() => router.back()} />
    </Screen>
  );
}
