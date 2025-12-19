import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface TransitionPageProps {
  onComplete: () => void;
}

export const TransitionPage: React.FC<TransitionPageProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => onComplete(), 3500)
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const items = [
    { label: 'Website Analysis', status: 'done' },
    { label: 'ICP Generation', status: 'done' },
    { label: 'Preparing your dashboard...', status: step >= 2 ? 'loading' : 'pending' }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-white">Initializing Engine</h2>
          <p className="text-zinc-500">Please wait while we configure your environment.</p>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-6">
           
           <div className="flex items-center justify-between opacity-100 transition-opacity">
              <span className="text-white font-medium">Website Analysis</span>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
           </div>

           <div className={`flex items-center justify-between transition-all duration-500 ${step >= 1 ? 'opacity-100 translate-x-0' : 'opacity-50 -translate-x-2'}`}>
              <span className="text-white font-medium">ICP Generation</span>
              {step >= 1 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-zinc-700" />
              )}
           </div>

           <div className={`flex items-center justify-between transition-all duration-500 ${step >= 2 ? 'opacity-100 translate-x-0' : 'opacity-50 -translate-x-2'}`}>
              <span className="text-white font-medium">Preparing Dashboard</span>
              {step >= 2 ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-zinc-700" />
              )}
           </div>

        </div>

        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
           <div 
             className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
             style={{ width: `${(step + 1) * 33}%` }}
           />
        </div>

      </div>
    </div>
  );
};
