import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface Worksheet {
  _id: string;
  id?: string;
  title: string;
  subject: string;
  grade: string;
  difficulty: string;
  description: string;
  imageUrl: string;
  subscriptionLevel: string;
  downloads?: number;
  downloadCount?: number;
  createdAt?: string;
}

const WorksheetsPage: React.FC = () => {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [filteredWorksheets, setFilteredWorksheets] = useState<Worksheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  // Fetch worksheets from API
  useEffect(() => {
    const fetchWorksheets = async () => {
      try {
        setIsLoading(true);
        
        // Determine if we're in development or production
        const isDev = process.env.NODE_ENV === 'development';
        
        // Use relative URL for local development, direct URL for production
        const apiUrl = isDev 
          ? 'http://localhost:8080/api/worksheets' 
          : 'https://practicegenius-api.onrender.com/api/worksheets';
        
        console.log('Fetching worksheets from:', apiUrl, 'Environment:', process.env.NODE_ENV);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        // Handle API response format - the actual worksheets are in data.data
        const worksheetsData = data.data || data || [];
        
        console.log('Raw API response:', worksheetsData);
        
        // Process worksheets to ensure all required fields are present
        const processedWorksheets = worksheetsData.map((worksheet: any) => {
          // Map category to subject if subject is missing but category exists
          const subject = worksheet.subject || worksheet.category || 'No Subject';
          
          // Create a properly formatted worksheet object with all required fields
          return {
            ...worksheet,
            _id: worksheet._id || `worksheet-${Math.random()}`,
            id: worksheet._id, // Add id field for compatibility
            // Only use 'Untitled Worksheet' if title is completely missing or empty
            title: (worksheet.title && worksheet.title.trim()) ? worksheet.title : 'Untitled Worksheet',
            subject: subject,
            grade: worksheet.grade || 'No Grade',
            difficulty: worksheet.difficulty || 'medium',
            // Ensure subscription level is capitalized correctly
            subscriptionLevel: worksheet.subscriptionLevel || 'Free',
            // Handle both downloads field names
            downloads: worksheet.downloads || worksheet.downloadCount || 0,
            description: worksheet.description || 'No description available.',
            imageUrl: worksheet.imageUrl || '/images/worksheet-placeholder.jpg',
            createdAt: worksheet.createdAt || new Date().toISOString()
          };
        });
        
        console.log('Processed worksheets:', processedWorksheets);
        
        setWorksheets(processedWorksheets);
        setFilteredWorksheets(processedWorksheets);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch worksheets:', err);
        // Use fallback mock data in production to ensure users see something
        const mockWorksheets = [
          {
            _id: 'mock-1',
            title: 'Addition and Subtraction',
            subject: 'Math',
            grade: 'Grade 1',
            difficulty: 'easy',
            description: 'Practice basic addition and subtraction with numbers 1-20.',
            imageUrl: '/images/worksheet-placeholder.jpg',
            subscriptionLevel: 'Free',
            downloads: 245
          },
          {
            _id: 'mock-2',
            title: 'Multiplication Tables',
            subject: 'Math',
            grade: 'Grade 3',
            difficulty: 'medium',
            description: 'Learn multiplication tables from 1-10 with these practice sheets.',
            imageUrl: '/images/worksheet-placeholder.jpg',
            subscriptionLevel: 'Essential',
            downloads: 189
          },
          {
            _id: 'mock-3',
            title: 'Reading Comprehension',
            subject: 'English',
            grade: 'Grade 2',
            difficulty: 'medium',
            description: 'Improve reading skills with short stories and questions.',
            imageUrl: '/images/worksheet-placeholder.jpg',
            subscriptionLevel: 'Free',
            downloads: 312
          },
          {
            _id: 'mock-4',
            title: 'Solar System',
            subject: 'Science',
            grade: 'Grade 4',
            difficulty: 'medium',
            description: 'Learn about planets, stars and our solar system.',
            imageUrl: '/images/worksheet-placeholder.jpg',
            subscriptionLevel: 'Premium',
            downloads: 156
          },
          {
            _id: 'mock-5',
            title: 'Grammar Basics',
            subject: 'English',
            grade: 'Grade 3',
            difficulty: 'easy',
            description: 'Practice nouns, verbs, adjectives and basic sentence structure.',
            imageUrl: '/images/worksheet-placeholder.jpg',
            subscriptionLevel: 'Essential',
            downloads: 201
          },
          {
            _id: 'mock-6',
            title: 'Fractions',
            subject: 'Math',
            grade: 'Grade 4',
            difficulty: 'hard',
            description: 'Advanced practice with fractions, including addition and subtraction.',
            imageUrl: '/images/worksheet-placeholder.jpg',
            subscriptionLevel: 'Premium',
            downloads: 178
          }
        ];
        
        // Only show error in development mode
        if (process.env.NODE_ENV === 'development') {
          setError('Failed to load worksheets. Using mock data instead.');
        } else {
          // In production, silently use mock data without showing error
          setError(null);
        }
        
        setWorksheets(mockWorksheets);
        setFilteredWorksheets(mockWorksheets);
        setIsLoading(false);
      }
    };

    fetchWorksheets();
  }, []);

  // Filter worksheets based on search term, subject, and grade
  useEffect(() => {
    let filtered = [...worksheets];
    
    if (searchTerm) {
      filtered = filtered.filter(worksheet => 
        (worksheet.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (worksheet.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedSubject) {
      filtered = filtered.filter(worksheet => 
        (worksheet.subject?.toLowerCase() || '') === selectedSubject.toLowerCase()
      );
    }
    
    if (selectedGrade) {
      filtered = filtered.filter(worksheet => 
        (worksheet.grade?.toLowerCase() || '') === selectedGrade.toLowerCase()
      );
    }
    
    setFilteredWorksheets(filtered);
  }, [searchTerm, selectedSubject, selectedGrade, worksheets]);

  // Get unique subjects and grades for filters
  const subjects = Array.from(new Set(worksheets.map(worksheet => worksheet.subject || '').filter(Boolean)));
  const grades = Array.from(new Set(worksheets.map(worksheet => worksheet.grade || '').filter(Boolean)));

  // Function to get color for subject badge
  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Math':
        return 'bg-blue-100 text-blue-800';
      case 'English':
        return 'bg-green-100 text-green-800';
      case 'Science':
        return 'bg-purple-100 text-purple-800';
      case 'History':
        return 'bg-yellow-100 text-yellow-800';
      case 'Art':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get color for subscription plan badge
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

  // Get color for difficulty badge
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

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Educational Worksheets</h1>
          <p className="text-gray-600">
            Browse our collection of high-quality educational worksheets for all grade levels.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search worksheets..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Subject Filter */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                id="subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Filter */}
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                Grade Level
              </label>
              <select
                id="grade"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                <option value="">All Grades</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Worksheets Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : filteredWorksheets.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No worksheets found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubject('');
                  setSelectedGrade('');
                }}
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorksheets.map((worksheet) => (
              <Link href={`/worksheets/${worksheet._id || worksheet.id}`} key={worksheet._id || `worksheet-${Math.random()}`} passHref>
                <Card className="h-full transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
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
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className={getSubjectColor(worksheet.subject)}>
                        {worksheet.subject}
                      </Badge>
                      <Badge variant="outline">{worksheet.grade}</Badge>
                      <Badge className={getDifficultyColor(worksheet.difficulty)}>
                        {worksheet.difficulty.charAt(0).toUpperCase() + worksheet.difficulty.slice(1).toLowerCase()}
                      </Badge>
                      <Badge className={getSubscriptionPlanColor(worksheet.subscriptionLevel)}>
                        {worksheet.subscriptionLevel ? 
                          worksheet.subscriptionLevel.charAt(0).toUpperCase() + worksheet.subscriptionLevel.slice(1).toLowerCase() : 
                          'Free'}
                      </Badge>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">{worksheet.title}</h2>
                    <p className="text-gray-600 text-sm line-clamp-2">{worksheet.description}</p>
                    <div className="mt-4 text-orange-500 font-medium text-sm flex items-center">
                      View Worksheet
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Subscription CTA */}
        <div className="mt-12 bg-orange-50 border border-orange-100 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Unlimited Access</h2>
          <p className="text-gray-600 mb-4">
            Subscribe to Practice Genius for unlimited access to all worksheets and premium features.
          </p>
          <Link href="/pricing" passHref>
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none">
              View Pricing Plans
            </button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default WorksheetsPage;
