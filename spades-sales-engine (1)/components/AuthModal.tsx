import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { X, Check, ShieldCheck, Zap, Lock, AlertTriangle, Mail, CheckCircle2 } from 'lucide-react';
import { AuthService } from '../services/auth';
import { loadGuestStrategy, clearGuestStrategy } from '../utils/handoff';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  initialView?: 'login' | 'register';
  companyUrl?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, initialView = 'login', companyUrl }) => {
  const [view, setView] = useState<'login' | 'register' | 'request_access' | 'verify_email'>(initialView);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [url, setUrl] = useState(companyUrl || '');

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError('');
      if (companyUrl) setUrl(companyUrl);
    }
  }, [isOpen, initialView, companyUrl]);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (view === 'login') {
        await AuthService.login(email, password);
        onLogin();
      } else {
        const guestStrategy = loadGuestStrategy();
        await AuthService.register(email, password, firstName, lastName, companyName, url, guestStrategy);
        clearGuestStrategy();
        setView('verify_email');
      }
    } catch (err: any) {
      setError(err.message === "DOMAIN_MISMATCH" ? "Email domain must match company URL." : (err.message || "Auth failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md animate-fade-in" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-lg md:max-w-4xl bg-white/[0.04] backdrop-blur-3xl backdrop-brightness-75 border-t border-l border-white/20 border-b border-r border-white/5 rounded-[32px] shadow-[0_25px_100px_-20px_rgba(0,0,0,0.9)] overflow-visible animate-slide-up flex flex-col md:flex-row before:absolute before:-inset-8 before:rounded-[60px] before:bg-gradient-to-tr before:from-blue-600/30 before:via-purple-600/20 before:to-pink-600/10 before:blur-3xl before:opacity-60 before:-z-10">
        
        {/* Gloss overlay */}
        <div className="absolute inset-0 rounded-[32px] glass-gloss z-0 pointer-events-none" />

        <button onClick={onClose} className="absolute top-5 right-5 text-white/30 hover:text-white z-40 transition-colors p-2 bg-white/5 rounded-full border border-white/10">
          <X className="w-4 h-4" />
        </button>

        {/* Left Column: Specific Sales Engine Content */}
        <div className="hidden md:flex md:w-[42%] bg-black/40 p-12 flex-col justify-center border-r border-white/10 rounded-l-[32px] relative z-10">
          <div className="space-y-12">
            {/* Headline Section */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white leading-tight tracking-tight">
                Fully automate Sales.
              </h2>
              <p className="text-sm text-white/40 leading-relaxed font-medium">
                Lean back, enjoy, watch deals come in. The world’s first end-to-end AI sales system.
              </p>
            </div>

            {/* Engines Section */}
            <div className="space-y-10">
              {/* Mid Engine */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">Mid Engine</h3>
                <ul className="space-y-2 text-sm text-white/60">
                  <li>• Lead Sourcing</li>
                  <li>• AI Voice Outbound</li>
                  <li>• Demos Booked</li>
                </ul>
              </div>

              {/* Full Engine */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em]">Full Engine</h3>
                <ul className="space-y-2 text-sm text-white/60">
                  <li>• Content Creation</li>
                  <li>• AI Sales Demos</li>
                  <li>• Personal Account Manager</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="flex-1 p-8 md:p-14 space-y-8 relative z-10">
            {view !== 'request_access' && view !== 'verify_email' && (
                <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/10 backdrop-blur-xl shadow-inner">
                  <button onClick={() => setView('login')} className={`flex-1 text-[10px] font-bold uppercase tracking-[0.2em] py-3 rounded-xl transition-all ${view === 'login' ? 'bg-white text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-white/40 hover:text-white'}`}>Sign In</button>
                  <button onClick={() => setView('register')} className={`flex-1 text-[10px] font-bold uppercase tracking-[0.2em] py-3 rounded-xl transition-all ${view === 'register' ? 'bg-white text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-white/40 hover:text-white'}`}>Register</button>
                </div>
            )}

            <div className="text-center md:text-left space-y-2">
              <h3 className="text-2xl font-bold text-white">
                {view === 'login' ? 'Welcome back' : view === 'request_access' ? 'Request Access' : view === 'verify_email' ? 'Check Inbox' : 'Start your engine'}
              </h3>
              <p className="text-sm text-white/50">
                {view === 'login' ? 'Enter your credentials to manage your pipeline.' : 'Configure your workspace in seconds.'}
              </p>
            </div>

            <div className="space-y-6">
                {view === 'verify_email' ? (
                    <div className="text-center py-10 space-y-8 animate-fade-in">
                        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto border border-blue-500/20 shadow-[0_0_40px_-5px_rgba(59,130,246,0.3)]">
                          <Mail className="w-10 h-10 text-blue-400" />
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm text-white/60 leading-relaxed">A verification link has been sent to:</p>
                            <p className="text-lg font-bold text-white tracking-tight">{email}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setView('login')} className="w-full text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 hover:text-white">Back to Sign In</Button>
                    </div>
                ) : (
                    <form onSubmit={handleAuth} className="space-y-5">
                        {view === 'register' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="First Name" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="h-11 bg-white/5 border-white/10 rounded-xl" />
                                    <Input label="Last Name" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="h-11 bg-white/5 border-white/10 rounded-xl" />
                                </div>
                                <Input label="Company" placeholder="Acme Inc" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="h-11 bg-white/5 border-white/10 rounded-xl" />
                                <Input label="Website" placeholder="acme.com" value={url} onChange={(e) => setUrl(e.target.value)} required className="h-11 bg-white/5 border-white/10 rounded-xl" />
                            </>
                        )}
                        <Input label="Email Address" type="email" placeholder="work@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 bg-white/5 border-white/10 rounded-xl" />
                        <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 bg-white/5 border-white/10 rounded-xl" />
                        
                        {error && (
                          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <p className="text-xs text-red-400 font-medium">{error}</p>
                          </div>
                        )}

                        <div className="pt-4">
                          <Button type="submit" className="w-full font-bold text-xs bg-white text-black hover:bg-zinc-200 py-4 rounded-xl shadow-[0_10px_30px_-5px_rgba(255,255,255,0.2)] transition-all active:scale-95" size="md" isLoading={loading}>
                              {view === 'login' ? 'Sign In' : 'Initialize Account'}
                          </Button>
                        </div>
                    </form>
                )}
            </div>

            <div className="relative pt-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.3em]">
                  <span className="bg-black/20 px-4 py-1 rounded-full text-white/30 flex items-center gap-2 backdrop-blur-3xl border border-white/10">
                    <Lock className="w-3 h-3 text-blue-500" /> AES-256 Encrypted
                  </span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};