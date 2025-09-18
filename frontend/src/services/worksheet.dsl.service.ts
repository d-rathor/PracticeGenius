import apiClient from '@/lib/api';
import { WorksheetDSL } from '@/types/worksheet-dsl';

export interface WorksheetDslGenerationParams {
  grade: string;
  subject: string;
  topic: string;
  customTopic?: string;
  summary?: string;
  numOfQuestions: number;
  includeImages: boolean;
  generateAnswerKey: boolean;
  layoutType?: 'grid' | 'list' | 'columns' | 'free';
  rows?: number;
  cols?: number;
  theme?: 'orange-white-black' | 'blue-white-gray' | 'green-white-black' | 'purple-white-gray';
  seed?: number;
  useDslApproach?: boolean; // Flag to determine which API to use
  randomizeItems?: boolean; // Flag to control randomization of worksheet items
}

export interface WorksheetDslGenerationResponse {
  success: boolean;
  downloadUrl: string;
  answerKeyUrl?: string;
  worksheetPreviewUrl?: string;
  answerKeyPreviewUrl?: string;
  message?: string;
  worksheetDsl?: WorksheetDSL;
}

/**
 * Generate worksheet using DSL approach
 * @param params Worksheet generation parameters
 * @returns Response with download URLs
 */
const generateWorksheetDsl = async (params: WorksheetDslGenerationParams): Promise<WorksheetDslGenerationResponse> => {
  try {
    // Note: The API client automatically adds the /api prefix
    const response = await apiClient.post<WorksheetDslGenerationResponse>(
      '/admin/worksheet-generator/generate-dsl', 
      params
    );
    return response;
  } catch (error) {
    console.error('Error generating worksheet with DSL:', error);
    throw error;
  }
};

export const worksheetDslService = {
  generateWorksheetDsl,
};
