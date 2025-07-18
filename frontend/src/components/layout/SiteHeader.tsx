import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';

interface SiteHeaderProps {
  showSidebarToggle?: boolean;
  onSidebarToggle?: () => void;
  fullWidth?: boolean;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ showSidebarToggle = false, onSidebarToggle, fullWidth = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuthContext();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('practicegenius_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const containerClasses = fullWidth ? 'px-4 sm:px-6 lg:px-8' : 'container mx-auto px-4';

  return (
    <header className="bg-white py-4 shadow-sm">
      <div className={containerClasses}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {showSidebarToggle && (
              <button
                type="button"
                className="lg:hidden text-gray-500 hover:text-gray-600 focus:outline-none mr-4"
                onClick={onSidebarToggle}
                aria-label="Toggle sidebar"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <Link href="/" className="flex items-center">
              <img src="/images/Logo6.png" alt="PracticeGenius Logo" className="h-20 w-auto" />
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-orange-500 font-medium transition duration-300">
              Home
            </Link>
            <Link href="/worksheets" className="text-gray-700 hover:text-orange-500 font-medium transition duration-300">
              Worksheets
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-orange-500 font-medium transition duration-300">
              Pricing
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-orange-500 font-medium transition duration-300">
              About
            </Link>
            <Link href="/help" className="text-gray-700 hover:text-orange-500 font-medium transition duration-300">
              Help
            </Link>
          </nav>
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user && (
                  <span className="text-gray-700 font-medium">
                    Welcome, {user.name || user.email}
                  </span>
                )}
                <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={toggleDropdown}
                  className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition duration-300 flex items-center"
                >
                  <span>My Account</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Dashboard
                    </Link>
                    <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link href="/auth/login" className="text-orange-500 hover:text-orange-600 py-2 px-4 border border-orange-500 rounded transition duration-300">
                  Login
                </Link>
                <Link href="/auth/signup" className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition duration-300">
                  Register
                </Link>
              </div>
            )}
          </div>
          <button 
            className="md:hidden text-orange-600 focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4 px-4">
              <Link 
                href="/worksheets" 
                className="text-gray-700 hover:text-orange-600 transition duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Worksheets
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-700 hover:text-orange-600 transition duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/about" 
                className="text-gray-700 hover:text-orange-600 transition duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/help" 
                className="text-gray-700 hover:text-orange-600 transition duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Help
              </Link>
              <div className="pt-4 border-t border-gray-200 flex flex-col space-y-4">
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="text-gray-700 hover:text-orange-600 transition duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/dashboard/profile" 
                      className="text-gray-700 hover:text-orange-600 transition duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-red-600 hover:text-red-700 transition duration-300 text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/auth/login" 
                      className="text-gray-700 hover:text-orange-600 transition duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition duration-300 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default SiteHeader;
