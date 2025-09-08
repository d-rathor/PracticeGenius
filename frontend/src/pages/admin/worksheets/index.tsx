import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { withAuth } from '@/components/hoc/withAuth';
// Toast functionality removed to fix build error

interface Worksheet {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'beginner' | 'intermediate' | 'advanced';
  description: string;
  downloadCount: number;
  downloads: number;
  subscriptionLevel: string;
  createdAt: string;
  updatedAt: string;
}

const AdminWorksheets: React.FC = () => {
  const router = useRouter();
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch worksheets data
  useEffect(() => {
    const fetchWorksheets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Always use the API to get real data
        try {
          // Use the correct API endpoint that exists in the backend
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/worksheets`;
          console.log('Fetching worksheets from:', apiUrl);
          
          // The GET /api/worksheets endpoint is public and doesn't require authentication
          const response = await fetch(apiUrl);
          
          if (!response.ok) {
            if (response.status === 401) {
              // Redirect to login page if unauthorized
              router.push('/auth/login?redirect=/admin/worksheets');
              return;
            }
            throw new Error(`Failed to fetch worksheets: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('API response data:', data);
          console.log('API response structure:', {
            hasData: !!data.data,
            dataIsArray: Array.isArray(data.data),
            dataLength: data.data ? data.data.length : 'N/A',
            firstItem: data.data && data.data.length > 0 ? data.data[0] : 'No items'
          });
          
          // Handle different possible API response formats
          // The backend returns { success: true, data: [...worksheets] }
          const worksheetsData = data.data || (Array.isArray(data) ? data : data.worksheets || []);
          console.log('Parsed worksheets data:', worksheetsData);
          
          // Log each worksheet to debug title and other fields
          worksheetsData.forEach((worksheet: any, index: number) => {
            console.log(`Worksheet ${index}:`, {
              id: worksheet._id,
              title: worksheet.title,
              titleType: typeof worksheet.title,
              subject: worksheet.subject,
              grade: worksheet.grade,
              subscriptionLevel: worksheet.subscriptionLevel
            });
          });
          
          // Process worksheets to ensure all required fields are present
          const processedWorksheets = worksheetsData.map((worksheet: any) => {
            // Map category to subject if subject is missing but category exists
            const subject = worksheet.subject || worksheet.category || 'No Subject';
            
            // Get subscription level from the worksheet data
            // Make sure to use the exact subscription level from the API response
            let subscriptionLevel = worksheet.subscriptionLevel || worksheet.subscriptionPlan?.name || 'Free';
            
            // If subscriptionPlanId is present but subscriptionLevel is not set properly
            if (worksheet.subscriptionPlanId) {
              // Map subscription plan ID to name if needed
              if (worksheet.subscriptionPlanId.includes('premium')) {
                subscriptionLevel = 'Premium';
              } else if (worksheet.subscriptionPlanId.includes('essential')) {
                subscriptionLevel = 'Essential';
              }
            }
            
            console.log('Processing worksheet:', {
              id: worksheet._id,
              title: worksheet.title,
              subject: subject,
              grade: worksheet.grade,
              subscriptionLevel: subscriptionLevel
            });
            
            // Create a properly formatted worksheet object with all required fields
            return {
              ...worksheet,
              _id: worksheet._id || `worksheet-${Math.random()}`,
              // Make sure to use the complete title string
              title: (worksheet.title && worksheet.title.trim()) ? worksheet.title.toString() : 'Untitled Worksheet',
              // Use the complete subject name
              subject: subject,
              // Use the complete grade name
              grade: worksheet.grade || 'No Grade',
              difficulty: worksheet.difficulty || 'medium',
              // Use the subscription level from the API or the subscription plan name
              subscriptionLevel: subscriptionLevel,
              // Handle both downloads field names
              downloads: worksheet.downloads || worksheet.downloadCount || 0,
              createdAt: worksheet.createdAt || new Date().toISOString()
            };
          });
          
          // Log the processed worksheets for debugging
          console.log('Processed worksheets:', processedWorksheets.map((w: Worksheet) => ({
            id: w._id,
            title: w.title,
            subscriptionLevel: w.subscriptionLevel
          })));
          
          setWorksheets(processedWorksheets);
          
          // Extract unique subjects and grades for filters
          const uniqueSubjects = Array.from(new Set(worksheetsData.map((w: Worksheet) => w.subject || '').filter(Boolean))) as string[];
          const uniqueGrades = Array.from(new Set(worksheetsData.map((w: Worksheet) => w.grade || '').filter(Boolean))) as string[];
          setSubjects(uniqueSubjects);
          setGrades(uniqueGrades);
        } catch (apiError) {
          console.error('API error:', apiError);
          setError('Failed to load worksheets. Please try again.');
          // Fall back to empty arrays
          setWorksheets([]);
          setSubjects([]);
          setGrades([]);
        }
        
      } catch (err) {
        console.error('Error fetching worksheets:', err);
        setError('Failed to load worksheets. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorksheets();
  }, [router]);

  // Filter worksheets based on search term and filters
  const filteredWorksheets = worksheets.filter(worksheet => {
    // Add null checks for all properties
    const title = worksheet.title || '';
    const description = worksheet.description || '';
    const subject = worksheet.subject || '';
    const grade = worksheet.grade || '';
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject ? subject === selectedSubject : true;
    const matchesGrade = selectedGrade ? grade === selectedGrade : true;
    
    return matchesSearch && matchesSubject && matchesGrade;
  });

  // Handle worksheet deletion
  const handleDeleteWorksheet = async (id: string) => {
    // Add confirmation dialog
    if (!window.confirm('Are you sure you want to delete this worksheet? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeleting(id);
      
      // Use direct backend API to avoid Next.js API route issues
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/worksheets/${id}`;
      console.log('Deleting worksheet with ID:', id, 'using direct backend URL:', backendUrl);
      
      const token = localStorage.getItem('practicegenius_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(backendUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Delete response status:', response.status);
      
      // Try to parse the response
      let responseData;
      try {
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        responseData = responseText ? JSON.parse(responseText) : {};
        console.log('Delete response data:', responseData);
      } catch (parseError) {
        console.error('Error parsing delete response:', parseError);
        responseData = { message: 'Unknown error' };
      }
      
      if (!response.ok) {
        console.error('Failed to delete worksheet:', responseData);
        // Don't throw an error, just set the error state
        setError(responseData.message || 'Failed to delete worksheet');
        return; // Exit early
      }
      
      // Remove the deleted worksheet from state
      setWorksheets(worksheets.filter(w => w._id !== id));
      console.log('Worksheet deleted successfully');
      setError(null); // Clear any previous errors
      
    } catch (err: any) {
      console.error('Error deleting worksheet:', err);
      const errorMessage = err.message || 'Failed to delete worksheet. Please try again.';
      console.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get color class for difficulty badge
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
      case 'advanced':
      case 'intermediate':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionPlanColor = (plan: string) => {
    // Make sure we're using case-insensitive comparison
    const normalizedPlan = plan?.toLowerCase() || 'free';
    
    switch (normalizedPlan) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'essential':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'premium':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Worksheets Management</h1>
            <div className="flex space-x-3">
              <Link 
                href="/admin/worksheets/bulk-delete" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Bulk Delete
              </Link>
              <Link 
                href="/admin/worksheets/bulk-subscription-update" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Manage Subscriptions
              </Link>
              <Link 
                href="/admin/worksheets/batch-upload" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Bulk Upload
              </Link>
              <Link 
                href="/admin/worksheets/create" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Worksheet
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Search input */}
                <div className="w-full md:w-1/3">
                  <label htmlFor="search" className="sr-only">Search worksheets</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="Search worksheets"
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-auto">
                    <label htmlFor="subject-filter" className="sr-only">Filter by subject</label>
                    <select
                      id="subject-filter"
                      name="subject-filter"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                      <option value="">All Subjects</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-auto">
                    <label htmlFor="grade-filter" className="sr-only">Filter by grade</label>
                    <select
                      id="grade-filter"
                      name="grade-filter"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                    >
                      <option value="">All Grades</option>
                      {grades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <p>{error}</p>
                </div>
              ) : filteredWorksheets.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No worksheets found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || selectedSubject || selectedGrade ? 
                      'Try adjusting your search or filters.' : 
                      'Get started by creating a new worksheet.'}
                  </p>
                  {!searchTerm && !selectedSubject && !selectedGrade && (
                    <div className="mt-6">
                      <Link 
                        href="/admin/worksheets/create" 
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Worksheet
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject / Grade
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Difficulty
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subscription Plan
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Downloads
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredWorksheets.map((worksheet) => (
                        <tr key={worksheet._id || `worksheet-${Math.random()}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {typeof worksheet.title === 'string' ? worksheet.title : 'Untitled Worksheet'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {typeof worksheet.subject === 'string' ? worksheet.subject : 'No Subject'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {typeof worksheet.grade === 'string' ? worksheet.grade : 'No Grade'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`${getDifficultyColor(worksheet.difficulty || 'medium')}`}>
                              {worksheet.difficulty || 'Medium'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getSubscriptionPlanColor(worksheet.subscriptionLevel || 'Free')}>
                              {typeof worksheet.subscriptionLevel === 'string' ? worksheet.subscriptionLevel : 'Free'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {worksheet.downloadCount || worksheet.downloads || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {worksheet.createdAt ? formatDate(worksheet.createdAt) : 'Unknown date'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              {worksheet._id ? (
                                <>
                                  <Link 
                                    href={`/admin/worksheets/${worksheet._id}`}
                                    className="text-orange-600 hover:text-orange-900"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      console.log('View worksheet with ID:', worksheet._id);
                                      router.push(`/admin/worksheets/${worksheet._id}`);
                                    }}
                                  >
                                    View
                                  </Link>
                                  <Link 
                                    href={`/admin/worksheets/${worksheet._id}/edit`}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() => handleDeleteWorksheet(worksheet._id)}
                                    disabled={isDeleting === worksheet._id}
                                    className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isDeleting === worksheet._id ? 'Deleting...' : 'Delete'}
                                  </button>
                                </>
                              ) : (
                                <span className="text-gray-400">Actions unavailable</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

// Wrap component with withAuth HOC and set adminOnly to true
export default withAuth(AdminWorksheets, { adminOnly: true });
