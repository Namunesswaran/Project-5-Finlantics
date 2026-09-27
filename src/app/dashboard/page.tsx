import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import StatCard from "@/components/StatCard";
import RiskChart from "@/components/RiskChart";
import UploadForm from "@/components/UploadForm";

export default async function OverviewPage() {
  const session = await getServerSession(authOptions);
  const orgId = (session?.user as any)?.organizationId as string;

  const transactions = await prisma.transaction.findMany({
    where: { organizationId: orgId },
    select: { riskScore: true },
  });

  const openAlerts = await prisma.alert.count({
    where: { status: "open", transaction: { organizationId: orgId } },
  });

  const total = transactions.length;
  const avgRisk = total
    ? Math.round(
        transactions.reduce((a: number, t: (typeof transactions)[number]) => a + t.riskScore, 0) / total
      )
    : 0;

  const buckets = [
    { bucket: "0-24", count: 0 },
    { bucket: "25-49", count: 0 },
    { bucket: "50-74", count: 0 },
    { bucket: "75-100", count: 0 },
  ];
  for (const t of transactions) {
    if (t.riskScore < 25) buckets[0].count++;
    else if (t.riskScore < 50) buckets[1].count++;
    else if (t.riskScore < 75) buckets[2].count++;
    else buckets[3].count++;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your organization's transaction risk at a glance.
        </p>
      </div>

      <UploadForm />

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Total transactions" value={total} />
        <StatCard label="Open alerts" value={openAlerts} tone={openAlerts > 0 ? "danger" : "default"} />
        <StatCard label="Average risk score" value={avgRisk} tone={avgRisk >= 40 ? "warning" : "default"} />
      </div>

      <RiskChart data={buckets} />
    </div>
  );
}
