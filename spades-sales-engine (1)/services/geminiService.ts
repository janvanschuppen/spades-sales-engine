
import { AnalysisResult, ICP } from "../types";
import { api } from "./api";

// Client-side key usage REMOVED. Logic moved to /api/gemini/analyze

export const analyzeWebsite = async (url: string): Promise<AnalysisResult> => {
  try {
    const result = await api.post<AnalysisResult>('/gemini/analyze', { url });
    return result;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error; // Let the UI handle the error state, do not return fake data
  }
};

export const generateICP = async (analysis: AnalysisResult): Promise<ICP> => {
  try {
    const result = await api.post<ICP>('/gemini/icp', { analysis });
    return result;
  } catch (error) {
    console.error("ICP Error:", error);
    throw error; // Let the UI handle the error state
  }
};
