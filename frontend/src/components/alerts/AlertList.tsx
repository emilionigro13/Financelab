'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiDelete, apiPut, apiPost } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface Alert {
  id: string;
  symbol: string;
  companyName: string;
  alertType: string;
  targetPrice: number | null;
  referencePrice: number | null;
  percentChange: number | null;
  condition: string;
  isTriggered: boolean;
  triggeredAt: string | null;
  notifiedAt: string | null;
  createdAt: string;
}

export function AlertList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await apiGet<{ success: boolean; data: Alert[] }>('/alerts');
      setAlerts(res.data);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this alert?')) return;
    try {
      await apiDelete(`/alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert('Failed to delete alert: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleSimulate = async (id: string) => {
    try {
      await apiPost(`/alerts/${id}/simulate`, {});
      fetchAlerts();
    } catch (err) {
      alert('Failed to simulate: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await apiPut(`/alerts/${id}/reactivate`, {});
      fetchAlerts();
    } catch (err) {
      alert('Failed to reactivate: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading alerts...</div>;
  }

  if (alerts.length === 0) {
    return <p className="text-muted-foreground">No alerts set.</p>;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{alert.symbol}</span>
              {alert.isTriggered && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  alert.notifiedAt
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {alert.notifiedAt ? 'Triggered' : 'Triggered · NEW'}
                </span>
              )}
              {!alert.isTriggered && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {alert.alertType === 'PRICE_TARGET' && alert.targetPrice
                ? `${alert.condition === 'ABOVE' ? 'Above' : 'Below'} $${Number(alert.targetPrice).toFixed(2)}`
                : alert.alertType === 'PERCENT_CHANGE' && alert.percentChange
                ? `${alert.condition === 'PERCENT_UP' ? 'Up' : 'Down'} ${Number(alert.percentChange).toFixed(2)}% (ref: $${Number(alert.referencePrice).toFixed(2)})`
                : alert.condition}
            </p>
            {alert.triggeredAt && (
              <p className="text-xs text-muted-foreground">
                Triggered at {new Date(alert.triggeredAt).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!alert.isTriggered && (
              <Button variant="outline" size="sm" onClick={() => handleSimulate(alert.id)}>
                Test
              </Button>
            )}
            {alert.isTriggered && (
              <Button variant="outline" size="sm" onClick={() => handleReactivate(alert.id)}>
                Reactivate
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => handleDelete(alert.id)}>
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}