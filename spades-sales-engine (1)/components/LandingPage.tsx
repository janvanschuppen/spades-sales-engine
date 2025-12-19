import React from 'react';
import { ArrowRight, LogIn } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { Button } from './ui/Button';
import { StandardPricingModal } from './modals/StandardPricingModal';
import { StartupPricingModal } from './modals/StartupPricingModal';
import { ConceptModal, AboutModal, StartupsModal } from './modals/InfoModals';

interface LandingPageProps {
  onAnalyze: (e: React.FormEvent) => void;
  onLogin: () => void;
  isLoading: boolean;
  companyUrl: string;
  setCompanyUrl: (url: string) => void;
}

type ModalType = 'concept' | 'about' | 'pricing' | 'startups' | 'startup-pricing' | null;

export const LandingPage: React.FC<LandingPageProps> = ({ onAnalyze, onLogin, isLoading, companyUrl, setCompanyUrl }) => {
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authView, setAuthView] = React.useState<'login' | 'register'>('login');
  const [activeModal, setActiveModal] = React.useState<ModalType>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyUrl.trim()) {
      onAnalyze(e);
    }
  };

  const handleLoginSuccess = () => {
    setShowAuthModal(false);
    onLogin();
  };

  const openLogin = () => {
    setAuthView('login');
    setShowAuthModal(true);
  };

  const openRegister = () => {
    setActiveModal(null); 
    setAuthView('register');
    setShowAuthModal(true);
  };

  // Fixed static path for branding asset
  const logoPath = "/static/branding/logo.png";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-background">
      
      {/* Background Blobs - Atmospheric Depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      {/* Spades Logo */}
      <img
        src={logoPath}
        alt="Spades Logo"
        className="absolute top-8 left-10 h-8 w-auto opacity-100 z-50 pointer-events-none select-none drop-shadow-2xl brightness-200"
        onError={(e) => {
          e.currentTarget.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; 
        }}
      />

      {/* Top Right Login */}
      <div className="absolute top-8 right-10 z-50">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={openLogin}
          className="text-white/40 hover:text-white backdrop-blur-xl bg-white/5 border border-white/5 rounded-full px-5 font-bold uppercase tracking-widest text-[9px]"
        >
          <LogIn className="w-3 h-3 mr-2" /> Login
        </Button>
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLoginSuccess}
        initialView={authView}
      />

      <ConceptModal isOpen={activeModal === 'concept'} onClose={() => setActiveModal(null)} onAction={openRegister} />
      <AboutModal isOpen={activeModal === 'about'} onClose={() => setActiveModal(null)} />
      <StandardPricingModal isOpen={activeModal === 'pricing'} onClose={() => setActiveModal(null)} onAction={openRegister} />
      <StartupsModal isOpen={activeModal === 'startups'} onClose={() => setActiveModal(null)} onAction={() => setActiveModal('startup-pricing')} />
      <StartupPricingModal isOpen={activeModal === 'startup-pricing'} onClose={() => setActiveModal(null)} />

      {/* --- Main Hero Section --- */}
      <div className="relative z-10 w-full max-w-4xl text-center space-y-12 animate-fade-in">
        <div className="space-y-0">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-400 leading-[1.1]">
            <span className="text-white">Replace your</span><br /> 
            entire <span className="text-white">sales</span> team.
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] opacity-10 group-hover:opacity-30 transition duration-700 blur-xl"></div>
          
          <div className="relative flex items-center bg-white/[0.02] backdrop-blur-2xl rounded-2xl p-2.5 border border-white/10 shadow-2xl transition-all group-focus-within:border-blue-500/30">
            <input
              type="text"
              placeholder="company.com"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              className="flex-1 bg-transparent border-none text-white px-6 py-4 focus:outline-none placeholder-white/20 text-lg font-medium"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-white text-black hover:bg-zinc-200 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
            >
              {isLoading ? '...' : <><span className="hidden sm:inline">Find ICP</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
          <p className="mt-4 text-xs font-medium text-zinc-400 opacity-80">Enter your website or product page to initialize the analysis.</p>
        </form>
        
        {/* --- Footer Nav --- */}
        <div className="pt-10 flex flex-wrap justify-center gap-7 md:gap-14">
             {[
               { label: 'Concept', type: 'concept' },
               { label: 'About', type: 'about' },
               { label: 'Pricing', type: 'pricing' },
               { label: 'Startups', type: 'startups' },
             ].map(nav => (
               <button 
                 key={nav.type}
                 onClick={() => setActiveModal(nav.type as ModalType)}
                 className="text-[11.5px] font-bold text-zinc-400 tracking-[0.2em] hover:text-white transition-all uppercase relative group"
               >
                 {nav.label}
                 <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 transition-all group-hover:w-full" />
               </button>
             ))}
             <button 
               onClick={() => window.open('https://revenue-intake.scoreapp.com/', '_blank')}
               className="text-[11.5px] font-bold text-zinc-400 tracking-[0.2em] hover:text-white transition-all uppercase flex items-center gap-1.5 group"
             >
               Quick Scan <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
             </button>
        </div>
      </div>
    </div>
  );
};