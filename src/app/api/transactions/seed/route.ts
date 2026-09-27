import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scoreTransaction, ALERT_THRESHOLD, HistoryTx } from "@/lib/anomaly";
import { explainAlert } from "@/lib/ai-explain";

// Generates a realistic synthetic transaction history per demo customer,
// with a planted anomaly at the end of most customers' histories - so a
// "Load demo dataset" click reliably produces flagged transactions for
// a live demo, without needing real bank data.
export async function POST() {
  const session = await getServerSession(authOptions);
  const orgId = (session?.user as any)?.organizationId;
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const merchants = ["Lazada Store", "Shopee Mart", "Grab Pay", "Local Cafe", "Electronics Hub"];
  const locations = ["Kuala Lumpur", "Penang", "Johor Bahru", "Ipoh", "Sitiawan"];
  const customers = Array.from({ length: 10 }, (_, i) => `CUST-${1000 + i}`);

  const now = Date.now();
  let flagged = 0;
  let created = 0;

  for (const customerId of customers) {
    const homeLocation = locations[Math.floor(Math.random() * locations.length)];
    const baseAmount = 30 + Math.random() * 120;
    const txCount = 14 + Math.floor(Math.random() * 8);
    const history: HistoryTx[] = [];

    for (let i = 0; i < txCount; i++) {
      const isPlanted = i === txCount - 1 && Math.random() < 0.65;
      const timestamp = new Date(now - (txCount - i) * 3 * 60 * 60 * 1000);
      const amount = isPlanted
        ? baseAmount * (6 + Math.random() * 6)
        : baseAmount * (0.7 + Math.random() * 0.6);
      const location = isPlanted && Math.random() < 0.5 ? "Overseas" : homeLocation;
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];

      const { score, reasons } = scoreTransaction(
        { customerId, merchant, amount, location, timestamp },
        history
      );

      const tx = await prisma.transaction.create({
        data: { organizationId: orgId, customerId, merchant, amount, location, timestamp, riskScore: score },
      });
      created++;

      if (score >= ALERT_THRESHOLD) {
        flagged++;
        const explanation = await explainAlert(reasons, amount, merchant);
        await prisma.alert.create({
          data: { transactionId: tx.id, riskScore: score, reasons, explanation, status: "open" },
        });
      }

      history.push({ amount, location, timestamp });
    }
  }

  return NextResponse.json({ created, flagged });
}
