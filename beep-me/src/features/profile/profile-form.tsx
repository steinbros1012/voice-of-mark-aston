import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Button, FormError, Text, TextField } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { UNIVERSITIES } from '@/constants/universities';
import { describeAuthError, pickAndUploadAvatar, useAuth, validateDisplayName } from '@/features/auth';
import { ConsentCheckbox, TERMS_VERSION } from '@/features/legal';
import { useTheme } from '@/hooks/use-theme';

const BIO_MAX = 150;

type ProfileFormProps = {
  submitLabel: string;
  onSaved: () => void;
  /** Marks onboarding complete on save. */
  completeOnboarding?: boolean;
};

/** Photo, full name, campus (read-only, from the verified email) and a short bio. */
export function ProfileForm({ submitLabel, onSaved, completeOnboarding = false }: ProfileFormProps) {
  const theme = useTheme();
  const { user, profile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const campus = UNIVERSITIES.find((u) => u.id === profile?.university_id);

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
    const consentProblem = completeOnboarding && !consent ? 'Please agree to the terms to continue.' : null;
    setConsentError(consentProblem);
    if (nameProblem || consentProblem) return;
    setFormError(null);
    setSaving(true);
    try {
      await updateProfile({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
        ...(completeOnboarding
          ? { onboarding_completed_at: new Date().toISOString(), accepted_terms_version: TERMS_VERSION, accepted_terms_at: new Date().toISOString() }
          : {}),
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
      <View style={styles.avatarRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={avatarUrl ? 'Change profile photo' : 'Add a profile photo'}
          onPress={choosePhoto}
          disabled={uploading}
          style={styles.avatarPress}>
          <Avatar uri={avatarUrl} name={displayName || 'You'} size={96} />
          <View style={[styles.cameraBadge, { backgroundColor: theme.ink, borderColor: theme.background }]}>
            <Ionicons name="camera" size={14} color={theme.inkText} />
          </View>
        </Pressable>
        <Text variant="caption" color="textSecondary">
          {uploading ? 'Uploading…' : 'Tap to add a photo'}
        </Text>
      </View>

      <TextField
        label="Full name"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Ethan Parker"
        autoCapitalize="words"
        textContentType="name"
        autoComplete="name"
        error={nameError}
        hint="Riders and drivers see this name."
      />

      <View style={styles.field}>
        <Text variant="label">Campus</Text>
        <View style={[styles.readonly, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
          <Ionicons name="school-outline" size={18} color={theme.textMuted} />
          <Text style={styles.readonlyText}>{campus?.name ?? 'Set from your student email'}</Text>
          <Ionicons name="lock-closed-outline" size={16} color={theme.textMuted} />
        </View>
        <Text variant="caption" color="textSecondary">
          Set from your verified student email.
        </Text>
      </View>

      <TextField
        label="Short bio (optional)"
        value={bio}
        onChangeText={(value) => setBio(value.slice(0, BIO_MAX))}
        placeholder="UNCW junior. Always up for a beach day or a Raleigh trip."
        multiline
        maxLength={BIO_MAX}
        counter={`${bio.length}/${BIO_MAX}`}
      />

      {completeOnboarding ? <ConsentCheckbox checked={consent} onChange={setConsent} error={consentError} /> : null}
      <FormError message={formError} />
      <Button title={submitLabel} variant="accent" onPress={save} loading={saving} disabled={uploading} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.xl },
  avatarRow: { alignItems: 'center', gap: Spacing.sm },
  avatarPress: { position: 'relative' },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: { gap: Spacing.sm },
  readonly: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, minHeight: 52, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.lg },
  readonlyText: { flex: 1 },
});
