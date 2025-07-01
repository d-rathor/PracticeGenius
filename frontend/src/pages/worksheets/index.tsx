import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import WorksheetSidebar from '@/components/worksheets/WorksheetSidebar';
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
  previewUrl?: string;
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
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  useEffect(() => {
    const loadWorksheets = async () => {
      try {
        setIsLoading(true);
        const response = await WorksheetService.getWorksheets({});
        const worksheetsData = response || [];

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
          imageUrl: worksheet.imageUrl || '/images/Worksheet-logo-image.png',
          previewUrl: worksheet.previewUrl,
          createdAt: worksheet.createdAt || new Date().toISOString()
        }));

        setWorksheets(processedWorksheets);
        setFilteredWorksheets(processedWorksheets);
      } catch (err) {
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

  const categories = worksheets.reduce((acc, worksheet) => {
    const { subject, grade } = worksheet;
    if (subject && grade && subject !== 'No Subject' && grade !== 'No Grade') {
      if (!acc[subject]) {
        acc[subject] = [];
      }
      if (!acc[subject].includes(grade)) {
        acc[subject].push(grade);
      }
    }
    return acc;
  }, {} as { [subject: string]: string[] });

  const getSubjectColor = (subject: string) => {
    switch (subject?.toLowerCase()) {
      case 'math': return 'bg-blue-100 text-blue-800';
      case 'english': return 'bg-green-100 text-green-800';
      case 'science': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionLevelColor = (level: string | undefined): string => {
    if (!level) return 'bg-gray-100 text-gray-800';
    switch (level.toLowerCase()) {
      case 'free':
        return 'bg-green-100 text-green-800';
      case 'essential':
        return 'bg-blue-100 text-blue-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const handleSubjectSelect = (subject: string | null) => {
    setSelectedSubject(subject);
    setSelectedGrade(null); // Reset grade when subject changes
  };

  const handleGradeSelect = (grade: string | null) => {
    setSelectedGrade(grade);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Educational Worksheets</h1>
          <p className="text-gray-600">Browse our collection of high-quality educational worksheets.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 flex-shrink-0">
            <WorksheetSidebar
              categories={categories}
              selectedSubject={selectedSubject}
              selectedGrade={selectedGrade}
              onSubjectSelect={handleSubjectSelect}
              onGradeSelect={handleGradeSelect}
            />
          </aside>

          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredWorksheets.map((worksheet) => (
                  <Link key={worksheet._id} href={`/worksheets/${worksheet._id}`} passHref>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                      <img src={worksheet.previewUrl || worksheet.imageUrl} alt={worksheet.title} className="w-full h-40 object-cover object-top rounded-t-lg" />
                      <CardContent className="p-4 flex flex-col flex-grow">
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{worksheet.title}</h3>
                            <Badge className={getSubscriptionLevelColor(worksheet.subscriptionLevel)}>
                              {worksheet.subscriptionLevel ?
                                worksheet.subscriptionLevel.charAt(0).toUpperCase() + worksheet.subscriptionLevel.slice(1).toLowerCase() :
                                'Free'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{worksheet.description}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between text-sm text-gray-600">
                            <Badge className={getSubjectColor(worksheet.subject)}>{worksheet.subject}</Badge>
                            <Badge className={getDifficultyColor(worksheet.difficulty)}>{worksheet.difficulty}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>

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
