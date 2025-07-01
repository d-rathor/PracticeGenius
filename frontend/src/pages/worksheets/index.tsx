import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import NewWorksheetFilter from '@/components/worksheets/NewWorksheetFilter';
import Link from 'next/link';
import WorksheetService from '@/services/worksheet.service';
import { FiFilter } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';

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
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  
  // Mobile filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
      filtered = filtered.filter(w =>
        (w.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (w.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    if (selectedSubject) {
      filtered = filtered.filter(w => (w.subject?.toLowerCase() || '') === selectedSubject.toLowerCase());
    }
    if (selectedGrade) {
      filtered = filtered.filter(w => (w.grade?.toLowerCase() || '') === selectedGrade.toLowerCase());
    }
    if (selectedDifficulty) {
      filtered = filtered.filter(w => (w.difficulty?.toLowerCase() || '') === selectedDifficulty.toLowerCase());
    }
    setFilteredWorksheets(filtered);
  }, [searchTerm, selectedSubject, selectedGrade, selectedDifficulty, worksheets]);

  const categories = worksheets.reduce((acc, worksheet) => {
    const { subject, grade } = worksheet;
    if (subject && grade && subject !== 'No Subject' && grade !== 'No Grade') {
      if (!acc[subject]) acc[subject] = [];
      if (!acc[subject].includes(grade)) acc[subject].push(grade);
    }
    return acc;
  }, {} as { [subject: string]: string[] });

  const difficulties = ['easy', 'medium', 'hard'];

  const handleClearFilters = () => {
    setSelectedSubject(null);
    setSelectedGrade(null);
    setSelectedDifficulty(null);
    setSearchTerm('');
  };

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
      case 'free': return 'bg-green-100 text-green-800';
      case 'essential': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
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

  const filterProps = {
    categories,
    difficulties,
    selectedSubject,
    selectedGrade,
    selectedDifficulty,
    onSubjectSelect: (subject: string | null) => {
      setSelectedSubject(subject);
      setSelectedGrade(null); // Reset grade when subject changes
    },
    onGradeSelect: setSelectedGrade,
    onDifficultySelect: setSelectedDifficulty,
    onClearFilters: handleClearFilters,
  };

  return (
    <MainLayout>
      {/* Mobile Filter Panel */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsFilterOpen(false)}></div>
      )}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Filters</h2>
            <button onClick={() => setIsFilterOpen(false)} className="p-1">
              <IoClose size={24} />
            </button>
          </div>
          <NewWorksheetFilter {...filterProps} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Educational Worksheets</h1>
          <p className="text-lg text-gray-600">Browse our collection of high-quality educational worksheets.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-full md:w-64 lg:w-72 flex-shrink-0">
            <NewWorksheetFilter {...filterProps} />
          </aside>

          <main className="flex-1">
            {/* Search and Mobile Filter Button */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="relative w-full">
                <input
                  type="text"
                  id="search"
                  placeholder="Search worksheets by title or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                </span>
              </div>
              <button 
                onClick={() => setIsFilterOpen(true)} 
                className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-full bg-white text-gray-700 hover:bg-gray-50"
              >
                <FiFilter />
                <span>Filters</span>
              </button>
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
                <p className="text-gray-500 text-lg">No worksheets found.</p>
                <p className="text-gray-400">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredWorksheets.map((worksheet) => (
                  <Link key={worksheet._id} href={`/worksheets/${worksheet._id}`} passHref>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 flex flex-col h-full bg-white rounded-lg overflow-hidden">
                      <img src={worksheet.previewUrl || worksheet.imageUrl} alt={worksheet.title} className="w-full h-40 object-cover object-top" />
                      <CardContent className="p-4 flex flex-col flex-grow">
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">{worksheet.title}</h3>
                            <Badge className={`${getSubscriptionLevelColor(worksheet.subscriptionLevel)} flex-shrink-0`}>
                              {worksheet.subscriptionLevel ? worksheet.subscriptionLevel.charAt(0).toUpperCase() + worksheet.subscriptionLevel.slice(1).toLowerCase() : 'Free'}
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
        <div className="mt-12 bg-orange-50 border border-orange-100 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Your Full Potential</h2>
          <p className="text-gray-600 mb-4">Subscribe for unlimited access to all worksheets and premium features.</p>
          <Link href="/pricing" passHref>
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none">
              View Pricing Plans
            </button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default WorksheetsPage;
