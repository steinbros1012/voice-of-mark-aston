/** Human-friendly date and time formatting for ride departures. */

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** "Today", "Tomorrow", "Fri, Nov 7" */
export function formatDepartureDay(iso: string | Date, now = new Date()): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  const diffDays = Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / DAY_MS);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

/** "5:30 PM" */
export function formatTime(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** "Today at 5:30 PM" */
export function formatDeparture(iso: string | Date, now = new Date()): string {
  return `${formatDepartureDay(iso, now)} at ${formatTime(iso)}`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
