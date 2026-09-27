// Turns the raw signal list from the anomaly engine into a short,
// plain-English explanation a non-technical business owner can act on.
// Falls back to a plain concatenation of the signals if no API key is set,
// so the app still works fully without an ANTHROPIC_API_KEY.

export async function explainAlert(
  reasons: string[],
  amount: number,
  merchant: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const fallback = reasons.join(". ") + ".";

  if (!apiKey) return fallback;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: `A transaction of RM${amount.toFixed(2)} at "${merchant}" was flagged with these signals: ${reasons.join(
              "; "
            )}. In 2 short sentences, explain to a small business owner in plain English why this looks suspicious and what they should check. No preamble, no markdown.`,
          },
        ],
      }),
    });

    if (!res.ok) return fallback;

    const data = await res.json();
    const text = data?.content?.find((c: any) => c.type === "text")?.text;
    return typeof text === "string" && text.trim() ? text.trim() : fallback;
  } catch {
    return fallback;
  }
}
