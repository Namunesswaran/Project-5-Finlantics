"use client";

interface Row {
  id: string;
  customerId: string;
  merchant: string;
  amount: number;
  location: string;
  timestamp: string;
  riskScore: number;
  alert: { status: string } | null;
}

function riskBadge(score: number) {
  if (score >= 50) return "bg-red-50 text-red-700";
  if (score >= 25) return "bg-amber-50 text-amber-700";
  return "bg-gray-100 text-gray-600";
}

export default function TransactionsTable({ transactions }: { transactions: Row[] }) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-sm text-gray-500">
        No transactions yet. Upload a CSV or load the demo dataset from the Overview page.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Merchant</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Location</th>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Risk</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-t border-gray-50">
              <td className="px-4 py-3">{t.customerId}</td>
              <td className="px-4 py-3">{t.merchant}</td>
              <td className="px-4 py-3">RM{t.amount.toFixed(2)}</td>
              <td className="px-4 py-3">{t.location}</td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(t.timestamp).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskBadge(t.riskScore)}`}>
                  {t.riskScore}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
