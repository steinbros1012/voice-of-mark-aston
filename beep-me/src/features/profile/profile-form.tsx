import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Button, FormError, Text, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { describeAuthError, pickAndUploadAvatar, useAuth, validateDisplayName } from '@/features/auth';

type ProfileFormProps = {
  submitLabel: string;
  /** Called after a successful save. */
  onSaved: () => void;
  /** Marks onboarding complete on save. */
  completeOnboarding?: boolean;
};

/** Display name, optional bio and photo. Shared by onboarding and edit profile. */
export function ProfileForm({ submitLabel, onSaved, completeOnboarding = false }: ProfileFormProps) {
  const { user, profile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function choosePhoto() {
    if (!user) return;
    setFormError(null);
    setUploading(true);
    try {
      const url = await pickAndUploadAvatar(user.id);
      if (url) setAvatarUrl(url);
    } catch (error) {
      setFormError(describeAuthError(error));
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    const nameProblem = validateDisplayName(displayName);
    setNameError(nameProblem);
    if (nameProblem) return;
    setFormError(null);
    setSaving(true);
    try {
      await updateProfile({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
        ...(completeOnboarding ? { onboarding_completed_at: new Date().toISOString() } : {}),
      });
      onSaved();
    } catch (error) {
      setFormError(describeAuthError(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.form}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose a profile photo"
        onPress={choosePhoto}
        disabled={uploading}
        style={styles.avatarRow}>
        <Avatar uri={avatarUrl} name={displayName || 'You'} size={88} />
        <Text variant="label" color="primary">
          {uploading ? 'Uploading…' : avatarUrl ? 'Change photo' : 'Add a photo'}
        </Text>
      </Pressable>
      <TextField
        label="Display name"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="First name and last initial"
        autoCapitalize="words"
        textContentType="name"
        error={nameError}
        hint="Riders and drivers see this name."
      />
      <TextField
        label="About you (optional)"
        value={bio}
        onChangeText={setBio}
        placeholder="Senior, commuter from Raleigh, big podcast person"
        multiline
        maxLength={280}
        style={styles.bio}
      />
      <FormError message={formError} />
      <Button title={submitLabel} onPress={save} loading={saving} disabled={uploading} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.md },
  avatarRow: { alignItems: 'center', gap: Spacing.sm },
  bio: { minHeight: 96, paddingTop: Spacing.sm, textAlignVertical: 'top' },
});
