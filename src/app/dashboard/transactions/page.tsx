import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import TransactionsTable from "@/components/TransactionsTable";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  const orgId = (session?.user as any)?.organizationId as string;

  const transactions = await prisma.transaction.findMany({
    where: { organizationId: orgId },
    include: { alert: { select: { status: true } } },
    orderBy: { timestamp: "desc" },
    take: 200,
  });

  const rows = transactions.map((t: (typeof transactions)[number]) => ({
    ...t,
    timestamp: t.timestamp.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-500 mt-1">Most recent 200 transactions, newest first.</p>
      </div>
      <TransactionsTable transactions={rows as any} />
    </div>
  );
}
