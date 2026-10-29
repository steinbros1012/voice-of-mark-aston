import { findUniversityByEmail } from '@/constants/universities';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return 'Enter your email.';
  if (!EMAIL_RE.test(value)) return 'That does not look like an email address.';
  return null;
}

/** Sign-up requires an address at a supported campus. */
export function validateEduEmail(email: string): string | null {
  const basic = validateEmail(email);
  if (basic) return basic;
  if (!findUniversityByEmail(email)) {
    return 'Use your university .edu email. Beep Me is only open at UNCW right now.';
  }
  return null;
}

export function validateDisplayName(name: string): string | null {
  const value = name.trim();
  if (value.length < 2) return 'Enter a name with at least 2 characters.';
  if (value.length > 40) return 'Keep your name under 40 characters.';
  return null;
}

export function validateOtpCode(code: string): string | null {
  if (!/^\d{6}$/.test(code.trim())) return 'Enter the 6-digit code from the email.';
  return null;
}
