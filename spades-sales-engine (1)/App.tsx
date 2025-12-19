import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { CompanyProfilePage } from './components/CompanyProfilePage';
import LoadingScreen from './components/LoadingScreen';
import { AdminApp } from './AdminApp';
import { InviteAcceptPage } from './components/InviteAcceptPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppState, OnboardingState, ICPAnalysisResult } from './types';
import { AuthService } from './services/auth';
import { StorageService } from './services/storage';
import { api } from './services/api';

const normalizeUrl = (input: string): string => {
  if (!input) return "";
  let url = input.trim().toLowerCase();
  url = url.replace(/^https?:\/\//, "");
  url = url.replace(/^www\./, "");
  return `https://${url}`;
};

const defaultOnboardingState: OnboardingState = {
  hasSeenTransition: false,
  hasSeenWelcome: false,
  analysisComplete: false,
  icpGenerated: false,
  marketAnalysisComplete: false,
  profileCompleted: false,
  docsUploaded: false,
  qaCompleted: false,
  videoWatched: false,
  supportCallBooked: false,
};

const initialState: AppState = {
  mode: 'user',
  userProfile: null,
  websiteData: null,
  icp: null,
  coreProduct: null,
  trainingFiles: [],
  fileMetadata: [],
  pipelineSteps: [],
  logs: [],
  apiKey: null,
  onboardingState: defaultOnboardingState,
  analysisResult: null,
  isAnalyzing: false,
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(initialState);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [companyUrl, setCompanyUrl] = useState("");

  useEffect(() => {
    document.documentElement.classList.add('dark');
    const initSession = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        
        if (user) {
          const dbData = await StorageService.getUserData(user.id);
          setState(prev => ({
            ...prev,
            mode: user.role,
            userProfile: user,
            websiteData: dbData.websiteData,
            icp: dbData.icp,
            coreProduct: dbData.coreProduct,
            fileMetadata: dbData.fileMetadata,
            pipelineSteps: dbData.pipelineSteps,
            logs: dbData.logs,
            onboardingState: dbData.onboardingState,
          }));
        } else {
          setState(prev => ({ ...prev, userProfile: null }));
        }
      } catch (err) {
        console.warn("Auth init warning (offline mode):", err);
        setState(prev => ({ ...prev, userProfile: null }));
      } finally {
        setIsAuthChecking(false);
      }
    };
    initSession();
  }, []);

  const handleAnalyze = async (url: string) => {
    if (!url) return;

    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      analysisResult: null
    }));

    try {
      const normalized = normalizeUrl(url);
      console.log("🟦 Starting analysis for:", normalized);

      const [response] = await Promise.all([
        api.post<ICPAnalysisResult>("/analysis/icp", { url: normalized }),
        new Promise(resolve => setTimeout(resolve, 1500)) // cinematic delay
      ]);

      console.log("🟪 Analysis complete:", response);

      setState(prev => ({
        ...prev,
        analysisResult: { ...response },
        isAnalyzing: false
      }));
    } catch (err) {
      console.error("❌ CRITICAL FAILURE:", err);
      // Only alert if we really couldn't get data (fallback failed)
      alert("System Error: Unable to complete analysis. Please check console.");
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        analysisResult: null
      }));
    }
  };

  if (window.location.pathname.startsWith('/admin')) {
    return <ErrorBoundary><AdminApp /></ErrorBoundary>;
  }

  if (window.location.pathname.startsWith('/invite/')) {
    const parts = window.location.pathname.split('/');
    const token = parts[parts.length - 1] || parts[parts.length - 2];
    return <ErrorBoundary><InviteAcceptPage token={token} /></ErrorBoundary>;
  }

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-600 font-bold uppercase tracking-widest text-[10px]">
        ...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {state.isAnalyzing ? (
        <LoadingScreen />
      ) : state.analysisResult ? (
        <CompanyProfilePage data={state.analysisResult} />
      ) : (
        <LandingPage
          companyUrl={companyUrl}
          setCompanyUrl={setCompanyUrl}
          onAnalyze={(e) => { e.preventDefault(); handleAnalyze(companyUrl); }}
          onLogin={() => window.location.reload()}
          isLoading={state.isAnalyzing}
        />
      )}
    </div>
  );
};

export default App;