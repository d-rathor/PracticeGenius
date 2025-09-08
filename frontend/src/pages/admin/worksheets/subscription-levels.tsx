import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import SubscriptionLevelEditor from '@/components/admin/worksheets/SubscriptionLevelEditor';
import withAuth from '@/components/hoc/withAuth';
import WorksheetService from '@/services/worksheet.service';
import { Worksheet } from '@/types/worksheet';
import { toast } from 'react-hot-toast';

const SubscriptionLevelsPage: NextPage = () => {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    grade: '',
    subscriptionLevel: undefined as undefined | 'Free' | 'Essential' | 'Premium',
    search: ''
  });

  // Fetch worksheets
  const fetchWorksheets = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await WorksheetService.getWorksheets({
        ...filters,
        limit: 100 // Get a larger number of worksheets
      });
      
      setWorksheets(response.data || []);
    } catch (err) {
      console.error('Error fetching worksheets:', err);
      setError('Failed to load worksheets');
      toast.error('Failed to load worksheets');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchWorksheets();
  }, []);

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

  return (
    <>
      <Head>
        <title>Manage Subscription Levels | Practice Genius Admin</title>
      </Head>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Subscription Levels</h1>
          <div className="flex space-x-2">
            <Link href="/admin/worksheets" className="py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              Back to Worksheets
            </Link>
            <Link href="/admin/worksheets/batch-upload" className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Batch Upload
            </Link>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600">
            Manage subscription levels for multiple worksheets at once. Select worksheets and assign them to Free, Essential, or Premium subscription levels.
          </p>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Filter Worksheets</h2>
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
                  placeholder="Search by title or description"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  placeholder="e.g. Math, English"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade
                </label>
                <input
                  type="text"
                  name="grade"
                  value={filters.grade}
                  onChange={handleFilterChange}
                  placeholder="e.g. 1, 2, 3"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Level
                </label>
                <select
                  name="subscriptionLevel"
                  value={filters.subscriptionLevel || ''}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
                className="py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
              <button
                type="submit"
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
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
          <SubscriptionLevelEditor 
            worksheets={worksheets} 
            onUpdate={fetchWorksheets}
          />
        )}
      </div>
    </>
  );
};

export default withAuth(SubscriptionLevelsPage, { adminOnly: true });
