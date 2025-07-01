import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

interface WorksheetFormData {
  title: string;
  subject: string;
  grade: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  content: string;
  pdfFile: File | null;
}

const EditWorksheet: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [formData, setFormData] = useState<WorksheetFormData>({
    title: '',
    subject: '',
    grade: '',
    difficulty: 'medium',
    description: '',
    content: '',
    pdfFile: null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasPdf, setHasPdf] = useState(false);

  // Common subjects and grades for dropdown options
  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Art', 'Music', 'Physical Education'];
  const grades = ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'];

  // Fetch worksheet data
  useEffect(() => {
    const fetchWorksheet = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Attempting to fetch worksheet with ID for editing:', id);
        
        // Get token from localStorage with safety check
        const token = typeof window !== 'undefined' ? localStorage.getItem('practicegenius_token') : null;
        
        if (!token) {
          console.error('No authentication token found');
          router.push(`/auth/login?redirect=/admin/worksheets/${id}/edit`);
          return;
        }
        
        // Try to fetch directly from the backend API first
        try {
          const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/worksheets/${id}`;
          console.log('Fetching directly from backend for edit:', backendUrl);
          
          const backendResponse = await fetch(backendUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Backend API response status for edit:', backendResponse.status);
          
          if (backendResponse.ok) {
            const responseData = await backendResponse.json();
            console.log('Backend API response data for edit:', responseData);
            
            // Process the data and set the form data
            const data = responseData.data || responseData;
            
            setFormData({
              title: data.title || '',
              subject: data.subject || '',
              grade: data.grade || '',
              difficulty: data.difficulty || 'medium',
              description: data.description || '',
              content: data.content || '',
              pdfFile: null
            });
            
            setHasPdf(!!(data.pdfUrl || data.fileUrl));
            setIsLoading(false);
            return;
          }
        } catch (backendError) {
          console.error('Error fetching from backend directly for edit:', backendError);
          // Continue to try the Next.js API route
        }
        
        // Fallback to using the Next.js API route
        console.log('Falling back to Next.js API route for edit');
        const response = await fetch(`/api/admin/worksheets/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Next.js API response status for edit:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push(`/auth/login?redirect=/admin/worksheets/${id}/edit`);
            return;
          }
          throw new Error(`Failed to fetch worksheet for editing: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('Next.js API response data for edit:', responseData);
        
        // Handle different response structures
        const data = responseData.data || responseData;
        
        setFormData({
          title: data.title || '',
          subject: data.subject || '',
          grade: data.grade || '',
          difficulty: data.difficulty || 'medium',
          description: data.description || '',
          content: data.content || '',
          pdfFile: null
        });
        
        setHasPdf(!!(data.pdfUrl || data.fileUrl));
        
      } catch (err) {
        console.error('Error fetching worksheet:', err);
        setError('Failed to load worksheet. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorksheet();
  }, [id, router]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, pdfFile: e.target.files![0] }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.title || !formData.subject || !formData.grade || !formData.description || !formData.content) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // Create FormData object for file upload
      const data = new FormData();
      data.append('title', formData.title);
      data.append('subject', formData.subject);
      data.append('grade', formData.grade);
      data.append('difficulty', formData.difficulty);
      data.append('description', formData.description);
      data.append('content', formData.content);
      if (formData.pdfFile) {
        data.append('worksheetFile', formData.pdfFile);
      }
      
      // Get token from localStorage with safety check
      const token = typeof window !== 'undefined' ? localStorage.getItem('practicegenius_token') : null;
      
      if (!token) {
        console.error('No authentication token found');
        router.push(`/auth/login?redirect=/admin/worksheets/${id}/edit`);
        return;
      }
      
      console.log('Sending update request for worksheet:', id);
      
      // Try direct backend API first to avoid Next.js API route issues
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/worksheets/${id}`;
      console.log('Sending update directly to backend:', backendUrl);
      
      // Send data to API
      const response = await fetch(backendUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });
      
      console.log('Update response status:', response.status);
      
      // Read the response body only once
      const responseData = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Authentication error, redirecting to login');
          router.push(`/auth/login?redirect=/admin/worksheets/${id}/edit`);
          return;
        }
        console.error('Error updating worksheet:', responseData);
        throw new Error(responseData.message || 'Failed to update worksheet');
      }
      
      console.log('Worksheet updated successfully:', responseData);
      
      setSuccess('Worksheet updated successfully');
      setIsSubmitting(false);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/worksheets');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating worksheet:', err);
      setError(err instanceof Error ? err.message : 'Failed to update worksheet. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Worksheet</h1>
            <Link 
              href="/admin/worksheets" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Back to Worksheets
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Worksheet Information</h2>
              <p className="text-sm text-gray-500">Update the details for this worksheet.</p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
                      <span className="block sm:inline">{error}</span>
                    </div>
                  )}
                  
                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4" role="alert">
                      <span className="block sm:inline">{success}</span>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      />
                    </div>
                    
                    {/* Subject and Grade */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                          Subject <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                        >
                          <option value="">Select a subject</option>
                          {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                          Grade Level <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="grade"
                          name="grade"
                          required
                          value={formData.grade}
                          onChange={handleChange}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                        >
                          <option value="">Select a grade level</option>
                          {grades.map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Difficulty */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Difficulty Level
                      </label>
                      <div className="mt-1 flex items-center space-x-4">
                        {['easy', 'medium', 'hard'].map((level) => (
                          <div key={level} className="flex items-center">
                            <input
                              id={level}
                              name="difficulty"
                              type="radio"
                              value={level}
                              checked={formData.difficulty === level}
                              onChange={handleChange}
                              className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                            />
                            <label htmlFor={level} className="ml-2 block text-sm text-gray-700">
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        required
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      />
                    </div>
                    
                    {/* Content */}
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Worksheet Content <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        rows={10}
                        required
                        value={formData.content}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm font-mono"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Format your content with markdown for better presentation.
                      </p>
                    </div>
                    
                    {/* PDF Upload */}
                    <div>
                      <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700">
                        PDF File
                      </label>
                      <div className="mt-1 flex items-center">
                        {hasPdf && !formData.pdfFile && (
                          <span className="mr-3 text-sm text-gray-500">
                            Current PDF file: <span className="font-medium">worksheet.pdf</span>
                          </span>
                        )}
                        <input
                          id="pdfFile"
                          name="pdfFile"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                        <label
                          htmlFor="pdfFile"
                          className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                        >
                          <span>{formData.pdfFile ? formData.pdfFile.name : 'Replace PDF'}</span>
                        </label>
                        {formData.pdfFile && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, pdfFile: null }))}
                            className="ml-2 text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Upload a new PDF file to replace the current one.
                      </p>
                    </div>
                    
                    <div className="flex justify-end">
                      <Link
                        href="/admin/worksheets"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 mr-3"
                      >
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : (
                          'Update Worksheet'
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditWorksheet;
