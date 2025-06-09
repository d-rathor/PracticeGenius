import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

interface Worksheet {
  id: string;
  title: string;
  subject: string;
  grade: string;
  difficulty: string;
  description: string;
  downloadCount: number;
  dateCreated: string;
  imageUrl: string;
}

const WorksheetsPage: React.FC = () => {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [filteredWorksheets, setFilteredWorksheets] = useState<Worksheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchWorksheets = async () => {
      try {
        // Check if we're in the browser
        if (typeof window !== 'undefined') {
          // First try to get worksheets from the API
          try {
            const response = await fetch('/api/worksheets');
            if (response.ok) {
              const data = await response.json();
              setWorksheets(data);
              setFilteredWorksheets(data);
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error fetching from API, falling back to localStorage:', error);
          }
          
          // Fallback to localStorage if API fails
          const storedWorksheets = localStorage.getItem('practicegenius_worksheets');
          if (storedWorksheets) {
            const parsedWorksheets = JSON.parse(storedWorksheets);
            setWorksheets(parsedWorksheets);
            setFilteredWorksheets(parsedWorksheets);
          } else {
            // Use mock data if nothing in localStorage
            const mockWorksheets = [
              {
                id: '1',
                title: 'Addition and Subtraction',
                subject: 'Math',
                grade: 'Grade 2',
                difficulty: 'Easy',
                description: 'Practice basic addition and subtraction with numbers 1-20.',
                downloadCount: 245,
                dateCreated: '2025-01-15',
                imageUrl: '/images/worksheets/math1.jpg'
              },
              {
                id: '2',
                title: 'Vocabulary Builder',
                subject: 'English',
                grade: 'Grade 3',
                difficulty: 'Medium',
                description: 'Expand your vocabulary with these word exercises.',
                downloadCount: 187,
                dateCreated: '2025-02-03',
                imageUrl: '/images/worksheets/english1.jpg'
              },
              {
                id: '3',
                title: 'Solar System Facts',
                subject: 'Science',
                grade: 'Grade 4',
                difficulty: 'Medium',
                description: 'Learn about planets and other objects in our solar system.',
                downloadCount: 312,
                dateCreated: '2025-03-12',
                imageUrl: '/images/worksheets/science1.jpg'
              }
            ];
            setWorksheets(mockWorksheets);
            setFilteredWorksheets(mockWorksheets);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching worksheets:', error);
        setIsLoading(false);
      }
    };

    fetchWorksheets();
  }, []);

  useEffect(() => {
    // Filter worksheets based on search query and filters
    if (!Array.isArray(worksheets)) {
      setFilteredWorksheets([]);
      return;
    }
    
    let filtered = [...worksheets];
    
    if (searchQuery) {
      filtered = filtered.filter(worksheet => 
        worksheet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worksheet.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedSubject) {
      filtered = filtered.filter(worksheet => worksheet.subject === selectedSubject);
    }
    
    if (selectedGrade) {
      filtered = filtered.filter(worksheet => worksheet.grade === selectedGrade);
    }
    
    setFilteredWorksheets(filtered);
  }, [searchQuery, selectedSubject, selectedGrade, worksheets]);

  const getSubjects = () => {
    if (!Array.isArray(worksheets)) return [];
    const subjects = new Set(worksheets.map(worksheet => worksheet.subject));
    return Array.from(subjects);
  };

  const getGrades = () => {
    if (!Array.isArray(worksheets)) return [];
    const grades = new Set(worksheets.map(worksheet => worksheet.grade));
    return Array.from(grades);
  };

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Worksheets</h1>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="Search worksheets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">All Subjects</option>
                  {getSubjects().map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  <option value="">All Grades</option>
                  {getGrades().map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorksheets.length > 0 ? (
              filteredWorksheets.map((worksheet) => (
                <Card key={worksheet.id} className="h-full flex flex-col">
                  <div className="h-40 bg-gray-200 rounded-t-lg overflow-hidden">
                    <img 
                      src={worksheet.imageUrl || '/images/worksheet-placeholder.jpg'} 
                      alt={worksheet.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/worksheet-placeholder.jpg';
                      }}
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">{worksheet.title}</h2>
                      <Badge variant="outline" className={getDifficultyColor(worksheet.difficulty)}>
                        {worksheet.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex space-x-2 mb-2">
                      <Badge className={getSubjectColor(worksheet.subject)}>
                        {worksheet.subject}
                      </Badge>
                      <Badge variant="outline">
                        {worksheet.grade}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{worksheet.description}</p>
                    <div className="text-xs text-gray-500">
                      <span>{worksheet.downloadCount} downloads</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 border-t">
                    <div className="flex justify-between items-center w-full">
                      <Link 
                        href={`/dashboard/worksheets/${worksheet.id}`} 
                        className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                      >
                        View Details
                      </Link>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded text-sm transition duration-300">
                        Download
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 text-center">
                <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">No worksheets found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSubject('');
                    setSelectedGrade('');
                  }}
                  className="mt-4 text-orange-500 hover:text-orange-600 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WorksheetsPage;
