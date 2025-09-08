import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import BatchUploader from '@/components/admin/worksheets/BatchUploader';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import withAuth from '@/components/hoc/withAuth';

const BatchUploadPage: NextPage = () => {
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
                href="/admin/worksheets/create" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Worksheet
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Batch Upload Worksheets</h2>
              <p className="text-gray-600 mt-1">
                Upload multiple PDF worksheets at once. The system will automatically extract metadata like title, subject, and grade from each PDF.
                All worksheets will be initially set to the Free subscription level.
              </p>
            </CardHeader>
            <CardContent>
              <BatchUploader />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

// Use withAuth HOC with the correct parameters
export default withAuth(BatchUploadPage, { adminOnly: true });
