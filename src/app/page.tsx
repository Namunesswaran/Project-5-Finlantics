import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <span className="text-xl font-bold text-brand-700">FraudLens</span>
        <nav className="flex gap-4 text-sm">
          <Link href="/login" className="px-4 py-2 rounded-lg hover:bg-white/60">
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="max-w-4xl mx-auto text-center px-6 pt-16 pb-20">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          Fraud detection your small business can actually afford.
        </h1>
        <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your transactions and FraudLens scores every one for risk, then explains{" "}
          <em>why</em> in plain English - no data science team required.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600"
          >
            Start free
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg border border-gray-300 font-medium hover:bg-white"
          >
            I already have an account
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 px-6 pb-24">
        {[
          {
            title: "Explainable risk scores",
            body: "Every flagged transaction lists exactly which signals triggered it - unusual amount, new location, odd hour, or transaction velocity.",
          },
          {
            title: "Plain-English alerts",
            body: "An AI layer turns the statistical signals into a short explanation any business owner can act on immediately.",
          },
          {
            title: "Built for your workflow",
            body: "Upload a CSV, review flagged transactions, and mark each as reviewed, false positive, or escalated.",
          },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900">{f.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
