"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/alerts", label: "Alerts" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <span className="text-lg font-bold text-brand-700">FraudLens</span>
          <nav className="flex gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  pathname === l.href
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
