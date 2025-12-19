import React, { useState } from 'react';
import { Button } from './ui/Button';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { CompanyHeader } from './profile/CompanyHeader';
import PersonaCard from './profile/PersonaCard';
import PainPointGrid from './profile/PainPointGrid';
import OutreachStrategy from './profile/OutreachStrategy';

interface CompanyProfilePageProps {
  data: any;
  onContinue?: () => void;
}

export const CompanyProfilePage: React.FC<CompanyProfilePageProps> = ({ data, onContinue }) => {
  if (!data) {
    console.error("❌ ICP PAGE RECEIVED NO DATA:", data);
    return <div className="p-20 text-white">No ICP data available.</div>;
  }

  const persona = data.icp?.persona || data.idealCustomerProfile?.persona;
  const painPoints = data.icp?.painPoints || data.idealCustomerProfile?.painPoints;
  const primaryColor = data?.primaryColor || '#6C47FF';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (data.outreach?.hook) {
      navigator.clipboard.writeText(data.outreach.hook);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="animate-fade-page min-h-screen bg-zinc-950 text-white overflow-x-hidden flex flex-col selection:bg-white selection:text-black">
      <div className="max-w-5xl mx-auto w-full p-6 md:p-8 space-y-12">
        
        {/* Company Header */}
        <div>
           <CompanyHeader data={data} />
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 pb-12 border-b border-white/5 relative z-10">
           <div className="max-w-xl">
              <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">Positioning</h2>
              <p className="text-xl md:text-2xl text-white font-light italic leading-relaxed">
                "{data.valueProp}"
              </p>
           </div>
           <div className="shrink-0 pt-2">
              <Button 
                onClick={onContinue} 
                disabled={!onContinue}
                size="lg" 
                className="rounded-2xl px-10 py-7 font-bold text-sm shadow-2xl transition-all hover:scale-[1.02] active:scale-95 border-0" 
                style={{ backgroundColor: primaryColor, color: '#fff' }}
              >
                Build Outreach Engine <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
           </div>
        </div>

        {/* ICP Insight Content */}
        <div className="space-y-16 pb-24 relative z-10">
           {/* Persona */}
           <div>
             <PersonaCard persona={persona} primaryColor={primaryColor} />
           </div>

           {/* Pain Points */}
           <div>
             <PainPointGrid painPoints={painPoints} />
           </div>

           {/* Outreach */}
           <div>
             <OutreachStrategy outreach={data.outreach} primaryColor={primaryColor} />
           </div>

           <div className="pt-8 flex flex-col items-center gap-4">
              <div className="h-px w-20 bg-zinc-800" />
              <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-[0.4em]">
                 Proprietary Analysis • AI Generated
              </p>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
              >
                {copied ? <><Check className="w-3 h-3 text-green-500" /> Insight Saved</> : <><Copy className="w-3 h-3" /> Export Insight</>}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};