
import { User, StoredUserData, FileMetadata, WebsiteData, ICP, PipelineStep, OnboardingState, CoreProduct } from '../types';
import { api } from './api';

export const StorageService = {
  // --- User Management ---
  // Managed by AuthService and backend now.

  getUserData: async (userId: string): Promise<StoredUserData> => {
    try {
        const data = await api.get<any>('/data');
        return data; // Backend returns the shape matching StoredUserData
    } catch (e) {
        console.error("Failed to load user data", e);
        // Return empty structure on failure to prevent crash
        return {
            userId,
            websiteData: null,
            icp: null,
            coreProduct: null,
            onboardingState: {
                hasSeenTransition: false, hasSeenWelcome: false, analysisComplete: false,
                icpGenerated: false, marketAnalysisComplete: false, profileCompleted: false,
                docsUploaded: false, qaCompleted: false, videoWatched: false, supportCallBooked: false
            },
            fileMetadata: [],
            pipelineSteps: [],
            logs: []
        };
    }
  },

  saveUserData: async (userId: string, data: Partial<StoredUserData>) => {
    try {
        await api.post('/data', data);
    } catch (e) {
        console.error("Failed to save data", e);
    }
  },

  // --- Specific Field Updates ---
  // These wrappers ensure the UI calls remain cleaner

  updateWebsiteData: (userId: string, data: WebsiteData) => {
    const newState = { analysisComplete: true };
    return StorageService.saveUserData(userId, { websiteData: data, onboardingState: newState as any });
  },

  updateICP: (userId: string, icp: ICP) => {
    const newState = { icpGenerated: true };
    return StorageService.saveUserData(userId, { icp, onboardingState: newState as any });
  },

  updateCoreProduct: (userId: string, product: CoreProduct) => {
    return StorageService.saveUserData(userId, { coreProduct: product });
  },

  updateOnboardingState: (userId: string, state: Partial<OnboardingState>) => {
    return StorageService.saveUserData(userId, { onboardingState: state as any });
  },

  addFile: async (userId: string, file: File, metadata: any) => {
      const result = await api.upload<FileMetadata>('/files', file);
      return result;
  },

  updatePipeline: (userId: string, steps: PipelineStep[]) => {
    return StorageService.saveUserData(userId, { pipelineSteps: steps });
  },

  appendLog: (userId: string, message: string) => {
    // In a real app, we might not send every log individually to /data, 
    // but rather a dedicated /logs endpoint. For now, matching existing pattern:
    // We do NOT impl this for backend to avoid spamming the main data object.
    // Logging should happen via separate logger service.
    // Keeping empty to satisfy interface.
  }
};