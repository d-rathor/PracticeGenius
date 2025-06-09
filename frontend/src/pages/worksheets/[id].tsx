import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';

interface Worksheet {
  id: string;
  title: string;
  subject: string;
  grade: string;
  difficulty: string;
  description: string;
  content: string;
  downloadCount: number;
  dateCreated: string;
  imageUrl: string;
}

const WorksheetDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthContext();

  // Authentication state is now handled by useAuthContext

  useEffect(() => {
    if (!id) return;

    const fetchWorksheet = async () => {
      try {
        setIsLoading(true);
        
        // Use mock data directly in development to avoid API call errors
        if (process.env.NODE_ENV === 'development') {
          const mockWorksheet = {
            id: id as string,
            title: 'Addition and Subtraction',
            subject: 'Math',
            grade: 'Grade 2',
            difficulty: 'Easy',
            description: 'Practice basic addition and subtraction with numbers 1-20. This worksheet includes 20 problems with increasing difficulty to help students master these fundamental math skills.',
            content: 'This is the content of the worksheet. In a real application, this would contain the actual worksheet content or a link to a PDF file.',
            downloadCount: 245,
            dateCreated: '2025-01-15',
            imageUrl: '/images/worksheets/math1.jpg'
          };
          setWorksheet(mockWorksheet);
          setIsLoading(false);
          return;
        }
        
        // Only try the API call if not in development
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/worksheets/${id}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setWorksheet(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch worksheet:', err);
        setError('Failed to load worksheet. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchWorksheet();
  }, [id]);

  const getDifficultyColor = (difficulty: string | undefined): string => {
    if (!difficulty) return 'bg-gray-100 text-gray-800';
    
    switch (difficulty.toLowerCase()) {
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

  const getSubjectColor = (subject: string | undefined): string => {
    if (!subject) return 'bg-gray-100 text-gray-800';
    
    switch (subject.toLowerCase()) {
      case 'math':
        return 'bg-blue-100 text-blue-800';
      case 'english':
        return 'bg-green-100 text-green-800';
      case 'science':
        return 'bg-purple-100 text-purple-800';
      case 'social studies':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    // In a real app, this would check authentication status and then initiate a download
    console.log('Downloading worksheet:', worksheet?.title);
    
    // For now, just show an alert in development mode
    if (process.env.NODE_ENV === 'development') {
      alert('Download started!');
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link 
            href="/worksheets" 
            className="text-orange-500 hover:text-orange-600 mr-2 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Worksheets
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="text-center py-12">
              <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
              <p className="text-gray-500">The worksheet you're looking for could not be found or there was an error loading it.</p>
              <Link 
                href="/worksheets" 
                className="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition duration-300"
              >
                Browse All Worksheets
              </Link>
            </CardContent>
          </Card>
        ) : worksheet ? (
          <>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Worksheet Preview */}
              <div className="lg:w-1/3">
                <Card className="h-full">
                  <div className="h-64 bg-gray-200 rounded-t-lg overflow-hidden">
                    <img 
                      src={worksheet.imageUrl || '/images/worksheet-placeholder.jpg'} 
                      alt={worksheet.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/worksheet-placeholder.jpg';
                      }}
                    />
                  </div>
                  <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge className={getSubjectColor(worksheet.subject)}>
                        {worksheet.subject}
                      </Badge>
                      <Badge variant="outline">
                        {worksheet.grade}
                      </Badge>
                      <Badge className={getDifficultyColor(worksheet.difficulty)}>
                        {worksheet.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      <span>{worksheet.downloadCount} downloads</span>
                      <span className="mx-2">•</span>
                      <span>Created {formatDate(worksheet.dateCreated)}</span>
                    </p>
                    
                    {isAuthenticated ? (
                      <button 
                        onClick={handleDownload}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition duration-300 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Worksheet
                      </button>
                    ) : (
                      <div className="space-y-3 w-full">
                        <Link 
                          href={`/auth/login?redirect=${encodeURIComponent(`/worksheets/${id}`)}`}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition duration-300 flex items-center justify-center"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          Log in to Download
                        </Link>
                        <Link 
                          href="/pricing"
                          className="w-full border border-orange-500 text-orange-500 hover:bg-orange-50 py-2 px-4 rounded transition duration-300 flex items-center justify-center"
                        >
                          View Subscription Plans
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Worksheet Details */}
              <div className="lg:w-2/3">
                <Card className="h-full">
                  <CardHeader>
                    <h1 className="text-2xl font-bold text-gray-900">{worksheet.title}</h1>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <h2 className="text-lg font-semibold mb-2">Description</h2>
                      <p className="mb-6">{worksheet.description}</p>
                      
                      <h2 className="text-lg font-semibold mb-2">Preview</h2>
                      <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white flex items-end justify-center pb-4">
                          <div className="text-center">
                            <p className="font-medium text-gray-900 mb-2">Log in or subscribe to view full content</p>
                            <Link 
                              href="/pricing"
                              className="inline-block bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition duration-300"
                            >
                              View Pricing Plans
                            </Link>
                          </div>
                        </div>
                        <p className="text-gray-600 blur-sm select-none">{worksheet.content}</p>
                      </div>
                      
                      <h2 className="text-lg font-semibold mb-2">Learning Objectives</h2>
                      <ul className="list-disc pl-5 space-y-1 mb-6">
                        <li>Master basic addition with numbers 1-20</li>
                        <li>Practice subtraction skills</li>
                        <li>Develop mental math abilities</li>
                        <li>Build confidence in solving math problems</li>
                      </ul>
                      
                      <h2 className="text-lg font-semibold mb-2">Instructions</h2>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Download the worksheet by clicking the button</li>
                        <li>Print on standard letter-sized paper</li>
                        <li>Allow students 20-30 minutes to complete</li>
                        <li>Review answers together as a class</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Related Worksheets */}
            <Card className="mt-8">
              <CardHeader>
                <h2 className="text-xl font-semibold">Related Worksheets</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/worksheets/2" className="border rounded-lg p-4 flex items-center hover:bg-gray-50 transition-colors">
                    <div className="h-16 w-16 bg-gray-200 rounded mr-4 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-medium">Multiplication Basics</h3>
                      <p className="text-sm text-gray-500">Math • Grade 3</p>
                    </div>
                  </Link>
                  <Link href="/worksheets/3" className="border rounded-lg p-4 flex items-center hover:bg-gray-50 transition-colors">
                    <div className="h-16 w-16 bg-gray-200 rounded mr-4 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-medium">Number Patterns</h3>
                      <p className="text-sm text-gray-500">Math • Grade 2</p>
                    </div>
                  </Link>
                  <Link href="/worksheets/4" className="border rounded-lg p-4 flex items-center hover:bg-gray-50 transition-colors">
                    <div className="h-16 w-16 bg-gray-200 rounded mr-4 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-medium">Counting Money</h3>
                      <p className="text-sm text-gray-500">Math • Grade 2</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Subscribe CTA */}
            {!isAuthenticated && (
              <div className="mt-8 bg-orange-50 border border-orange-100 rounded-lg p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Unlimited Access</h2>
                <p className="text-gray-600 mb-4">
                  Subscribe to Practice Genius for unlimited access to all worksheets and premium features.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/pricing" 
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none"
                  >
                    View Pricing Plans
                  </Link>
                  <Link 
                    href={`/auth/login?redirect=${encodeURIComponent(`/worksheets/${id}`)}`}
                    className="inline-flex items-center px-6 py-3 border border-orange-500 text-base font-medium rounded-md text-orange-500 bg-white hover:bg-orange-50 focus:outline-none"
                  >
                    Log In
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </MainLayout>
  );
};

export default WorksheetDetailPage;
