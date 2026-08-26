'use client';

import { useState } from 'react';
import { apiPost } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface AlertFormProps {
  symbol: string;
  companyName: string;
  currentPrice: number;
  onSuccess?: () => void;
}

export function AlertForm({ symbol, companyName, currentPrice, onSuccess }: AlertFormProps) {
  const [alertType, setAlertType] = useState<'PRICE_TARGET' | 'PERCENT_CHANGE'>('PRICE_TARGET');
  const [condition, setCondition] = useState('ABOVE');
  const [targetPrice, setTargetPrice] = useState('');
  const [percentChange, setPercentChange] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: Record<string, unknown> = {
      symbol,
      companyName,
      alertType,
      condition,
    };

    if (alertType === 'PRICE_TARGET') {
      const price = parseFloat(targetPrice);
      if (isNaN(price) || price <= 0) {
        alert('Enter a valid target price');
        setLoading(false);
        return;
      }
      payload.targetPrice = price;
    } else {
      const pct = parseFloat(percentChange);
      if (isNaN(pct) || pct <= 0) {
        alert('Enter a valid percentage');
        setLoading(false);
        return;
      }
      payload.referencePrice = currentPrice;
      payload.percentChange = pct;
    }

    try {
      await apiPost('/alerts', payload);
      setTargetPrice('');
      setPercentChange('');
      if (onSuccess) onSuccess();
      alert('Alert created successfully');
    } catch (err) {
      alert('Failed to create alert: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Current price: ${currentPrice.toFixed(2)}</p>
      </div>

      <div>
        <label className="text-sm font-medium">Alert Type</label>
        <select
          value={alertType}
          onChange={(e) => {
            setAlertType(e.target.value as 'PRICE_TARGET' | 'PERCENT_CHANGE');
            setCondition(e.target.value === 'PRICE_TARGET' ? 'ABOVE' : 'PERCENT_UP');
          }}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="PRICE_TARGET">Price Target</option>
          <option value="PERCENT_CHANGE">Percent Change</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Condition</label>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          {alertType === 'PRICE_TARGET' ? (
            <>
              <option value="ABOVE">Price goes above</option>
              <option value="BELOW">Price goes below</option>
            </>
          ) : (
            <>
              <option value="PERCENT_UP">Goes up by</option>
              <option value="PERCENT_DOWN">Goes down by</option>
            </>
          )}
        </select>
      </div>

      {alertType === 'PRICE_TARGET' ? (
        <div>
          <label className="text-sm font-medium">Target Price</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="0.00"
          />
        </div>
      ) : (
        <div>
          <label className="text-sm font-medium">Percentage (%)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={percentChange}
            onChange={(e) => setPercentChange(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="e.g. 5.00"
          />
          <p className="text-xs text-muted-foreground mt-1">Reference: ${currentPrice.toFixed(2)}</p>
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Alert'}
      </Button>
    </form>
  );
}