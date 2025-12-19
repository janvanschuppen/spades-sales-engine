import React from "react";

interface PersonaCardProps {
  persona: any;
  primaryColor?: string;
}

export default function PersonaCard({ persona, primaryColor = "#3b82f6" }: PersonaCardProps) {
  if (!persona) return null;

  return (
    <div
      className="rounded-2xl p-6 md:p-8 bg-white shadow-sm border animate-slide-up"
      style={{ borderColor: primaryColor }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{persona.role || "Target Role"}</h2>
          {persona.seniority && (
            <span className="inline-block mt-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-gray-100 text-gray-600">
              {persona.seniority}
            </span>
          )}
        </div>
        <div className="hidden md:block">
           <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ideal Fit</div>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Key Performance Indicators</h3>
        <p className="text-sm text-gray-600 leading-relaxed font-medium">
          Strategic mapping indicates this persona is the primary decision maker for sales infrastructure transformation.
        </p>
      </div>
    </div>
  );
}