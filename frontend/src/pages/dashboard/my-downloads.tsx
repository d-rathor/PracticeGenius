import React, { useEffect, useState, ReactElement } from 'react';
import Link from 'next/link';
import UserService, { UserWorksheetLogEntry } from '../../services/user.service';
import { NextPageWithLayout } from '../../types/types'; // Assuming you have a NextPageWithLayout type
import DashboardLayout from '@/components/layout/DashboardLayout'; // Assuming a DashboardLayout component exists

const MyDownloadedWorksheetsPage: NextPageWithLayout = () => {
  const [downloadedWorksheets, setDownloadedWorksheets] = useState<UserWorksheetLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        setLoading(true);
        const worksheets = await UserService.getMyDownloadedWorksheets();
        setDownloadedWorksheets(worksheets);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch downloaded worksheets:', err);
        setError(err.message || 'Failed to load downloaded worksheets. Please try again later.');
      }
      setLoading(false);
    };

    fetchDownloads();
  }, []);

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">My Downloaded Worksheets</h1>
          <p>Loading your downloaded worksheets...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">My Downloaded Worksheets</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Downloaded Worksheets</h1>
        {downloadedWorksheets.length === 0 ? (
          <p className="text-gray-600">You haven't downloaded any worksheets yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloadedWorksheets.map((logEntry) => (
              <div key={logEntry._id} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out">
                {logEntry.worksheet.thumbnailUrl && (
                  <img 
                    src={logEntry.worksheet.thumbnailUrl}
                    alt={`Thumbnail for ${logEntry.worksheet.title}`}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate" title={logEntry.worksheet.title}>{logEntry.worksheet.title}</h2>
                  <p className="text-gray-600 text-sm mb-1">Subject: {logEntry.worksheet.subject}</p>
                  <p className="text-gray-600 text-sm mb-3">Grade: {logEntry.worksheet.grade}</p>
                  <p className="text-gray-500 text-xs mb-4">Downloaded on: {new Date(logEntry.firstDownloadedAt).toLocaleDateString()}</p>
                  <Link href={`/worksheets/${logEntry.worksheet._id}`} legacyBehavior>
                    <a className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-300">
                      View Worksheet
                    </a>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
};

MyDownloadedWorksheetsPage.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default MyDownloadedWorksheetsPage;