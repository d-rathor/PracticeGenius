export interface Worksheet {
  id: string;
  _id?: string; // Adding _id for MongoDB compatibility
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
  keywords?: string[]; // Adding keywords for tagging worksheets
}
