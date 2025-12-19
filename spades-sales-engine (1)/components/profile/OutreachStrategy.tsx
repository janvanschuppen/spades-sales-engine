import React from "react";
import { Quote, Send } from "lucide-react";

interface OutreachStrategyProps {
  outreach: any;
  primaryColor?: string;
}

export default function OutreachStrategy({ outreach, primaryColor = "#3b82f6" }: OutreachStrategyProps) {
  if (!outreach) return null;

  const { hook, subjectLine } = outreach;

  return (
    <div
      className="rounded-2xl p-6 md:p-10 backdrop-blur-md border shadow-2xl relative overflow-hidden animate-slide-up"
      style={{ 
        backgroundColor: `${primaryColor}08`, 
        borderColor: `${primaryColor}20`,
        animationDelay: '0.2s'
      }}
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ backgroundColor: primaryColor }} />
      
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <Send className="w-5 h-5" style={{ color: primaryColor }} />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">Strategic Messaging</h3>
      </div>

      <div className="relative mb-10">
        <Quote className="absolute -top-4 -left-6 w-12 h-12 opacity-5" style={{ color: primaryColor }} />
        <blockquote className="text-xl md:text-2xl italic text-white/90 leading-relaxed font-light pl-4 border-l-2" style={{ borderColor: `${primaryColor}40` }}>
          “{hook}”
        </blockquote>
      </div>

      <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/5 shadow-inner">
        <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 mb-2">Subject Line Idea</div>
        <div className="text-white font-medium tracking-tight md:text-lg">{subjectLine}</div>
      </div>
    </div>
  );
}