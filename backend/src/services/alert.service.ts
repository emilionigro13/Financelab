import { PrismaClient } from '@prisma/client';
import { getQuote, getCompanyNews } from './finnhub.service.js';
import { analyzeSentimentTrend } from './sentiment.engine.js';

const prisma = new PrismaClient();

export function startAlertPolling() {
  setInterval(async () => {
    try {
      const alerts = await prisma.priceAlert.findMany({
        where: { isActive: true, isTriggered: false },
      });
      if (alerts.length === 0) return;

      const symbolAlerts = new Map<string, typeof alerts>();
      for (const alert of alerts) {
        if (!symbolAlerts.has(alert.symbol)) symbolAlerts.set(alert.symbol, []);
        symbolAlerts.get(alert.symbol)!.push(alert);
      }

      for (const [symbol, alertsForSymbol] of symbolAlerts) {
        try {
          let quoteData: Awaited<ReturnType<typeof getQuote>> | null = null;
          let newsData: Awaited<ReturnType<typeof getCompanyNews>> | null = null;

          const needsQuote = alertsForSymbol.some(a => a.alertType === 'PRICE_TARGET' || a.alertType === 'PERCENT_CHANGE');
          const needsNews = alertsForSymbol.some(a => a.alertType === 'SENTIMENT_TREND');

          if (needsQuote) quoteData = await getQuote(symbol);
          if (needsNews) newsData = await getCompanyNews(symbol);

          for (const alert of alertsForSymbol) {
            let triggered = false;

            if (alert.alertType === 'PRICE_TARGET' && quoteData) {
              const current = quoteData.c;
              const target = Number(alert.targetPrice);
              if (alert.condition === 'ABOVE' && current >= target) triggered = true;
              else if (alert.condition === 'BELOW' && current <= target) triggered = true;
            } else if (alert.alertType === 'PERCENT_CHANGE' && quoteData) {
              const current = quoteData.c;
              const ref = Number(alert.referencePrice);
              const change = ((current - ref) / ref) * 100;
              const threshold = Number(alert.percentChange);
              if (alert.condition === 'PERCENT_UP' && change >= threshold) triggered = true;
              else if (alert.condition === 'PERCENT_DOWN' && change <= -threshold) triggered = true;
            } else if (alert.alertType === 'SENTIMENT_TREND' && newsData) {
              const trend = analyzeSentimentTrend(newsData);
              const lastValid = trend.slice().reverse().find(d => d.sma3 !== undefined);
              if (lastValid && alert.percentChange) {
                const threshold = Number(alert.percentChange) / 100;
                if (lastValid.sma3! < threshold) triggered = true;
              }
            }

            if (triggered) {
              await prisma.priceAlert.update({
                where: { id: alert.id },
                data: { isTriggered: true, triggeredAt: new Date() },
              });
              console.log(`[AlertPoller] Alert ${alert.id} triggered`);
            }
          }
        } catch (err) {
          console.error(`[AlertPoller] Error processing ${symbol}:`, err);
        }
      }
    } catch (err) {
      console.error('[AlertPoller] Polling cycle failed:', err);
    }
  }, 60000);
}