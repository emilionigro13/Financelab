import { PrismaClient } from '@prisma/client';
import { getQuote } from './finnhub.service.js';

const prisma = new PrismaClient();

const POLL_INTERVAL_MS = 60000;

export function startAlertPolling() {
  setInterval(async () => {
    try {
      const alerts = await prisma.priceAlert.findMany({
        where: { isActive: true, isTriggered: false },
      });

      if (alerts.length === 0) return;

      const symbols = [...new Set(alerts.map((a) => a.symbol))];

      for (const symbol of symbols) {
        try {
          const quote = await getQuote(symbol);
          const currentPrice = quote.c;

          const symbolAlerts = alerts.filter((a) => a.symbol === symbol);

          for (const alert of symbolAlerts) {
            let triggered = false;

            if (alert.alertType === 'PRICE_TARGET' && alert.targetPrice) {
              if (alert.condition === 'ABOVE' && currentPrice >= Number(alert.targetPrice)) {
                triggered = true;
              } else if (alert.condition === 'BELOW' && currentPrice <= Number(alert.targetPrice)) {
                triggered = true;
              }
            } else if (alert.alertType === 'PERCENT_CHANGE' && alert.referencePrice && alert.percentChange) {
              const changePercent = ((currentPrice - Number(alert.referencePrice)) / Number(alert.referencePrice)) * 100;
              if (alert.condition === 'PERCENT_UP' && changePercent >= Number(alert.percentChange)) {
                triggered = true;
              } else if (alert.condition === 'PERCENT_DOWN' && changePercent <= -Number(alert.percentChange)) {
                triggered = true;
              }
            }

            if (triggered) {
              await prisma.priceAlert.update({
                where: { id: alert.id },
                data: { isTriggered: true, triggeredAt: new Date() },
              });
              console.log(`[AlertPoller] TRIGGERED: ${alert.symbol} ${alert.condition} for user ${alert.userId}`);
            }
          }
        } catch (err) {
          console.error(`[AlertPoller] Error checking ${symbol}:`, err);
        }
      }
    } catch (err) {
      console.error('[AlertPoller] Error fetching alerts:', err);
    }
  }, POLL_INTERVAL_MS);

  console.log(`[AlertPoller] Started. Interval: ${POLL_INTERVAL_MS}ms`);
}