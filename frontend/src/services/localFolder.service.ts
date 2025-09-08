import api from '../lib/api';
import { Worksheet } from '@/types/worksheet';

export interface ProcessFileResult {
  fileName: string;
  metadata?: {
    title: string;
    subject: string;
    grade: string;
    description: string;
    keywords: string[];
  };
  success: boolean;
  worksheetId?: string;
  error?: string;
}

export interface BatchUploadResponse {
  success: boolean;
  message: string;
  data: ProcessFileResult[];
}

/**
 * Local folder service for handling batch worksheet uploads
 */
const LocalFolderService = {
  /**
   * Upload multiple worksheet files at once
   * @param files Array of files to upload
   * @returns Processing results
   */
  async uploadBatch(files: File[]) {
    const formData = new FormData();
    
    // Append each file to the form data
    files.forEach(file => {
      formData.append('worksheetFiles', file);
    });
    
    // Don't set Content-Type header manually for FormData
    // The browser will automatically set it with the correct boundary
    const response = await api.post<BatchUploadResponse>('/local-folder/upload-batch', formData);
    
    return response;
  }
};

export default LocalFolderService;
