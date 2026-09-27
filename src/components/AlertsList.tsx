"use client";

import { useState } from "react";

interface AlertRow {
  id: string;
  riskScore: number;
  reasons: string[];
  explanation: string | null;
  status: string;
  transaction: {
    customerId: string;
    merchant: string;
    amount: number;
    location: string;
    timestamp: string;
  };
}

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  reviewed: "Reviewed",
  false_positive: "False positive",
  escalated: "Escalated",
};

const STATUS_TONE: Record<string, string> = {
  open: "bg-red-50 text-red-700",
  reviewed: "bg-blue-50 text-blue-700",
  false_positive: "bg-gray-100 text-gray-600",
  escalated: "bg-purple-50 text-purple-700",
};

export default function AlertsList({ alerts }: { alerts: AlertRow[] }) {
  const [items, setItems] = useState(alerts);
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    const res = await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    }
    setUpdating(null);
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-sm text-gray-500">
        No alerts yet. Flagged transactions will show up here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((a) => (
        <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900">
                {a.transaction.customerId} - RM{a.transaction.amount.toFixed(2)} at{" "}
                {a.transaction.merchant}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {a.transaction.location} - {new Date(a.transaction.timestamp).toLocaleString()}
              </p>
            </div>
            <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium ${STATUS_TONE[a.status]}`}>
              {STATUS_LABEL[a.status]}
            </span>
          </div>

          <p className="mt-3 text-sm text-gray-700">{a.explanation}</p>

          <ul className="mt-2 text-xs text-gray-500 list-disc list-inside space-y-0.5">
            {a.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <div className="mt-4 flex gap-2">
            {["reviewed", "false_positive", "escalated"].map((s) => (
              <button
                key={s}
                disabled={updating === a.id || a.status === s}
                onClick={() => updateStatus(a.id, s)}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                Mark {STATUS_LABEL[s].toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
