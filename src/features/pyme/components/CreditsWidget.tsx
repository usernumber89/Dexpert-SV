"use client";

import { Sparkles, Plus, CreditCard, Ticket } from "lucide-react";
import Link from "next/link";

type Props = {
  available: number;
  used: number;
};

export function CreditsWidget({ available, used }: Props) {
  const total = available + used;
  const percentage = total > 0 ? (available / total) * 100 : 0;

  return (
    <div className="bg-[#0D3A6E] rounded-xl h-32 p-4">
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-[#38A3F1]" />
          <p className="text-xs font-medium text-[#38A3F1] uppercase tracking-widest">
            Project Credits
          </p>
        </div>
        <Link
          href="/pyme/pricing"
          className="flex items-center gap-1 text-xs font-medium text-white bg-[#38A3F1] px-3 py-1.5 rounded-lg hover:bg-[#0D5FA6] transition"
        >
          <CreditCard className="w-5 h-5" /> Buy more
        </Link>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <span className="text-2xl font-bold text-white">{available}</span>
        <span className="text-[#BAD8F7] text-sm mb-1">credits available</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-[#38A3F1] rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between mb-2">
        <p className="text-[10px] text-[#BAD8F7]">{used} used</p>
        <p className="text-[10px] text-[#BAD8F7]">{total} total purchased</p>
      </div>

      {available === 0 && (
        <div className="mt-3 p-2.5 bg-red-500/10 border border-red-400/20 rounded-lg">
          <p className="text-xs text-red-300">
            No credits left. Buy a plan to publish more projects.
          </p>
        </div>
      )}
    </div>
  );
}