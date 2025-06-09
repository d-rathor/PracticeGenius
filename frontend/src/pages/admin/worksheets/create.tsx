import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import api from '@/lib/api';
import { withAuth } from '@/contexts/AuthContext';

interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  isActive: boolean;
  isPopular?: boolean;
}

interface WorksheetFormData {
  title: string;
  subject: string;
  grade: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  content: string;
  pdfFile: File | null;
  subscriptionPlanId: string;
}

const CreateWorksheet: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<WorksheetFormData>({
    title: '',
    subject: '',
    grade: '',
    difficulty: 'medium',
    description: '',
    content: '',
    pdfFile: null,
    subscriptionPlanId: ''
  });
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription plans when component mounts
  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setIsLoading(true);
        // Direct fetch instead of using API client to avoid authentication issues
        const response = await fetch('/api/admin/subscription-plans');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch subscription plans: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Fetched subscription plans:', data);
        
        // Filter only active plans
        const activePlans = Array.isArray(data) ? data.filter(plan => plan.isActive) : [];
        console.log('Active plans:', activePlans);
        
        setSubscriptionPlans(activePlans);
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
        setError('Failed to load subscription plans. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionPlans();
  }, []);

  // Common subjects and grades for dropdown options
  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Art', 'Music', 'Physical Education'];
  const grades = ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'];

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
    
    console.log('Form data being submitted:', formData);
    
    // Validate form data
    if (!formData.title || !formData.subject || !formData.grade || !formData.description || !formData.content || !formData.subscriptionPlanId) {
      console.log('Form validation failed. Missing fields:', {
        title: !formData.title,
        subject: !formData.subject,
        grade: !formData.grade,
        description: !formData.description,
        content: !formData.content,
        subscriptionPlanId: !formData.subscriptionPlanId
      });
      setError('Please fill in all required fields, including subscription plan');
      return;
    }
    
    // Validate file upload
    if (!formData.pdfFile) {
      console.log('No file selected');
      setError('Please upload a worksheet file');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create FormData object for file upload
      const data = new FormData();
      data.append('title', formData.title);
      data.append('subject', formData.subject);
      data.append('grade', formData.grade);
      data.append('difficulty', formData.difficulty);
      data.append('description', formData.description);
      data.append('content', formData.content);
      data.append('subscriptionPlanId', formData.subscriptionPlanId);
      if (formData.pdfFile) {
        // Use 'file' instead of 'pdfFile' to match backend expectations
        data.append('file', formData.pdfFile);
      }
      
      // Send data to API
      console.log('Sending form data to API...');
      let response;
      try {
        // Get token from localStorage with safety check
        const token = typeof window !== 'undefined' ? localStorage.getItem('practicegenius_token') : null;
        
        if (!token) {
          console.error('No authentication token found');
          setError('You must be logged in to create worksheets');
          setIsSubmitting(false);
          return;
        }
        
        response = await fetch('/api/admin/worksheets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: data
        });
        
        console.log('API response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log('Authentication error, redirecting to login');
            setIsSubmitting(false);
            router.push('/auth/login?redirect=/admin/worksheets/create');
            return;
          }
          
          // Try to parse error response
          let errorMessage = 'Failed to create worksheet';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            console.error('API error response:', errorData);
          } catch (parseError) {
            console.error('Could not parse error response:', parseError);
            // Try to get text instead
            try {
              const errorText = await response.text();
              console.error('API error text:', errorText);
              errorMessage = errorText || errorMessage;
            } catch (textError) {
              console.error('Could not get error text either:', textError);
            }
          }
          throw new Error(errorMessage);
        }
        
        // Successfully created worksheet
        console.log('Worksheet created successfully');
        
        // Show success message
        setError(null);
        setIsSubmitting(false);
        
        // Use setTimeout to delay the redirect slightly to ensure state updates complete
        setTimeout(() => {
          router.push('/admin/worksheets');
        }, 100);
        
        return; // Exit early after successful submission
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to create worksheet');
        setIsSubmitting(false);
      }
      
    } catch (err) {
      console.error('Error creating worksheet:', err);
      setError(err instanceof Error ? err.message : 'Failed to create worksheet. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Create New Worksheet</h1>
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
              <p className="text-sm text-gray-500">Fill in the details for the new worksheet.</p>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
                  <span className="block sm:inline">{error}</span>
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
                    placeholder="Enter worksheet title"
                  />
                </div>
                
                {/* Subject, Grade, and Subscription Plan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <div>
                    <label htmlFor="subscriptionPlanId" className="block text-sm font-medium text-gray-700">
                      Subscription Plan <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subscriptionPlanId"
                      name="subscriptionPlanId"
                      required
                      value={formData.subscriptionPlanId}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                      disabled={isLoading || subscriptionPlans.length === 0}
                    >
                      <option value="">Select a subscription plan</option>
                      {subscriptionPlans.map(plan => (
                        <option key={plan._id} value={plan._id}>{plan.name} (${plan.price.monthly}/mo)</option>
                      ))}
                    </select>
                    {isLoading && (
                      <p className="mt-1 text-xs text-gray-500">Loading subscription plans...</p>
                    )}
                    {!isLoading && subscriptionPlans.length === 0 && (
                      <p className="mt-1 text-xs text-red-500">No active subscription plans found. Please create one first.</p>
                    )}
                  </div>
                </div>
                
                {/* Difficulty */}
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                    Difficulty Level
                  </label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        id="easy"
                        name="difficulty"
                        type="radio"
                        value="easy"
                        checked={formData.difficulty === 'easy'}
                        onChange={handleChange}
                        className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                      />
                      <label htmlFor="easy" className="ml-2 block text-sm text-gray-700">
                        Easy
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="medium"
                        name="difficulty"
                        type="radio"
                        value="medium"
                        checked={formData.difficulty === 'medium'}
                        onChange={handleChange}
                        className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                      />
                      <label htmlFor="medium" className="ml-2 block text-sm text-gray-700">
                        Medium
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="hard"
                        name="difficulty"
                        type="radio"
                        value="hard"
                        checked={formData.difficulty === 'hard'}
                        onChange={handleChange}
                        className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                      />
                      <label htmlFor="hard" className="ml-2 block text-sm text-gray-700">
                        Hard
                      </label>
                    </div>
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
                    placeholder="Enter a brief description of the worksheet"
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
                    placeholder="Enter the worksheet content or questions"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Format your content with markdown for better presentation. Use ## for headings, * for bullet points, etc.
                  </p>
                </div>
                
                {/* PDF Upload */}
                <div>
                  <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700">
                    PDF File (Optional)
                  </label>
                  <div className="mt-1 flex items-center">
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
                      <span>{formData.pdfFile ? formData.pdfFile.name : 'Upload PDF'}</span>
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
                    Upload a PDF version of the worksheet for download.
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
                        Creating...
                      </>
                    ) : (
                      'Create Worksheet'
                    )}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

// Wrap component with withAuth HOC and set adminOnly to true
export default withAuth(CreateWorksheet, true);
