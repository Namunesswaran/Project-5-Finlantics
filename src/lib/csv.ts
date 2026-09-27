// Minimal CSV parser for the transaction upload feature.
// Expected header row: customerId,merchant,amount,location,timestamp

export interface CsvRow {
  customerId: string;
  merchant: string;
  amount: number;
  location: string;
  timestamp: Date;
}

export function parseTransactionsCsv(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const ci = idx("customerid");
  const mi = idx("merchant");
  const ai = idx("amount");
  const li = idx("location");
  const ti = idx("timestamp");

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split(",");
    rows.push({
      customerId: (cols[ci] ?? "").trim(),
      merchant: (cols[mi] ?? "").trim(),
      amount: parseFloat(cols[ai]),
      location: (cols[li] ?? "").trim(),
      timestamp: new Date((cols[ti] ?? "").trim()),
    });
  }
  return rows;
}
