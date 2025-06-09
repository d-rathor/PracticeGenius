import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

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

  useEffect(() => {
    if (!id) return;

    const fetchWorksheet = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would be an API call
        if (typeof window !== 'undefined') {
          // First try to get worksheet from the API
          try {
            const response = await fetch(`/api/worksheets/${id}`);
            if (response.ok) {
              const data = await response.json();
              setWorksheet(data);
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error fetching from API, falling back to localStorage:', error);
          }
          
          // Fallback to localStorage
          const storedWorksheets = localStorage.getItem('practicegenius_worksheets');
          if (storedWorksheets) {
            const parsedWorksheets = JSON.parse(storedWorksheets);
            const foundWorksheet = parsedWorksheets.find((w: any) => w.id === id);
            
            if (foundWorksheet) {
              setWorksheet(foundWorksheet);
            } else {
              setError('Worksheet not found');
            }
          } else {
            // Mock data for specific worksheet
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
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching worksheet:', error);
        setError('Failed to load worksheet');
        setIsLoading(false);
      }
    };

    fetchWorksheet();
  }, [id]);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty?.toLowerCase()) {
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

  const getSubjectColor = (subject: string): string => {
    switch (subject?.toLowerCase()) {
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
    // In a real app, this would initiate a download
    console.log('Downloading worksheet:', worksheet?.title);
    alert('Download started!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Link 
            href="/dashboard/worksheets" 
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
                href="/dashboard/worksheets" 
                className="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition duration-300"
              >
                Browse All Worksheets
              </Link>
            </CardContent>
          </Card>
        ) : worksheet ? (
          <>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Worksheet Preview */}
              <div className="md:w-1/3">
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
                    <div className="flex space-x-2">
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
                    <button 
                      onClick={handleDownload}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition duration-300 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Worksheet
                    </button>
                  </CardContent>
                </Card>
              </div>

              {/* Worksheet Details */}
              <div className="md:w-2/3">
                <Card className="h-full">
                  <CardHeader>
                    <h1 className="text-2xl font-bold text-gray-900">{worksheet.title}</h1>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <h2 className="text-lg font-semibold mb-2">Description</h2>
                      <p className="mb-6">{worksheet.description}</p>
                      
                      <h2 className="text-lg font-semibold mb-2">Preview</h2>
                      <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6">
                        <p className="text-gray-600">{worksheet.content}</p>
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
            <Card className="mt-6">
              <CardHeader>
                <h2 className="text-xl font-semibold">Related Worksheets</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 flex items-center">
                    <div className="h-16 w-16 bg-gray-200 rounded mr-4 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-medium">Multiplication Basics</h3>
                      <p className="text-sm text-gray-500">Math • Grade 3</p>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 flex items-center">
                    <div className="h-16 w-16 bg-gray-200 rounded mr-4 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-medium">Number Patterns</h3>
                      <p className="text-sm text-gray-500">Math • Grade 2</p>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 flex items-center">
                    <div className="h-16 w-16 bg-gray-200 rounded mr-4 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-medium">Counting Money</h3>
                      <p className="text-sm text-gray-500">Math • Grade 2</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default WorksheetDetailPage;
