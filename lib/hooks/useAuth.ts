'use client';

import { useSession } from 'next-auth/react';

interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string | null;
  onboarded?: boolean;
}

export function useAuth() {
  const { data: session, status, update } = useSession();
  const user = session?.user as AuthUser | undefined;

  return {
    user: user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      username: user.username,
      onboarded: user.onboarded,
    } : null,
    loading: status === 'loading',
    authenticated: status === 'authenticated',
    updateUser: update,
  };
}
