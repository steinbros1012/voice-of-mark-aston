export type PushStatus = 'granted' | 'denied' | 'undetermined' | 'unsupported';
export function getPushStatus(): Promise<PushStatus>;
export function registerForPush(userId: string): Promise<PushStatus>;
export function unregisterPush(): Promise<void>;
export function subscribeToNotificationTaps(onUrl: (url: string) => void): () => void;
