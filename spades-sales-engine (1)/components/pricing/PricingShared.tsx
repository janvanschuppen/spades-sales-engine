import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { pricingFeatures } from '../data/pricingData';

// --- Shared Toggle Component ---
interface PricingToggleProps {
  isActive: boolean;
  onToggle: () => void;
  label: string;
  activeColorClass: string; // e.g., 'text-emerald-400'
  borderColorClass: string; // e.g., 'border-emerald-500/50'
  bgColorClass: string;     // e.g., 'bg-emerald-900/80'
}

export const PricingToggle: React.FC<PricingToggleProps> = ({
  isActive,
  onToggle,
  label,
  activeColorClass,
  borderColorClass,
  bgColorClass
}) => {
  return (
    <div className="h-10 mt-1 w-full flex items-center justify-center">
      <div 
        onClick={onToggle}
        className="flex items-center justify-center gap-2 cursor-pointer group"
        title={`Toggle ${label}`}
      >
         <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 ${isActive ? `${bgColorClass} ${borderColorClass}` : 'bg-white/10 border border-white/10'}`}>
             <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
         </div>
         <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isActive ? activeColorClass : 'text-white/40 group-hover:text-white/70'}`}>
           {label}
         </span>
      </div>
    </div>
  );
};

// --- Shared Feature List Component ---
interface PricingFeatureListProps {
  fullCheckColorClass: string; // e.g., 'text-emerald-500'
}

export const PricingFeatureList: React.FC<PricingFeatureListProps> = ({ fullCheckColorClass }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) ? prev.filter(s => s !== sectionId) : [...prev, sectionId]
    );
  };

  return (
    <div className="divide-y divide-white/5">
      {pricingFeatures.map((section) => {
        const isExpanded = expandedSections.includes(section.id);
        return (
          <div key={section.id} className="py-1">
            <button 
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between py-3 px-3 text-left hover:bg-white/5 rounded-lg transition-colors group"
            >
              <span className="text-xs font-bold text-white/60 uppercase tracking-widest group-hover:text-white transition-colors">
                {section.title}
              </span>
              {isExpanded ? 
                <ChevronUp className="w-4 h-4 text-white/30" /> : 
                <ChevronDown className="w-4 h-4 text-white/30" />
              }
            </button>

            {isExpanded && (
              <div className="animate-slide-up space-y-1 mb-2 px-1">
                {section.items.map((row, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 items-center text-center py-2 hover:bg-white/5 transition-colors rounded">
                      <div className="text-left font-medium text-white/70 pl-3 text-xs">{row.name}</div>
                      <div className="flex justify-center">{row.free && <Check className="w-4 h-4 text-white/20" />}</div>
                      <div className="flex justify-center">{row.mid && <Check className="w-4 h-4 text-blue-400" />}</div>
                      <div className="flex justify-center">{row.full && <Check className={`w-4 h-4 ${fullCheckColorClass}`} />}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};