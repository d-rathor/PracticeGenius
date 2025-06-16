import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Worksheet {
  id: string;
  title: string;
  subject: string;
  grade: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  content: string;
  pdfUrl?: string;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

const WorksheetDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch worksheet data
  useEffect(() => {
    const fetchWorksheet = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching worksheet with ID:', id);
        
        // Get token from localStorage with safety check
        const token = typeof window !== 'undefined' ? localStorage.getItem('practicegenius_token') : null;
        
        if (!token) {
          console.error('No authentication token found');
          router.push(`/auth/login?redirect=/admin/worksheets/${id}`);
          return;
        }
        
        // Use the correct API endpoint with the worksheet ID
        console.log('Attempting to fetch worksheet with ID:', id);
        
        // Try to fetch directly from the backend API first
        try {
          const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/worksheets/${id}`;
          console.log('Fetching directly from backend:', backendUrl);
          
          const backendResponse = await fetch(backendUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Backend API response status:', backendResponse.status);
          
          if (backendResponse.ok) {
            const responseData = await backendResponse.json();
            console.log('Backend API response data:', responseData);
            
            // Process the data and set the worksheet
            const data = responseData.data || responseData;
            
            // Transform the data to match our interface
            const worksheetData: Worksheet = {
              id: data._id || data.id || '',
              title: data.title || 'Untitled Worksheet',
              subject: data.subject || 'No Subject',
              grade: data.grade || 'No Grade',
              difficulty: data.difficulty || 'medium',
              description: data.description || '',
              content: data.content || '',
              pdfUrl: data.fileUrl || data.pdfUrl || '',
              downloads: data.downloads || data.downloadCount || 0,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString()
            };
            
            console.log('Processed worksheet data:', worksheetData);
            setWorksheet(worksheetData);
            setIsLoading(false);
            return;
          }
        } catch (backendError) {
          console.error('Error fetching from backend directly:', backendError);
          // Continue to try the Next.js API route
        }
        
        // Fallback to using the Next.js API route
        console.log('Falling back to Next.js API route');
        const response = await fetch(`/api/admin/worksheets/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Next.js API response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log('Authentication error, redirecting to login');
            router.push(`/auth/login?redirect=/admin/worksheets/${id}`);
            return;
          }
          throw new Error(`Failed to fetch worksheet: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('Worksheet data received:', responseData);
        
        // Handle different response structures
        // The data might be directly in the response or nested in a data property
        const data = responseData.data || responseData;
        
        // Transform the data if needed to match our interface
        const worksheetData: Worksheet = {
          id: data._id || data.id || '',
          title: data.title || 'Untitled Worksheet',
          subject: data.subject || 'No Subject',
          grade: data.grade || 'No Grade',
          difficulty: data.difficulty || 'medium',
          description: data.description || '',
          content: data.content || '',
          pdfUrl: data.fileUrl || data.pdfUrl || '',
          downloads: data.downloads || data.downloadCount || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
        
        console.log('Processed worksheet data:', worksheetData);
        
        setWorksheet(worksheetData);
        
      } catch (err) {
        console.error('Error fetching worksheet:', err);
        setError('Failed to load worksheet. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchWorksheet();
    }
  }, [id, router]);

  // Handle delete worksheet
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this worksheet? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Deleting worksheet with ID:', id);
      
      // Get token from localStorage with safety check
      const token = typeof window !== 'undefined' ? localStorage.getItem('practicegenius_token') : null;
      
      if (!token) {
        console.error('No authentication token found');
        setError('You must be logged in to delete worksheets');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(`/api/admin/worksheets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Delete API response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Authentication error, redirecting to login');
          router.push('/auth/login?redirect=/admin/worksheets');
          return;
        }
        
        // Try to parse error response
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete worksheet' }));
        throw new Error(errorData.message || 'Failed to delete worksheet');
      }
      
      // Show success message and redirect
      alert('Worksheet deleted successfully');
      router.push('/admin/worksheets');
      
    } catch (err) {
      console.error('Error deleting worksheet:', err);
      setError('Failed to delete worksheet. Please try again.');
      setIsLoading(false);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!id || !worksheet) return;

    setIsDownloading(true);
    setError(null);

    try {
      const token = localStorage.getItem('practicegenius_token');
      if (!token) {
        router.push(`/auth/login?redirect=/admin/worksheets/${id}`);
        return;
      }
      
      // The backend route for download is a POST request to track downloads
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/worksheets/${id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to get download link.' }));
        throw new Error(errorData.message || 'Failed to get download link.');
      }

      const { data } = await response.json();
      const downloadUrl = data.downloadUrl;

      if (downloadUrl) {
        // Open the pre-signed URL in a new tab
        window.open(downloadUrl, '_blank');
      } else {
        throw new Error('Download URL not found in response.');
      }
    } catch (err: any) {
      console.error('Error downloading worksheet:', err);
      setError(err.message || 'Could not download the file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Worksheet Details</h1>
            <div className="flex space-x-3">
              <Link 
                href="/admin/worksheets" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Back to Worksheets
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : worksheet ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-medium text-gray-900">{worksheet.title}</h2>
                      <div className="flex items-center mt-2 space-x-2">
                        <Badge>{worksheet.subject}</Badge>
                        <Badge>{worksheet.grade}</Badge>
                        <Badge className={getDifficultyColor(worksheet.difficulty)}>
                          {worksheet.difficulty.charAt(0).toUpperCase() + worksheet.difficulty.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/worksheets/${id}/edit`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
                      <button
                        onClick={handleDelete}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                    <p className="mt-1 text-sm text-gray-900">{worksheet.subject || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Grade Level</h3>
                    <p className="mt-1 text-sm text-gray-900">{worksheet.grade || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500">Difficulty</h3>
                  <div className="mt-1">
                    <Badge className={getDifficultyColor(worksheet.difficulty || 'medium')}>
                      {worksheet.difficulty || 'Medium'}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 text-sm text-gray-900">{worksheet.description}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Statistics</h3>
                    <div className="mt-1 text-sm text-gray-900">
                      <p>Downloads: {worksheet.downloads}</p>
                      <p>Created: {formatDate(worksheet.createdAt)}</p>
                      <p>Last Updated: {formatDate(worksheet.updatedAt)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Worksheet Content</h3>
                  <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap">{worksheet.content}</pre>
                  </div>
                </div>
                
                {worksheet.pdfUrl && (
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">PDF Preview</h3>
                    <div className="flex justify-center bg-gray-50 p-4 rounded-md">
                      <button 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 disabled:cursor-not-allowed"
                      >
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {isDownloading ? 'Downloading...' : 'Download PDF'}
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                  <div className="flex justify-end space-x-2">
                    <Link
                      href={`/admin/worksheets/${id}/edit`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md" role="alert">
              <span className="block sm:inline">Worksheet not found.</span>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default WorksheetDetail;
