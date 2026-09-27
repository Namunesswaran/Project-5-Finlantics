"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus(null);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/transactions/upload", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setStatus(`Imported ${data.imported} transactions, flagged ${data.flagged}.`);
      router.refresh();
    } else {
      setStatus(data.error ?? "Upload failed.");
    }
  }

  async function handleSeed() {
    setLoading(true);
    setStatus(null);
    const res = await fetch("/api/transactions/seed", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setStatus(`Loaded ${data.created} demo transactions, flagged ${data.flagged}.`);
      router.refresh();
    } else {
      setStatus(data.error ?? "Could not seed demo data.");
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700">Add transaction data</h3>
      <form onSubmit={handleUpload} className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-60"
        >
          Upload CSV
        </button>
        <span className="text-gray-300">or</span>
        <button
          type="button"
          onClick={handleSeed}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          Load demo dataset
        </button>
      </form>
      <p className="mt-2 text-xs text-gray-400">
        CSV columns: customerId, merchant, amount, location, timestamp
      </p>
      {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
    </div>
  );
}
