import api from '../lib/api';


export interface Worksheet {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  subscriptionLevel: 'Free' | 'Essential' | 'Premium';
  keywords: string[];
  fileUrl: string;
  thumbnailUrl: string;
  createdBy: string;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

// Define the structure of the API response when fetching multiple worksheets
export interface WorksheetsApiResponse {
  data: Worksheet[];
  // Add other pagination fields if your API returns them, e.g.:
  // currentPage?: number;
  // totalPages?: number;
  // totalCount?: number;
}

export interface WorksheetFilters {
  subject?: string;
  grade?: string;
  subscriptionLevel?: 'Free' | 'Essential' | 'Premium';
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Worksheet service for handling worksheet-related API calls
 * Replaces localStorage usage with backend API calls
 */
const WorksheetService = {
  /**
   * Get all worksheets with optional filtering
   * @param filters Optional filters for worksheets
   * @returns Array of worksheets and pagination data
   */
  async getWorksheets(filters: WorksheetFilters = {}) {
    const response = await api.get<WorksheetsApiResponse>('/api/worksheets', { params: filters });
    return response.data;
  },
  
  /**
   * Get worksheet by ID
   * @param id Worksheet ID
   * @returns Worksheet data
   */
  async getWorksheetById(id: string) {
    const response = await api.get<Worksheet>(`/api/worksheets/${id}`);
    return response;
  },
  
  /**
   * Create a new worksheet
   * @param worksheetData Worksheet data
   * @returns Created worksheet
   */
  async createWorksheet(worksheetData: FormData) {
    const response = await api.post<Worksheet>('/api/worksheets', worksheetData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  },
  
  /**
   * Update an existing worksheet
   * @param id Worksheet ID
   * @param worksheetData Updated worksheet data
   * @returns Updated worksheet
   */
  async updateWorksheet(id: string, worksheetData: FormData) {
    const response = await api.put<Worksheet>(`/api/worksheets/${id}`, worksheetData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  },
  
  /**
   * Delete a worksheet
   * @param id Worksheet ID
   * @returns Success message
   */
  async deleteWorksheet(id: string) {
    const response = await api.delete<{ message: string }>(`/api/worksheets/${id}`);
    return response;
  },
  
  /**
   * Download a worksheet and track the download
   * @param id Worksheet ID
   * @returns Download URL
   */
  async downloadWorksheet(id: string) {
    // Corrected to GET request as per backend route definition
    const response = await api.get<{ downloadUrl: string }>(`/api/worksheets/${id}/download`);
    return response; // Expects { downloadUrl: '...' }
  },
  
  /**
   * Get recent worksheets
   * @param limit Number of worksheets to return
   * @returns Array of recent worksheets
   */
  async getRecentWorksheets(limit: number = 5) {
    const response = await api.get<Worksheet[]>('/api/worksheets/recent', { params: { limit } });
    return response;
  }
};

export default WorksheetService;
