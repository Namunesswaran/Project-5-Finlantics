import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import AlertsList from "@/components/AlertsList";

export default async function AlertsPage() {
  const session = await getServerSession(authOptions);
  const orgId = (session?.user as any)?.organizationId as string;

  const alerts = await prisma.alert.findMany({
    where: { transaction: { organizationId: orgId } },
    include: { transaction: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = alerts.map((a: (typeof alerts)[number]) => ({
    ...a,
    transaction: { ...a.transaction, timestamp: a.transaction.timestamp.toISOString() },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
        <p className="text-sm text-gray-500 mt-1">
          Flagged transactions, with the signals and AI-generated explanation behind each score.
        </p>
      </div>
      <AlertsList alerts={rows as any} />
    </div>
  );
}
