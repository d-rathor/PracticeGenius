import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import withAuth from '@/components/hoc/withAuth';
import WorksheetService from '@/services/worksheet.service';
import { Worksheet } from '@/types/worksheet';
import { toast } from 'react-hot-toast';

const BulkDeletePage: NextPage = () => {
  // State for worksheets and pagination
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalWorksheets, setTotalWorksheets] = useState(0);
  const worksheetsPerPage = 10;
  
  // State for filters
  const [filters, setFilters] = useState({
    subject: '',
    grade: '',
    subscriptionLevel: undefined as undefined | 'Free' | 'Essential' | 'Premium',
    search: ''
  });
  
  // State for bulk delete
  const [selectedWorksheets, setSelectedWorksheets] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Available subjects and grades for filter dropdowns
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);

  // Fetch worksheets with pagination
  const fetchWorksheets = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await WorksheetService.getWorksheets({
        ...filters,
        page: currentPage,
        limit: worksheetsPerPage
      });
      
      const worksheetsData = response.data || [];
      setWorksheets(worksheetsData);
      setTotalWorksheets(response.total || worksheetsData.length);
      
      // Reset selection when worksheets change
      setSelectedWorksheets([]);
      setSelectAll(false);
    } catch (err) {
      console.error('Error fetching worksheets:', err);
      setError('Failed to load worksheets');
      toast.error('Failed to load worksheets');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch available subjects and grades for filters
  const fetchFilterOptions = async () => {
    try {
      // This would ideally be an API endpoint that returns unique subjects and grades
      // For now, we'll simulate by fetching all worksheets and extracting unique values
      const response = await WorksheetService.getWorksheets({ limit: 1000 });
      const worksheetsData = response.data || [];
      
      const subjects = Array.from(new Set(worksheetsData.map(w => w.subject).filter(Boolean)));
      const grades = Array.from(new Set(worksheetsData.map(w => w.grade).filter(Boolean)));
      
      setAvailableSubjects(subjects.filter((s): s is string => s !== undefined));
      setAvailableGrades(grades.filter((g): g is string => g !== undefined));
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  // Fetch worksheets when page or filters change
  useEffect(() => {
    fetchWorksheets();
  }, [currentPage]);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);
  
  // Initial fetch of filter options
  useEffect(() => {
    fetchFilterOptions();
  }, []);
  
  // Get worksheet ID (handles both _id and id)
  const getWorksheetId = (worksheet: Worksheet): string => {
    return (worksheet._id || worksheet.id) as string;
  };

  // Handle select all checkbox
  useEffect(() => {
    if (selectAll) {
      setSelectedWorksheets(worksheets.map(worksheet => getWorksheetId(worksheet)));
    } else if (selectedWorksheets.length === worksheets.length) {
      // If all are selected but selectAll is false, clear selection
      setSelectedWorksheets([]);
    }
  }, [selectAll, worksheets]);

  // Handle individual worksheet selection
  const handleWorksheetSelect = (worksheetId: string) => {
    setSelectedWorksheets(prev => {
      if (prev.includes(worksheetId)) {
        return prev.filter(id => id !== worksheetId);
      } else {
        return [...prev, worksheetId];
      }
    });
  };

  // Handle select all checkbox change
  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
  };
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'subscriptionLevel') {
      // Handle subscriptionLevel separately to ensure type safety
      const subscriptionValue = value === '' ? undefined : value as 'Free' | 'Essential' | 'Premium';
      setFilters(prev => ({ ...prev, subscriptionLevel: subscriptionValue }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  // Apply filters
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWorksheets();
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      subject: '',
      grade: '',
      subscriptionLevel: undefined,
      search: ''
    });
    // Fetch worksheets without filters
    fetchWorksheets();
  };

  // Show delete confirmation dialog
  const handleShowDeleteConfirmation = () => {
    if (selectedWorksheets.length === 0) {
      toast.error('Please select at least one worksheet to delete');
      return;
    }
    setShowConfirmation(true);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  // Delete selected worksheets
  const handleDeleteWorksheets = async () => {
    if (selectedWorksheets.length === 0) {
      toast.error('Please select at least one worksheet');
      return;
    }

    try {
      setIsDeleting(true);
      
      // Delete each selected worksheet
      const deletePromises = selectedWorksheets.map(worksheetId => {
        return WorksheetService.deleteWorksheet(worksheetId);
      });
      
      await Promise.all(deletePromises);
      
      toast.success(`Successfully deleted ${selectedWorksheets.length} worksheet(s)`);
      
      // Clear selection and refresh worksheets
      setSelectedWorksheets([]);
      setSelectAll(false);
      setShowConfirmation(false);
      fetchWorksheets();
    } catch (error) {
      console.error('Error deleting worksheets:', error);
      toast.error('Failed to delete worksheets');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Worksheets Management</h1>
            <div className="flex space-x-3">
              <Link 
                href="/admin/worksheets" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Back to Worksheets
              </Link>
              <Link 
                href="/admin/worksheets/batch-upload" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Bulk Upload
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Bulk Delete Worksheets</h2>
              <p className="text-gray-600 mt-1">
                Delete multiple worksheets at once. Filter worksheets, select them, and delete them with a single click.
                <span className="text-red-600 font-medium"> This action cannot be undone.</span>
              </p>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Filter Worksheets</h3>
                <form onSubmit={handleApplyFilters}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Search
                      </label>
                      <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search by title"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <select
                        name="subject"
                        value={filters.subject}
                        onChange={handleFilterChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                      >
                        <option value="">All Subjects</option>
                        {availableSubjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade
                      </label>
                      <select
                        name="grade"
                        value={filters.grade}
                        onChange={handleFilterChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                      >
                        <option value="">All Grades</option>
                        {availableGrades.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subscription Level
                      </label>
                      <select
                        name="subscriptionLevel"
                        value={filters.subscriptionLevel || ''}
                        onChange={handleFilterChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                      >
                        <option value="">All Levels</option>
                        <option value="Free">Free</option>
                        <option value="Essential">Essential</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Clear Filters
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Apply Filters
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Bulk Delete Controls */}
              <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">
                      {selectedWorksheets.length} worksheet{selectedWorksheets.length !== 1 ? 's' : ''} selected
                    </div>
                  </div>
                  
                  <div>
                    <button
                      onClick={handleShowDeleteConfirmation}
                      disabled={isDeleting || selectedWorksheets.length === 0}
                      className={`py-2 px-4 rounded-md shadow-sm text-sm font-medium ${
                        isDeleting || selectedWorksheets.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                      }`}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Selected'}
                    </button>
                  </div>
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
                  <p className="mt-2 text-gray-600">Loading worksheets...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={fetchWorksheets}
                    className="mt-2 py-1 px-3 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {/* Worksheets Table */}
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAllChange}
                                disabled={isDeleting || worksheets.length === 0}
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                              />
                              <span className="ml-2">Select All</span>
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subscription Level
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {worksheets.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                              No worksheets found
                            </td>
                          </tr>
                        ) : (
                          worksheets.map((worksheet) => (
                            <tr 
                              key={getWorksheetId(worksheet)}
                              className={selectedWorksheets.includes(getWorksheetId(worksheet)) ? 'bg-red-50' : ''}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedWorksheets.includes(getWorksheetId(worksheet))}
                                  onChange={() => handleWorksheetSelect(getWorksheetId(worksheet))}
                                  disabled={isDeleting}
                                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {worksheet.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {worksheet.subject || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {worksheet.grade || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  worksheet.subscriptionLevel === 'Premium' 
                                    ? 'bg-purple-100 text-purple-800'
                                    : worksheet.subscriptionLevel === 'Essential'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-green-100 text-green-800'
                                }`}>
                                  {worksheet.subscriptionLevel || 'Free'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={worksheets.length < worksheetsPerPage}
                        className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${worksheets.length < worksheetsPerPage ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{worksheets.length > 0 ? (currentPage - 1) * worksheetsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min(currentPage * worksheetsPerPage, totalWorksheets)}</span> of{' '}
                          <span className="font-medium">{totalWorksheets}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                          >
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          {/* Page numbers */}
                          {Array.from({ length: Math.ceil(totalWorksheets / worksheetsPerPage) || 1 }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${currentPage === i + 1 ? 'bg-red-50 text-red-600 z-10' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            >
                              {i + 1}
                            </button>
                          )).slice(Math.max(0, currentPage - 3), Math.min(Math.ceil(totalWorksheets / worksheetsPerPage), currentPage + 2))}
                          
                          <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={worksheets.length < worksheetsPerPage}
                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${worksheets.length < worksheetsPerPage ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                          >
                            <span className="sr-only">Next</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Delete Confirmation Modal */}
              {showConfirmation && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                  <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                      <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    
                    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Worksheets</h3>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                Are you sure you want to delete {selectedWorksheets.length} selected worksheet{selectedWorksheets.length !== 1 ? 's' : ''}? This action cannot be undone.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                          type="button"
                          onClick={handleDeleteWorksheets}
                          disabled={isDeleting}
                          className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                            isDeleting ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                          }`}
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelDelete}
                          disabled={isDeleting}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default withAuth(BulkDeletePage, { adminOnly: true });
