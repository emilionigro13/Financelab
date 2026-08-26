'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPut } from '@/lib/api';
import Link from 'next/link';

interface Alert {
  id: string;
  isTriggered: boolean;
  notifiedAt: string | null;
}

export function AlertBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAlerts = async () => {
    try {
      const res = await apiGet<{ success: boolean; data: Alert[] }>('/alerts');
      const count = res.data.filter((a) => a.isTriggered && !a.notifiedAt).length;
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = async () => {
    if (unreadCount === 0) return;
    try {
      await apiPut('/alerts/read-all', {});
      setUnreadCount(0);
    } catch {
      // silent fail
    }
  };

  return (
    <Link href={'/dashboard' as any} className="relative" onClick={handleClick}>
      <span className="text-sm font-medium hover:underline">Alerts</span>
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {unreadCount}
        </span>
      )}
    </Link>
  );
}