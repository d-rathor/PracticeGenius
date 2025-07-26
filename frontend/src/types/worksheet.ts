export interface Worksheet {
  id: string;
  title: string;
  subject: string;
  grade: string;
  difficulty: string;
  subscriptionLevel: 'Free' | 'Essential' | 'Premium';
  description: string;
  content: string;
  downloadCount: number;
  dateCreated: string;
  previewUrl?: string;
  fileKey?: string; 
  fileUrl: string;
  originalFilename?: string;
  mimeType?: string;
  fileSize?: number;
}
