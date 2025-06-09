import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Dashboard layout component for authenticated users
 * Includes header with user menu and sidebar navigation
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Handle logout click
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Check if the current route matches the given path
  const isActivePath = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden text-gray-500 hover:text-gray-600 focus:outline-none"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/" className="flex items-center ml-4 lg:ml-0">
                <div className="bg-orange-500 w-8 h-8 flex items-center justify-center mr-2 rounded-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-orange-500">PracticeGenius</span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              <div className="relative ml-3">
                <div className="flex items-center">
                  <button
                    type="button"
                    className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="ml-2 text-gray-700 hidden md:block">{user?.email || 'User'}</span>
                    <svg className="ml-1 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                {/* Dropdown menu would go here */}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
              <nav className="flex-1 px-2 space-y-1 bg-white">
                <Link 
                  href="/dashboard" 
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActivePath('/dashboard') ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg className={`mr-3 h-5 w-5 ${isActivePath('/dashboard') ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>

                <Link 
                  href="/dashboard/worksheets" 
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActivePath('/dashboard/worksheets') ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg className={`mr-3 h-5 w-5 ${isActivePath('/dashboard/worksheets') ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  My Worksheets
                </Link>

                <Link 
                  href="/dashboard/subscription" 
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActivePath('/dashboard/subscription') ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg className={`mr-3 h-5 w-5 ${isActivePath('/dashboard/subscription') ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Subscription
                </Link>

                <Link 
                  href="/dashboard/profile" 
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActivePath('/dashboard/profile') ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg className={`mr-3 h-5 w-5 ${isActivePath('/dashboard/profile') ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>

                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button 
                    onClick={handleLogout}
                    className="group flex items-center w-full text-left px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 flex z-40">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleSidebar}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={toggleSidebar}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <div className="bg-orange-500 w-8 h-8 flex items-center justify-center mr-2 rounded-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-orange-500">PracticeGenius</span>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  <Link 
                    href="/dashboard" 
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActivePath('/dashboard') ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={toggleSidebar}
                  >
                    <svg className={`mr-4 h-6 w-6 ${isActivePath('/dashboard') ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>

                  <Link 
                    href="/dashboard/worksheets" 
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActivePath('/dashboard/worksheets') ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={toggleSidebar}
                  >
                    <svg className={`mr-4 h-6 w-6 ${isActivePath('/dashboard/worksheets') ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    My Worksheets
                  </Link>

                  <Link 
                    href="/dashboard/subscription" 
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActivePath('/dashboard/subscription') ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={toggleSidebar}
                  >
                    <svg className={`mr-4 h-6 w-6 ${isActivePath('/dashboard/subscription') ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    Subscription
                  </Link>

                  <Link 
                    href="/dashboard/profile" 
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActivePath('/dashboard/profile') ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={toggleSidebar}
                  >
                    <svg className={`mr-4 h-6 w-6 ${isActivePath('/dashboard/profile') ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>

                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <button 
                      onClick={(e) => {
                        handleLogout(e);
                        toggleSidebar();
                      }}
                      className="group flex items-center w-full text-left px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <svg className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
