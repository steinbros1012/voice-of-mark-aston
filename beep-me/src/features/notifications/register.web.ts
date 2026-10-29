export type PushStatus = 'granted' | 'denied' | 'undetermined' | 'unsupported';
export async function getPushStatus(): Promise<PushStatus> {
  return 'unsupported';
}
export async function registerForPush(_userId: string): Promise<PushStatus> {
  return 'unsupported';
}
export async function unregisterPush(): Promise<void> {}
export function subscribeToNotificationTaps(_onUrl: (url: string) => void): () => void {
  return () => undefined;
}
