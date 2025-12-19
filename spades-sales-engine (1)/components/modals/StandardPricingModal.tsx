import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { ContentModal } from '../ContentModal';
import { PricingToggle, PricingFeatureList } from '../pricing/PricingShared';

interface StandardPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: () => void;
}

export const StandardPricingModal: React.FC<StandardPricingModalProps> = ({ isOpen, onClose, onAction }) => {
  const [isRevShare, setIsRevShare] = useState(false);

  return (
    <ContentModal
      isOpen={isOpen}
      onClose={onClose}
      title="Pricing"
      headerImage="/static/branding/pricing-header.jpg"
      intro="Scale seamlessly with engine tiers built for growth."
      actionLabel="Activate Engine"
      onAction={onAction}
    >
      <div className="w-full space-y-3">
        <div className="grid grid-cols-4 gap-2 pb-2 border-b border-white/5 text-center items-end z-20 pt-1 bg-transparent">
            <div className="flex flex-col justify-end h-full">
              <div className="text-left font-bold text-white/40 text-[9px] uppercase tracking-wider pl-1">Tier</div>
            </div>
            <div className="flex flex-col justify-end h-full">
              <div className="font-bold text-white text-sm">Free</div>
              <div className="text-[10px] text-white/50 mt-0.5">$0</div>
            </div>
            <div className="flex flex-col justify-end h-full">
              <div className="font-bold text-blue-400 text-sm">Mid</div>
              <div className="text-[10px] text-blue-400/80 mt-0.5">$1.9k</div>
            </div>
            <div className="flex flex-col justify-end h-full relative">
               <div className="font-bold text-emerald-400 text-sm">Full</div>
               <div className="text-[10px] text-emerald-400/80 mt-0.5">
                  {isRevShare ? "1.9k+" : "2.9k"}
               </div>
            </div>
        </div>

        <div className="py-1">
           <PricingFeatureList fullCheckColorClass="text-emerald-500" />
        </div>

        <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col gap-2 backdrop-blur-md">
           <div className="flex items-center gap-2 text-[10px] text-white/50">
              <Info className="w-3 h-3 text-white/30" />
              <span>Revenue Share reduces upfront cost for a % of closed deals.</span>
           </div>
           <PricingToggle 
             isActive={isRevShare} 
             onToggle={() => setIsRevShare(!isRevShare)} 
             label="Toggle Rev Share"
             activeColorClass="text-emerald-400"
             borderColorClass="border-emerald-500/50"
             bgColorClass="bg-emerald-900/40"
           />
        </div>
      </div>
    </ContentModal>
  );
};