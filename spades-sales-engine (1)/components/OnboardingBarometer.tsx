import React from 'react';
import { OnboardingState, UserMode } from '../types';
import { Check, Lock, ChevronRight, Circle } from 'lucide-react';

interface OnboardingBarometerProps {
  state: OnboardingState;
  userRole: UserMode;
  userTier?: string; // 'free', 'mid', 'full'
  onAction: (action: string) => void;
}

export const OnboardingBarometer: React.FC<OnboardingBarometerProps> = ({ state, userRole, userTier = 'free', onAction }) => {
  
  const phases = [
    {
      id: 'phase1',
      name: 'System Foundation',
      steps: [
        { id: 'analysis', label: 'Website Analysis', done: state.analysisComplete, locked: false },
        { id: 'icp', label: 'ICP Generation', done: state.icpGenerated, locked: false },
        { id: 'market', label: 'Market Analysis', done: state.marketAnalysisComplete, locked: userTier === 'free' },
      ]
    },
    {
      id: 'phase2',
      name: 'User Contribution',
      steps: [
        { id: 'profile', label: 'User Profile', done: state.profileCompleted, locked: false, action: 'profile' },
        { id: 'docs', label: 'Training Docs', done: state.docsUploaded, locked: false, action: 'docs' },
        { id: 'qa', label: 'Onboarding Q&A', done: state.qaCompleted, locked: false, action: 'qa' },
      ]
    },
    {
      id: 'phase3',
      name: 'Commitment',
      steps: [
        { id: 'video', label: 'Watch Video', done: state.videoWatched, locked: false, action: 'video' },
        { id: 'upgrade', label: 'Upgrade Plan', done: userTier !== 'free', locked: false, action: 'upgrade' },
        { id: 'support', label: 'Book Support', done: state.supportCallBooked, locked: userTier === 'free', action: 'support' },
      ]
    }
  ];

  // Calculate overall progress
  const totalSteps = phases.reduce((acc, p) => acc + p.steps.length, 0);
  const completedSteps = phases.reduce((acc, p) => acc + p.steps.filter(s => s.done).length, 0);
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 mb-10 shadow-sm dark:shadow-none transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Setup Progress</h3>
          <p className="text-sm text-zinc-400 mt-1">Complete these steps to optimize your engine.</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-zinc-900 dark:text-white">{progressPercent}%</div>
          <div className="w-48 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-3">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {phases.map((phase) => (
          <div key={phase.id} className="space-y-4">
             <div className="text-sm font-bold text-zinc-700 dark:text-zinc-500 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">
               {phase.name}
             </div>
             {phase.steps.map((step) => (
               <button
                 key={step.id}
                 disabled={step.locked || step.done}
                 onClick={() => step.action && onAction(step.action)}
                 className={`w-full flex items-center justify-between p-3.5 rounded-xl text-base border transition-all
                    ${step.done 
                        ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400 cursor-default' 
                        : step.locked 
                            ? 'bg-zinc-50 dark:bg-zinc-900/50 border-transparent text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white'
                    }
                 `}
               >
                 <div className="flex items-center gap-4">
                   {step.done ? (
                     <Check className="w-5 h-5" />
                   ) : step.locked ? (
                     <Lock className="w-4 h-4" />
                   ) : (
                     <div className="w-4 h-4 rounded-full border-2 border-zinc-400 dark:border-zinc-500"></div>
                   )}
                   <span className="font-semibold">{step.label}</span>
                 </div>
                 {!step.done && !step.locked && step.action && (
                   <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                 )}
               </button>
             ))}
          </div>
        ))}
      </div>
    </div>
  );
};