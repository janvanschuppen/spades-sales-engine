// Update UserMode to include 'owner' and 'member' roles
export type UserMode = 'owner' | 'admin' | 'member' | 'user' | 'guest';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: UserMode;
  tier: 'free' | 'mid' | 'full';
  organizationId: string;
  createdAt: string;
  passwordHash?: string;
  salt?: string;
  lastLoginAt?: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: number;
  companyName?: string;
  companyUrl?: string;
  companyDomain?: string;
  companySize?: string;
  industry?: string;
  websiteSubmittedAt?: string;
  closeContactId?: string;
  closeLeadId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserMode;
  tier?: 'free' | 'mid' | 'full';
  organizationId: string;
  companyUrl?: string;
  companyName?: string;
  isVerified: boolean;
}

export interface ICPAnalysisResult {
  companyName: string;
  industry?: string;
  logoUrl?: string;
  heroImage?: string;
  primaryColor: string;
  secondaryColor?: string;
  toneOfVoice?: string;
  valueProp: string;
  idealCustomerProfile: {
    persona: {
      role: string;
      seniority: string;
    };
    painPoints: string[];
  };
  outreach: {
    subjectLine: string;
    hook: string;
  };
  url?: string;
  error?: boolean;
}

export interface WebsiteData {
  url: string;
  positioning: string;
  offerStructure: string;
  marketLanguage: string;
  icpIndicators: string;
  trustMarkers: string[];
  messagingPatterns: string;
  analysisDate?: string;
}

export interface ICP {
  title: string;
  description: string;
  industries: string[];
  geography: string[];
  companySize: string[];
  roles: string[];
  painPoints: string[];
}

export interface CoreProduct {
    description: string;
    offer: string;
    pricePoints: string[];
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  storageKey: string;
}

export interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'review' | 'completed' | 'error';
  data?: any;
}

export interface OnboardingState {
  hasSeenTransition: boolean;
  hasSeenWelcome: boolean;
  analysisComplete: boolean;
  icpGenerated: boolean;
  marketAnalysisComplete: boolean;
  profileCompleted: boolean;
  docsUploaded: boolean;
  qaCompleted: boolean;
  videoWatched: boolean;
  supportCallBooked: boolean;
}

export interface StoredUserData {
  userId: string;
  websiteData: WebsiteData | null;
  icp: ICP | null;
  coreProduct: CoreProduct | null;
  onboardingState: OnboardingState;
  fileMetadata: FileMetadata[];
  pipelineSteps: PipelineStep[];
  logs: string[];
}

export interface AppState {
  mode: UserMode;
  userProfile: UserProfile | null;
  websiteData: WebsiteData | null;
  icp: ICP | null;
  coreProduct: CoreProduct | null;
  trainingFiles: File[];
  fileMetadata: FileMetadata[];
  pipelineSteps: PipelineStep[];
  logs: string[];
  apiKey: string | null;
  onboardingState: OnboardingState;
  analysisResult: ICPAnalysisResult | null;
  isAnalyzing: boolean;
}

export interface AnalysisResult {
  positioning: string;
  offer: string;
  icp_hint: string;
  trust: string[];
}

export type SubscriptionTier = 'free' | 'mid' | 'full';