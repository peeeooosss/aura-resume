'use client';

import { useState, useEffect, useCallback } from 'react';

export function useCredits() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/credits');
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance ?? 0);
      }
    } catch (err) {
      console.error('Failed to fetch credits:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { balance, loading, refresh };
}
