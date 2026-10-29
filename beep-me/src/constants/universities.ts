/**
 * Supported campuses. Each university is its own marketplace. The `domains`
 * list is what .edu verification checks a sign-up email against.
 * Launch campus: UNCW. Add a row here (and in the universities table in
 * Phase 2) to open a new campus.
 */
export type University = {
  /** Stable key stored on profiles.university. */
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  domains: readonly string[];
};

export const UNIVERSITIES: readonly University[] = [
  {
    id: 'uncw',
    name: 'University of North Carolina Wilmington',
    shortName: 'UNCW',
    city: 'Wilmington',
    state: 'NC',
    domains: ['uncw.edu'],
  },
] as const;

export const DEFAULT_UNIVERSITY_ID = 'uncw';

export function findUniversityByEmail(email: string): University | undefined {
  const domain = email.trim().toLowerCase().split('@')[1];
  if (!domain) return undefined;
  return UNIVERSITIES.find((u) =>
    u.domains.some((d) => domain === d || domain.endsWith(`.${d}`)),
  );
}
