import api from '../lib/api';
import { Worksheet } from '@/types/worksheet';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webContentLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: number;
}

export interface ProcessFileResponse {
  success: boolean;
  data: Worksheet;
}

export interface ProcessFolderResponse {
  success: boolean;
  message: string;
  data: ProcessFolderResult[];
}

export interface ProcessFolderResult {
  fileId: string;
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

/**
 * Google Drive service for handling Google Drive integration
 */
const GoogleDriveService = {
  /**
   * Store Google Drive authorization token
   * @param code Authorization code from Google OAuth flow
   * @returns Success message
   */
  async storeAuthToken(code: string) {
    const response = await api.post('/google-drive/auth', { code });
    return response;
  },

  /**
   * List files in a Google Drive folder
   * @param folderId Google Drive folder ID
   * @returns List of files in the folder
   */
  async listFolderContents(folderId: string) {
    const response = await api.get<{ success: boolean; data: GoogleDriveFile[] }>(
      `/google-drive/list-folder/${folderId}`
    );
    return response;
  },

  /**
   * Process a single file from Google Drive
   * @param fileId Google Drive file ID
   * @returns Processed worksheet
   */
  async processFile(fileId: string) {
    const response = await api.post<ProcessFileResponse>('/google-drive/process-file', { fileId });
    return response;
  },

  /**
   * Process multiple files from a Google Drive folder
   * @param folderId Google Drive folder ID
   * @returns Processing results
   */
  async processFolderBatch(folderId: string) {
    const response = await api.post<ProcessFolderResponse>('/google-drive/process-folder', { folderId });
    return response;
  }
};

export default GoogleDriveService;
