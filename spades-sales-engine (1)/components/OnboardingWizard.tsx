import React, { useState, useEffect } from 'react';
import { WebsiteData, ICP } from '../types';
import { Button } from './ui/Button';
import { generateICP } from '../services/geminiService';
import { CheckCircle2, ChevronRight, FileUp } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { saveGuestStrategy } from '../utils/handoff';

interface OnboardingProps {
  websiteData: WebsiteData | null; 
  onComplete: (icp: ICP, files: File[]) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  initialStep: number;
  onSaveProgress: (step: number) => void;
  onUpdateICP: (icp: ICP) => void;
  savedICP: ICP | null;
}

export const OnboardingWizard: React.FC<OnboardingProps> = ({ 
  websiteData, 
  onComplete, 
  isLoggedIn, 
  onLogin, 
  initialStep, 
  onSaveProgress,
  onUpdateICP,
  savedICP
}) => {
  const [step, setStep] = useState<number>(initialStep);
  const [icp, setIcp] = useState<ICP | null>(savedICP);
  const [isGeneratingICP, setIsGeneratingICP] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (initialStep) setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    if (savedICP) setIcp(savedICP);
  }, [savedICP]);

  useEffect(() => {
    if (step === 1 && !icp && !isGeneratingICP && websiteData) {
      setIsGeneratingICP(true);
      
      const analysisResult = {
        positioning: websiteData.positioning,
        offer: websiteData.offerStructure,
        icp_hint: websiteData.icpIndicators,
        trust: websiteData.trustMarkers
      };

      generateICP(analysisResult).then((generatedIcp) => {
        setIcp(generatedIcp);
        onUpdateICP(generatedIcp); 
        
        // Save to guest handoff storage
        if (!isLoggedIn) {
          saveGuestStrategy({
            url: websiteData.url,
            ...analysisResult,
            industries: generatedIcp.industries,
            painPoints: generatedIcp.painPoints,
            roles: generatedIcp.roles,
            country: 'Global'
          });
        }
        
        setIsGeneratingICP(false);
      });
    }
  }, [step, icp, isGeneratingICP, websiteData, onUpdateICP, isLoggedIn]);

  const handleNext = () => {
    const nextStep = step + 1;
    if (step === 1 && icp) {
      if (!isLoggedIn) {
        setShowAuthModal(true);
      } else {
        setStep(nextStep);
        onSaveProgress(nextStep);
      }
    }
    else if (step === 2) {
      setStep(nextStep);
      onSaveProgress(nextStep);
    }
  };

  const handleAuthSuccess = () => {
    onLogin();
    setShowAuthModal(false);
  };

  const handleFinalize = () => {
    if (icp) onComplete(icp, files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  if (!websiteData && !icp && step === 1) {
    return <div className="text-center text-white p-10">Initializing onboarding data...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLogin={handleAuthSuccess}
        initialView="register" 
      />

      <div className="w-full max-w-4xl bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-xl animate-slide-up">
        
        {/* Progress Bar */}
        <div className="flex border-b border-zinc-800">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`flex-1 p-4 flex items-center justify-center gap-2 text-sm font-medium
                ${step === s ? 'text-white bg-zinc-800/50' : 'text-zinc-500'}
                ${step > s ? 'text-green-500' : ''}
              `}
            >
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">{s}</span>}
              {s === 1 ? 'Review ICP' : s === 2 ? 'Training Files' : 'Confirm Build'}
            </div>
          ))}
        </div>

        <div className="p-8 min-h-[400px]">
          
          {/* Step 1: ICP Review */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Ideal Customer Profile</h2>
                  <p className="text-zinc-400">Generated from {websiteData?.url}</p>
                </div>
                {isGeneratingICP && <span className="text-xs text-blue-400 animate-pulse">Analyzing market data...</span>}
              </div>

              {isGeneratingICP ? (
                <div className="space-y-4 animate-pulse">
                   <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                   <div className="h-20 bg-zinc-800 rounded w-full"></div>
                   <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                </div>
              ) : icp ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Target Role</label>
                        <div className="text-white font-medium mt-1">{icp.title}</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {icp.roles.map((r, i) => <span key={i} className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-300">{r}</span>)}
                        </div>
                     </div>
                     <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Industries</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {icp.industries.map((ind, i) => <span key={i} className="text-xs bg-blue-900/20 text-blue-400 border border-blue-900/50 px-2 py-1 rounded">{ind}</span>)}
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 h-full">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Key Pain Points</label>
                        <ul className="mt-2 space-y-2">
                           {icp.painPoints.map((p, i) => (
                             <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                               <span className="text-red-500 mt-1">•</span> {p}
                             </li>
                           ))}
                        </ul>
                     </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Step 2: Files */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">Upload Training Data</h2>
                <p className="text-zinc-400">Optional: Add case studies, whitepapers, or sales scripts to improve the AI.</p>
              </div>
              
              <div className="border-2 border-dashed border-zinc-800 rounded-xl p-12 text-center hover:border-zinc-700 transition-colors bg-zinc-900/30">
                <FileUp className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <label className="block">
                  <span className="bg-white text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-zinc-200 transition-colors">
                    Select Files
                  </span>
                  <input type="file" className="hidden" multiple onChange={handleFileChange} />
                </label>
                <p className="mt-4 text-sm text-zinc-500">PDF, DOCX, TXT up to 10MB</p>
                {files.length > 0 && (
                   <div className="mt-6 text-left max-w-md mx-auto bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-2">Selected files:</p>
                      {files.map((f, i) => (
                        <div key={i} className="text-sm text-white truncate flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                           {f.name}
                        </div>
                      ))}
                   </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">Ready to Build</h2>
                <p className="text-zinc-400">Review the architecture before we deploy the engines.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Market Data', role: 'Data & Enrichment', status: 'Ready' },
                    { name: 'Voice AI', role: 'Outbound Agents', status: 'Pending Config' },
                    { name: 'Persona Engine', role: 'Video Personalization', status: 'Pending Scripts' },
                    { name: 'Sales CRM', role: 'Deal Management', status: 'Connected' },
                  ].map((tool) => (
                    <div key={tool.name} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between h-32">
                       <div>
                         <div className="font-semibold text-white">{tool.name}</div>
                         <div className="text-xs text-zinc-500">{tool.role}</div>
                       </div>
                       <div className="text-xs flex items-center gap-1 text-green-500">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                         {tool.status}
                       </div>
                    </div>
                  ))}
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-blue-200 text-sm">
                <strong>Confirmation Required:</strong> By proceeding, the system will generate 3 initial outreach campaigns and setup the pipelines automatically.
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
          {step > 1 && (
            <Button variant="ghost" onClick={() => setStep(s => (s - 1))}>Back</Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext} disabled={step === 1 && !icp}>
              {step === 1 && !isLoggedIn ? 'Continue & Save' : 'Continue'} <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleFinalize} className="bg-white hover:bg-zinc-200 text-zinc-900">
              Initialize Engine
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};