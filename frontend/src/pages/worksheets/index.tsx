import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import WorksheetService from '@/services/worksheet.service';

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

  useEffect(() => {
    const loadWorksheets = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching worksheets using WorksheetService...');
        const response = await WorksheetService.getWorksheets({});
        const worksheetsData = response || []; // response is already Worksheet[]
        console.log('Raw API response from WorksheetService:', worksheetsData);

        const processedWorksheets = worksheetsData.map((worksheet: any) => ({
          ...worksheet,
          _id: worksheet._id || `worksheet-${Math.random()}`,
          id: worksheet._id,
          title: (worksheet.title && worksheet.title.trim()) ? worksheet.title : 'Untitled Worksheet',
          subject: worksheet.subject || worksheet.category || 'No Subject',
          grade: worksheet.grade || 'No Grade',
          difficulty: worksheet.difficulty || 'medium',
          subscriptionLevel: worksheet.subscriptionLevel || 'Free',
          downloads: worksheet.downloads || worksheet.downloadCount || 0,
          description: worksheet.description || 'No description available.',
          imageUrl: worksheet.imageUrl || '/images/worksheet-placeholder.jpg',
          createdAt: worksheet.createdAt || new Date().toISOString()
        }));

        console.log('Processed worksheets:', processedWorksheets);
        setWorksheets(processedWorksheets);
        setFilteredWorksheets(processedWorksheets);
      } catch (err) {
        console.error('Failed to fetch worksheets via WorksheetService:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadWorksheets();
  }, []);

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

  const subjects = Array.from(new Set(worksheets.map(w => w.subject).filter(Boolean)));
  const grades = Array.from(new Set(worksheets.map(w => w.grade).filter(Boolean)));

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Math': return 'bg-blue-100 text-blue-800';
      case 'English': return 'bg-green-100 text-green-800';
      case 'Science': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionPlanColor = (plan: string) => {
    const normalizedPlan = plan?.toLowerCase() || 'free';
    switch (normalizedPlan) {
      case 'essential': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'premium': return 'bg-purple-100 text-purple-800 border border-purple-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string | undefined): string => {
    if (!difficulty) return 'bg-gray-100 text-gray-800';
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Educational Worksheets</h1>
          <p className="text-gray-600">Browse our collection of high-quality educational worksheets.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                id="search"
                placeholder="Search worksheets..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                id="subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
              <select
                id="grade"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                <option value="">All Grades</option>
                {grades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
              </select>
            </div>
          </div>
        </div>

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
            <p className="text-gray-500">No worksheets found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorksheets.map((worksheet) => (
              <Link key={worksheet._id} href={`/worksheets/${worksheet._id}`} passHref>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                  <img src={worksheet.imageUrl} alt={worksheet.title} className="w-full h-48 object-cover rounded-t-lg" />
                  <CardContent className="p-4 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{worksheet.title}</h3>
                        <Badge className={getSubscriptionPlanColor(worksheet.subscriptionLevel)}>
                          {worksheet.subscriptionLevel ?
                            worksheet.subscriptionLevel.charAt(0).toUpperCase() + worksheet.subscriptionLevel.slice(1).toLowerCase() :
                            'Free'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{worksheet.description}</p>
                    </div>
                    <div className="mt-auto pt-2">
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                            <Badge className={getDifficultyColor(worksheet.difficulty)}>{worksheet.difficulty}</Badge>
                            <Badge className={getSubjectColor(worksheet.subject)}>{worksheet.subject}</Badge>
                        </div>
                        <div className="text-orange-500 font-medium text-sm flex items-center">
                            View Worksheet
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
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
