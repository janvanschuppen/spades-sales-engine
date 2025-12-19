import React from "react";
import { AlertTriangle } from "lucide-react";

interface PainPointGridProps {
  painPoints: string[];
}

export default function PainPointGrid({ painPoints }: PainPointGridProps) {
  if (!painPoints || !Array.isArray(painPoints)) return null;

  return (
    <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Market Friction Points</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {painPoints.map((p: string, i: number) => (
          <div
            key={i}
            className="rounded-2xl p-6 backdrop-blur-md border border-red-500/20 shadow-lg relative overflow-hidden group"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.08)" }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <div className="text-red-400 font-bold text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Pain Point
            </div>
            <p className="text-zinc-200 text-sm leading-relaxed font-medium">{p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}