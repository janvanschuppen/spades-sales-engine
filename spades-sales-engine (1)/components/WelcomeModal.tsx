import React, { useEffect } from 'react';
import { X, PlayCircle, UserCircle, Target, Package } from 'lucide-react';
import { Button } from './ui/Button';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: 'profile' | 'product' | 'icp') => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onAction }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white/5 backdrop-blur-xl backdrop-brightness-50 border border-white/10 rounded-2xl shadow-2xl overflow-visible animate-slide-up flex flex-col before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-blue-500/20 before:to-purple-500/20 before:blur-xl before:opacity-40 before:-z-10">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-20 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight">Welcome to the Engine.</h2>
            <p className="text-sm text-white/70 leading-relaxed font-light">
              Your system foundation has been generated and is ready to be configured.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
              {[
                { id: 'profile', icon: UserCircle, title: 'Profile', text: 'Account settings.' },
                { id: 'product', icon: Package, title: 'Product', text: 'Review offer structure.' },
                { id: 'icp', icon: Target, title: 'ICP', text: 'Define target audience.' }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => onAction(item.id as any)}
                  className="flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left group backdrop-blur-md"
                >
                  <div className="p-2 rounded-lg bg-black/20 border border-white/5 text-white/40 group-hover:text-blue-400 transition-colors">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{item.title}</h4>
                    <p className="text-[11px] text-white/50 leading-tight">{item.text}</p>
                  </div>
                </button>
              ))}
          </div>
           
          <div className="flex justify-between items-center pt-2">
             <button className="flex items-center gap-2 text-[10px] text-white/50 hover:text-white uppercase font-bold tracking-widest transition-colors">
                <PlayCircle className="w-4 h-4 text-blue-500" /> Watch Explainer
             </button>
             <Button variant="ghost" size="sm" onClick={onClose} className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white">
               Skip to Dashboard
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};