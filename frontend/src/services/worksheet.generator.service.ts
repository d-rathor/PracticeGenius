import apiClient from '@/lib/api';

export interface WorksheetGenerationParams {
  grade: string;
  subject: string;
  topic: string;
  customTopic?: string;
  summary?: string;
  numOfQuestions: number;
  includeImages: boolean;
  generateAnswerKey: boolean;
}

export interface WorksheetGenerationResponse {
  downloadUrl: string;
  answerKeyUrl?: string;
  worksheetPreviewUrl?: string;
  answerKeyPreviewUrl?: string;
}

const generateWorksheet = async (params: WorksheetGenerationParams): Promise<WorksheetGenerationResponse> => {
  try {
    const response = await apiClient.post<WorksheetGenerationResponse>('/admin/worksheet-generator/generate', params);
    return response;
  } catch (error) {
    console.error('Error generating worksheet:', error);
    throw error;
  }
};

export const worksheetGeneratorService = {
  generateWorksheet,
};
