import apiClient from '@/lib/api';
import { AxiosResponse } from 'axios';
import { User } from '@/types';

// This interface should match the structure of a single worksheet
export interface Worksheet {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  thumbnailUrl?: string;
}

// This interface represents the log entry for a downloaded worksheet
export interface UserWorksheetLogEntry {
  _id: string;
  user: string; // User ID
  worksheet: Worksheet;
  firstDownloadedAt: string; // ISO date string
}

const getMyDownloadedWorksheets = async (): Promise<UserWorksheetLogEntry[]> => {
  try {
    // Explicitly type the response data
    const response: AxiosResponse<UserWorksheetLogEntry[]> = await apiClient.get('/users/me/downloaded-worksheets');
    // Return the data from the response, or an empty array as a fallback
    return response.data || [];
  } catch (error) {
    console.error('Error fetching downloaded worksheets in UserService:', error);
    // Re-throw the error so the component can catch it and set an error state
    throw error;
  }
};

const getUsers = async (): Promise<User[]> => {
  try {
    const response: AxiosResponse<User[]> = await apiClient.get('/users');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching users in UserService:', error);
    throw error;
  }
};

const deleteUser = async (userId: string): Promise<void> => {
  try {
    await apiClient.delete(`/users/${userId}`);
  } catch (error) {
    console.error(`Error deleting user ${userId} in UserService:`, error);
    throw error;
  }
};

const UserService = {
  getMyDownloadedWorksheets,
  getUsers,
  deleteUser,
};

export default UserService;