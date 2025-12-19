import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  intro?: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  headerClassName?: string;
  headerImage?: string;
}

export const ContentModal: React.FC<ContentModalProps> = ({
  isOpen,
  onClose,
  title,
  intro,
  children,
  actionLabel,
  onAction,
  headerClassName = "bg-gradient-to-r from-zinc-800 to-zinc-900",
  headerImage
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setImageError(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md animate-fade-in" 
        onClick={onClose}
      />
      
      <div className="relative z-10 w-full max-w-lg max-h-[85vh] bg-white/[0.06] backdrop-blur-3xl backdrop-brightness-75 border-t border-l border-white/20 border-b border-r border-white/5 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] flex flex-col overflow-visible animate-slide-up before:absolute before:-inset-4 before:rounded-[40px] before:bg-gradient-to-br before:from-blue-600/25 before:to-purple-600/25 before:blur-3xl before:opacity-60 before:-z-10">
        
        {/* Specular Gloss Overlay */}
        <div className="absolute inset-0 rounded-3xl glass-gloss z-0 pointer-events-none" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/50 hover:text-white transition-all z-40 backdrop-blur-xl border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`h-28 md:h-32 w-full shrink-0 relative overflow-hidden rounded-t-[22px] z-10 ${headerClassName}`}>
           {headerImage && !imageError && (
             <>
               <img 
                 src={headerImage} 
                 alt={title} 
                 className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                 onError={() => setImageError(true)}
               />
               <div className="absolute inset-0 bg-zinc-950/30 mix-blend-multiply" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
             </>
           )}
        </div>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar relative z-10">
          <div className="max-w-full mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {title}
            </h2>

            {intro && (
              <p className="text-sm text-white/80 leading-relaxed font-light">
                {intro}
              </p>
            )}

            <div className="text-sm text-white/90 max-w-none">
              {children}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-3xl rounded-b-3xl flex justify-between items-center shrink-0 relative z-10">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white/30 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
            Close
          </Button>
          {actionLabel && onAction && (
            <Button onClick={onAction} size="sm" className="px-6 font-bold text-xs bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95">
              {actionLabel}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};