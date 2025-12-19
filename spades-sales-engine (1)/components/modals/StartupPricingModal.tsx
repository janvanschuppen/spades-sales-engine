import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { ContentModal } from '../ContentModal';
import { PricingToggle, PricingFeatureList } from '../pricing/PricingShared';

interface StartupPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StartupPricingModal: React.FC<StartupPricingModalProps> = ({ isOpen, onClose }) => {
  const [isEquity, setIsEquity] = useState(false);

  return (
    <ContentModal
      isOpen={isOpen}
      onClose={onClose}
      title="Startup Pricing"
      headerImage="/static/branding/startup-header.jpg"
      intro="Exclusive rates for qualified startups. We invest in you."
      actionLabel="Apply"
      onAction={() => window.open('https://revenue-intake.scoreapp.com', '_blank')}
    >
      <div className="w-full space-y-3">
        <div className="grid grid-cols-4 gap-2 pb-2 border-b border-white/5 text-center items-end z-20 pt-1 bg-transparent">
            <div className="flex flex-col justify-end h-full text-left">
              <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider pl-1">Tier</div>
            </div>
            <div className="flex flex-col justify-end h-full">
              <div className="font-bold text-white text-sm">Free</div>
              <div className="text-[10px] text-white/50 mt-0.5">$0</div>
            </div>
            <div className="flex flex-col justify-end h-full">
              <div className="font-bold text-blue-400 text-sm">Mid</div>
              <div className="text-[10px] text-blue-400/60 mt-0.5">$1.9k</div>
            </div>
            <div className="flex flex-col justify-end h-full relative">
               <div className="font-bold text-orange-400 text-sm">Full</div>
               <div className="text-[10px] text-orange-400/60 mt-0.5">
                  {isEquity ? "900+" : "2.9k"}
               </div>
            </div>
        </div>

        <div className="py-1">
          <PricingFeatureList fullCheckColorClass="text-orange-500" />
        </div>
        
         <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-2 backdrop-blur-md">
           <div className="flex items-center gap-2 text-[10px] text-white/50">
             <Info className="w-3 h-3 text-white/30" />
             <span>Equity options available for high-potential applicants.</span>
           </div>
           <PricingToggle 
             isActive={isEquity} 
             onToggle={() => setIsEquity(!isEquity)} 
             label="Toggle Equity"
             activeColorClass="text-orange-400"
             borderColorClass="border-orange-500/50"
             bgColorClass="bg-orange-900/40"
           />
        </div>
      </div>
    </ContentModal>
  );
};