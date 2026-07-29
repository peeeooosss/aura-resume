import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getSessionUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id ?? null;
}

export async function requireSessionUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}
