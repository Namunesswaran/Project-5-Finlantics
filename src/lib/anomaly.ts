// Core fraud-scoring engine.
//
// Deliberately statistical rather than a black-box ML model: every flagged
// transaction comes with a human-readable list of the signals that tripped,
// which is what lets ai-explain.ts turn it into a plain-English reason.
// The IQR/"adjusted boxplot" outlier check mirrors the anomaly detection
// approach from TEB2164 (Intro to Data Science).

export interface TxInput {
  customerId: string;
  merchant: string;
  amount: number;
  location: string;
  timestamp: Date;
}

export interface HistoryTx {
  amount: number;
  location: string;
  timestamp: Date;
}

export interface ScoreResult {
  score: number; // 0-100
  reasons: string[];
}

function mean(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function stdDev(arr: number[], m: number) {
  if (!arr.length) return 0;
  return Math.sqrt(mean(arr.map((v) => (v - m) ** 2)));
}

function quartile(sorted: number[], q: number) {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

export function scoreTransaction(tx: TxInput, history: HistoryTx[]): ScoreResult {
  const reasons: string[] = [];
  let score = 0;

  const amounts = history.map((h) => h.amount);

  if (amounts.length >= 4) {
    const sorted = [...amounts].sort((a, b) => a - b);
    const q1 = quartile(sorted, 0.25);
    const q3 = quartile(sorted, 0.75);
    const iqr = q3 - q1;
    const upperFence = q3 + 1.5 * iqr;
    const outerFence = q3 + 3 * iqr;

    if (tx.amount > outerFence) {
      score += 45;
      reasons.push(
        `Amount RM${tx.amount.toFixed(2)} is far above this customer's normal range (typical ceiling ~RM${outerFence.toFixed(2)})`
      );
    } else if (tx.amount > upperFence) {
      score += 25;
      reasons.push(
        `Amount RM${tx.amount.toFixed(2)} exceeds this customer's usual upper range (~RM${upperFence.toFixed(2)})`
      );
    }
  } else if (amounts.length > 0) {
    const m = mean(amounts);
    const sd = stdDev(amounts, m) || 1;
    const z = (tx.amount - m) / sd;
    if (Math.abs(z) > 3) {
      score += 40;
      reasons.push(`Amount is ${z.toFixed(1)} standard deviations from this customer's average`);
    } else if (Math.abs(z) > 2) {
      score += 20;
      reasons.push(`Amount is ${z.toFixed(1)} standard deviations from this customer's average`);
    }
  } else if (tx.amount > 1000) {
    score += 15;
    reasons.push("First recorded transaction for this customer is unusually large");
  }

  const hour = tx.timestamp.getHours();
  if (hour >= 0 && hour < 5) {
    score += 15;
    reasons.push(`Transaction occurred at ${hour}:00, an unusual hour for this account`);
  }

  const knownLocations = new Set(history.map((h) => h.location));
  if (knownLocations.size > 0 && !knownLocations.has(tx.location)) {
    score += 15;
    reasons.push(`Location "${tx.location}" has not been seen before for this customer`);
  }

  const oneHourBefore = new Date(tx.timestamp.getTime() - 60 * 60 * 1000);
  const recentCount = history.filter(
    (h) => h.timestamp >= oneHourBefore && h.timestamp <= tx.timestamp
  ).length;
  if (recentCount >= 3) {
    score += 20;
    reasons.push(`${recentCount} other transactions from this customer within the past hour`);
  }

  score = Math.min(100, Math.round(score));
  if (reasons.length === 0) reasons.push("No unusual signals detected");

  return { score, reasons };
}

export const ALERT_THRESHOLD = 50;
