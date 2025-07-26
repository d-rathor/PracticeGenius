import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import WorksheetService from '@/services/worksheet.service';
import { Worksheet } from '@/types/worksheet';
import Link from 'next/link';
import Image from 'next/image';

const AllWorksheetsPage = () => {
  const [allWorksheets, setAllWorksheets] = useState<Worksheet[]>([]);
  const [filteredWorksheets, setFilteredWorksheets] = useState<Worksheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);

  useEffect(() => {
    const fetchWorksheets = async () => {
      setLoading(true);
      try {
        const response = await WorksheetService.getWorksheets({});
        setAllWorksheets(response.data || []);
      } catch (err) {
        setError('Failed to fetch worksheets.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorksheets();
  }, []);

  useEffect(() => {
    let worksheets = [...allWorksheets];

    if (searchTerm) {
      worksheets = worksheets.filter(ws =>
        ws.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSubjects.length > 0) {
      worksheets = worksheets.filter(ws => selectedSubjects.includes(ws.subject));
    }

    if (selectedGrades.length > 0) {
      worksheets = worksheets.filter(ws => selectedGrades.includes(ws.grade));
    }

    if (selectedDifficulties.length > 0) {
      worksheets = worksheets.filter(ws => selectedDifficulties.includes(ws.difficulty));
    }

    setFilteredWorksheets(worksheets);
  }, [searchTerm, selectedSubjects, selectedGrades, selectedDifficulties, allWorksheets]);

  const handleFilterChange = (filterType: 'subjects' | 'grades' | 'difficulties', value: string) => {
    const setters = {
      subjects: setSelectedSubjects,
      grades: setSelectedGrades,
      difficulties: setSelectedDifficulties,
    };
    const states = {
      subjects: selectedSubjects,
      grades: selectedGrades,
      difficulties: selectedDifficulties,
    };

    const setter = setters[filterType];
    const state = states[filterType];

    if (state.includes(value)) {
      setter(state.filter(item => item !== value));
    } else {
      setter([...state, value]);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubjects([]);
    setSelectedGrades([]);
    setSelectedDifficulties([]);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const uniqueSubjects = useMemo(() => Array.from(new Set(allWorksheets.map(ws => ws.subject))).sort(), [allWorksheets]);
  const uniqueGrades = useMemo(() => Array.from(new Set(allWorksheets.map(ws => ws.grade))).sort(), [allWorksheets]);
  const uniqueDifficulties = useMemo(() => Array.from(new Set(allWorksheets.map(ws => ws.difficulty))).sort(), [allWorksheets]);

  const FiltersPanel = () => (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <h2 className="text-2xl font-bold">Filters</h2>
        <button onClick={clearFilters} className="text-orange-500 hover:underline">Clear All</button>
      </div>
      <div className="flex-grow overflow-y-auto">
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Subject</h3>
          {uniqueSubjects.map(subject => (
            <div key={subject} className="flex items-center">
              <input type="checkbox" id={`subject-${subject}`} value={subject} className="mr-2" onChange={() => handleFilterChange('subjects', subject)} checked={selectedSubjects.includes(subject)} />
              <label htmlFor={`subject-${subject}`}>{subject}</label>
            </div>
          ))}
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Grade</h3>
          {uniqueGrades.map(grade => (
            <div key={grade} className="flex items-center">
              <input type="checkbox" id={`grade-${grade}`} value={grade} className="mr-2" onChange={() => handleFilterChange('grades', grade)} checked={selectedGrades.includes(grade)} />
              <label htmlFor={`grade-${grade}`}>{grade}</label>
            </div>
          ))}
        </div>
        <div>
          <h3 className="font-semibold mb-2">Difficulty</h3>
          {uniqueDifficulties.map(difficulty => (
            <div key={difficulty} className="flex items-center">
              <input type="checkbox" id={`difficulty-${difficulty}`} value={difficulty} className="mr-2" onChange={() => handleFilterChange('difficulties', difficulty)} checked={selectedDifficulties.includes(difficulty)} />
              <label htmlFor={`difficulty-${difficulty}`}>{difficulty}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto pt-4 border-t md:hidden">
        <button onClick={() => setIsFilterOpen(false)} className="w-full bg-orange-500 text-white py-2 rounded-lg">View Results</button>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Educational Worksheets</h1>
          <p className="text-lg text-gray-600 mt-2">Browse our collection of high-quality educational worksheets.</p>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search worksheets by title or description..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <button onClick={() => setIsFilterOpen(true)} className="w-full border border-gray-300 rounded-lg p-2 flex justify-center items-center font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>
            Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-full md:w-1/4">
            <div className="sticky top-8">
              <FiltersPanel />
            </div>
          </aside>

          {/* Mobile Filter Modal */}
          {isFilterOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsFilterOpen(false)}></div>}
          <div className={`fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white z-50 transform ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out p-6 md:hidden`}>
            <FiltersPanel />
          </div>

          <main className="w-full md:w-3/4">
            {loading ? (
              <div className="text-center p-8">Loading worksheets...</div>
            ) : error ? (
              <div className="text-center p-8 text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorksheets.length > 0 ? filteredWorksheets.map(ws => (
                  <div key={ws.id} className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                     <Link href={`/worksheets/${ws.id}`} legacyBehavior>
                      <a>
                        <Image src={ws.previewUrl || '/images/General-worksheet.png'} alt={ws.title} width={500} height={500} className="w-full h-48 object-cover" />
                      </a>
                    </Link>
                    <div className="p-4">
                      <h3 className="font-bold text-lg truncate">{ws.title}</h3>
                      <p className="text-gray-600 text-sm mt-1 truncate">{ws.description}</p>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">{ws.subject}</span>
                        <span className="px-2 py-1 text-xs font-semibold text-white bg-orange-500 rounded-full">{ws.difficulty}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="col-span-full text-center text-gray-500">No worksheets found matching your criteria.</p>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </MainLayout>
  );
};

export default AllWorksheetsPage;

