import React, { useState, useRef, useEffect } from 'react';
import { AppState, PipelineStep } from '../types';
import { Button } from './ui/Button';
import { Play, Pause, Square, Activity, Users, Phone, Video, MessageSquare, UserCircle, LogOut, CreditCard, Edit3, UserPlus, Settings, Share2, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WelcomeModal } from './WelcomeModal';
import { OnboardingBarometer } from './OnboardingBarometer';
import { ProfileModal, ProductModal, ICPModal, QAModal, DocsModal } from './modals/OnboardingModals';
import { InviteModal } from './modals/InviteModal';
import { TeamSettings } from './TeamSettings';
import { CRMSetup } from './integrations/CRMSetup';
import { ContentModal } from './ContentModal';
import { StorageService } from '../services/storage';
import { AuthService } from '../services/auth';

interface DashboardProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  onAnalyze?: (url: string) => void;
  isLoading?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, updateState, onAnalyze, isLoading }) => {
  const [activeModal, setActiveModal] = useState<'welcome' | 'profile' | 'product' | 'icp' | 'qa' | 'docs' | 'invite' | 'team_settings' | 'integrations' | null>(
    state.onboardingState.hasSeenWelcome ? null : 'welcome'
  );
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [url, setUrl] = useState('');
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWelcomeClose = () => {
    setActiveModal(null);
    if (state.userProfile) {
        StorageService.updateOnboardingState(state.userProfile.id, { hasSeenWelcome: true });
        updateState({ 
            onboardingState: { ...state.onboardingState, hasSeenWelcome: true }
        });
    }
  };

  const handleLogout = () => AuthService.logout();

  const handleAction = (action: string) => {
      switch(action) {
          case 'profile': setActiveModal('profile'); break;
          case 'product': setActiveModal('product'); break;
          case 'icp': setActiveModal('icp'); break;
          case 'qa': setActiveModal('qa'); break;
          case 'docs': setActiveModal('docs'); break;
          case 'invite': setActiveModal('invite'); break;
          case 'team': setActiveModal('team_settings'); break;
          case 'integrations': setActiveModal('integrations'); break;
          case 'upgrade': alert('Upgrade flow'); break;
      }
      setShowProfileMenu(false);
  };

  const updateOnboardingStep = (field: keyof typeof state.onboardingState) => {
     if (state.userProfile) {
         StorageService.updateOnboardingState(state.userProfile.id, { [field]: true });
         updateState({
             onboardingState: { ...state.onboardingState, [field]: true }
         });
     }
  };

  const handleMagicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && onAnalyze) {
      onAnalyze(url);
    }
  };

  const userRole = state.userProfile?.role || 'member';
  const isAdminOrOwner = userRole === 'admin' || userRole === 'owner';
  const isOwner = userRole === 'owner';

  const chartStroke = '#3b82f6';
  const gridStroke = '#27272a';
  const axisColor = '#71717a'; 

  const chartData = [
      { name: 'Mon', leads: 0 }, { name: 'Tue', leads: 0 }, { name: 'Wed', leads: 0 },
      { name: 'Thu', leads: 0 }, { name: 'Fri', leads: 0 }, { name: 'Sat', leads: 0 },
      { name: 'Sun', leads: 0 },
  ];

  // If no data yet, show the magic input to start the engine
  if (!state.websiteData && !state.coreProduct) {
      return (
          <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="max-w-xl space-y-8">
                  <div className="space-y-3">
                      <h2 className="text-3xl font-bold text-white tracking-tight">Initialize your Sales Engine</h2>
                      <p className="text-zinc-500">Provide your website URL to begin the analysis and generate your first strategy.</p>
                  </div>

                  <form onSubmit={handleMagicSubmit} className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-700 blur-lg"></div>
                      <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl">
                          <input 
                              type="text" 
                              placeholder="company.com" 
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                              className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none placeholder-zinc-700 font-medium"
                              autoFocus
                          />
                          <Button type="submit" isLoading={isLoading} disabled={!url} className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                              Analyze <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                      </div>
                  </form>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6 transition-colors duration-300">
      
      <WelcomeModal isOpen={activeModal === 'welcome'} onClose={handleWelcomeClose} onAction={handleAction} />
      <ProfileModal isOpen={activeModal === 'profile'} onClose={() => setActiveModal(null)} user={state.userProfile} onSave={() => updateOnboardingStep('profileCompleted')} />
      <ProductModal isOpen={activeModal === 'product'} onClose={() => setActiveModal(null)} data={state.websiteData} coreProduct={state.coreProduct} onSave={(updated) => { if (state.userProfile) { StorageService.updateCoreProduct(state.userProfile.id, updated); updateState({ coreProduct: updated }); } }} />
      <ICPModal isOpen={activeModal === 'icp'} onClose={() => setActiveModal(null)} icp={state.icp} />
      <QAModal isOpen={activeModal === 'qa'} onClose={() => setActiveModal(null)} onComplete={() => updateOnboardingStep('qaCompleted')} />
      <DocsModal isOpen={activeModal === 'docs'} onClose={() => setActiveModal(null)} files={state.fileMetadata} userId={state.userProfile?.id || ''} onUploadComplete={async (newFiles) => { if (state.userProfile) { const userData = await StorageService.getUserData(state.userProfile.id); updateState({ fileMetadata: userData.fileMetadata, onboardingState: userData.onboardingState }); } }} />
      <InviteModal isOpen={activeModal === 'invite'} onClose={() => setActiveModal(null)} />

      {activeModal === 'team_settings' && state.userProfile && (
          <ContentModal isOpen={true} onClose={() => setActiveModal(null)} title="Organization" headerClassName="bg-zinc-900">
              <TeamSettings currentUser={state.userProfile} />
          </ContentModal>
      )}

      {activeModal === 'integrations' && (
          <ContentModal isOpen={true} onClose={() => setActiveModal(null)} title="Integrations" headerClassName="bg-zinc-900">
              <CRMSetup />
          </ContentModal>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Engine Dashboard</h1>
          <div className="flex items-center gap-2 mt-0.5">
             <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
             <p className="text-zinc-400 font-medium text-xs">Active • {state.websiteData?.url || state.userProfile?.companyUrl || 'No URL Configured'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdminOrOwner && (
             <Button variant="outline" size="md" className="gap-2 hidden md:flex" onClick={() => setActiveModal('invite')}>
               <UserPlus className="w-3.5 h-3.5" /> Invite Team
             </Button>
          )}

          <Button variant="outline" size="md" className="gap-2">
            <Pause className="w-3.5 h-3.5" /> Pause
          </Button>
          <Button variant="danger" size="md" className="gap-2">
            <Square className="w-3.5 h-3.5" /> Stop
          </Button>
          <Button size="md" className="gap-2">
            <Play className="w-3.5 h-3.5" /> Start Outreach
          </Button>
          
          <div className="h-5 w-px bg-zinc-800 mx-1"></div>

          <div className="relative" ref={profileMenuRef}>
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="ml-1 p-1 rounded-full hover:bg-zinc-800 transition-colors" title="Account Settings">
                <UserCircle className="w-8 h-8 text-zinc-400 hover:text-white" />
            </button>

            {showProfileMenu && (
                <div className="absolute right-0 top-10 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 animate-fade-in overflow-hidden">
                    <div className="p-3 border-b border-zinc-800">
                        <p className="text-xs font-semibold text-white truncate">{state.userProfile?.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{state.userProfile?.email}</p>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500">{state.userProfile?.role}</span>
                    </div>
                    <div className="p-1 space-y-0.5">
                        {isAdminOrOwner && (
                            <button onClick={() => handleAction('team')} className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 rounded-md flex items-center gap-2">
                                <Users className="w-3.5 h-3.5" /> Team Settings
                            </button>
                        )}
                        {isAdminOrOwner && (
                            <button onClick={() => handleAction('integrations')} className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 rounded-md flex items-center gap-2">
                                <Share2 className="w-3.5 h-3.5" /> CRM Integrations
                            </button>
                        )}
                        <button onClick={() => handleAction('profile')} className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 rounded-md flex items-center gap-2">
                            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                        </button>
                        <button onClick={() => handleAction('product')} className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 rounded-md flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" /> Core Product
                        </button>
                         <button onClick={() => handleAction('icp')} className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 rounded-md flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" /> Edit ICP
                        </button>
                         {isOwner && (
                            <button onClick={() => handleAction('upgrade')} className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 rounded-md flex items-center gap-2">
                                <CreditCard className="w-3.5 h-3.5" /> Billing
                            </button>
                         )}
                    </div>
                    <div className="p-1 border-t border-zinc-800">
                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-900/20 rounded-md flex items-center gap-2">
                            <LogOut className="w-3.5 h-3.5" /> Log out
                        </button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      <OnboardingBarometer state={state.onboardingState} userRole={state.mode} userTier={state.userProfile?.tier} onAction={handleAction} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         {[
           { label: 'Total Leads', value: '0', icon: Users, change: '0%' },
           { label: 'Calls Made', value: '0', icon: Phone, change: '0%' },
           { label: 'Videos Generated', value: '0', icon: Video, change: '0%' },
           { label: 'Meetings Booked', value: '0', icon: Activity, change: '0%' },
         ].map((stat, i) => (
           <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-lg shadow-none hover:shadow-md transition-all">
             <div className="flex justify-between items-start mb-3">
               <div className="p-1.5 bg-zinc-800 rounded-md text-zinc-300">
                 <stat.icon className="w-4 h-4" />
               </div>
               <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">{stat.change}</span>
             </div>
             <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
             <div className="text-xs text-zinc-400">{stat.label}</div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 shadow-none">
          <h3 className="text-base font-bold text-white mb-4">Lead Velocity</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartStroke} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartStroke} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" stroke={axisColor} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={10} />
                <YAxis stroke={axisColor} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', fontSize: '12px', padding: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="leads" stroke={chartStroke} strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 shadow-none">
          <h3 className="text-base font-bold text-white mb-4">Live Activity</h3>
          <div className="space-y-3">
            {state.pipelineSteps.length > 0 ? state.pipelineSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full ${step.status === 'completed' ? 'bg-green-500' : step.status === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-zinc-700'}`}></div>
                 <div className="flex-1">
                   <div className="text-xs font-medium text-white">{step.name}</div>
                   <div className="text-[10px] text-zinc-400 capitalize">{step.status}</div>
                 </div>
              </div>
            )) : (
              <div className="text-xs text-zinc-500 text-center py-8">Engine initializing...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};