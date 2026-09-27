import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseTransactionsCsv } from "@/lib/csv";
import { scoreTransaction, ALERT_THRESHOLD } from "@/lib/anomaly";
import { explainAlert } from "@/lib/ai-explain";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const orgId = (session?.user as any)?.organizationId;
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const text = await file.text();
  const rows = parseTransactionsCsv(text);

  let imported = 0;
  let flagged = 0;

  for (const row of rows) {
    if (!row.customerId || Number.isNaN(row.amount) || Number.isNaN(row.timestamp.getTime())) {
      continue;
    }

    const history = await prisma.transaction.findMany({
      where: { organizationId: orgId, customerId: row.customerId, timestamp: { lt: row.timestamp } },
      select: { amount: true, location: true, timestamp: true },
    });

    const { score, reasons } = scoreTransaction(row, history);

    const tx = await prisma.transaction.create({
      data: {
        organizationId: orgId,
        customerId: row.customerId,
        merchant: row.merchant,
        amount: row.amount,
        location: row.location,
        timestamp: row.timestamp,
        riskScore: score,
      },
    });
    imported++;

    if (score >= ALERT_THRESHOLD) {
      flagged++;
      const explanation = await explainAlert(reasons, row.amount, row.merchant);
      await prisma.alert.create({
        data: { transactionId: tx.id, riskScore: score, reasons, explanation, status: "open" },
      });
    }
  }

  return NextResponse.json({ imported, flagged });
}
