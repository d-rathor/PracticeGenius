import React from 'react';
import Link from 'next/link';
import { NextPageContext } from 'next';
import MainLayout from '@/components/layout/MainLayout';

interface ErrorProps {
  statusCode?: number;
  message?: string;
}

// Using NextPage instead of React.FC to support getInitialProps
function ErrorPage({ statusCode, message }: ErrorProps) {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <h1 className="text-6xl font-bold text-orange-500 mb-4">
          {statusCode || 'Error'}
        </h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          {statusCode ? `An error ${statusCode} occurred` : 'An error occurred'}
        </h2>
        <p className="text-xl text-gray-600 max-w-md mb-8">
          {message || 'Sorry, something went wrong. Please try again later.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition-colors"
          >
            Go to Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 border border-orange-500 text-orange-500 font-medium rounded-md hover:bg-orange-50 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </MainLayout>
  );
}

// Define getInitialProps as a static method
ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res ? res.statusCode : err ? (err as any).statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
