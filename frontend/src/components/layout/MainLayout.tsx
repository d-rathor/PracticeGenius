import React, { ReactNode, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main layout component for the website
 * Includes header and footer
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useAuthContext();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem('practicegenius_token');
    localStorage.removeItem('user');
    
    // Redirect to home page
    window.location.href = '/';
  };

  // Close dropdown when clicking outside
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
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="bg-orange-500 w-8 h-8 flex items-center justify-center mr-2 rounded-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-orange-500">PracticeGenius</span>
              </Link>
            </div>
            
            {/* Navigation */}
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
            
            {/* Auth Buttons */}
            <div className="hidden md:block">
              {isAuthenticated ? (
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
                  
                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Dashboard
                      </Link>
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
            
            {/* Mobile Menu Button */}
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
          
          {/* Mobile Menu Dropdown */}
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
                  href="/contact" 
                  className="text-gray-700 hover:text-orange-600 transition duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
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
                        href="/profile" 
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
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-pgblack-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-bold mb-4">PracticeGenius</h3>
              <p className="text-gray-300 mb-4">
                Educational worksheets designed to help students excel in their studies.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-white transition duration-300">Home</Link></li>
                <li><Link href="/worksheets" className="text-gray-300 hover:text-white transition duration-300">Worksheets</Link></li>
                <li><Link href="/pricing" className="text-gray-300 hover:text-white transition duration-300">Pricing</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-white transition duration-300">About Us</Link></li>
              </ul>
            </div>
            
            {/* Subjects */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Subjects</h3>
              <ul className="space-y-2">
                <li><Link href="/worksheets/math" className="text-gray-300 hover:text-white transition duration-300">Mathematics</Link></li>
                <li><Link href="/worksheets/english" className="text-gray-300 hover:text-white transition duration-300">English</Link></li>
                <li><Link href="/worksheets/science" className="text-gray-300 hover:text-white transition duration-300">Science</Link></li>
                <li><Link href="/worksheets/social-studies" className="text-gray-300 hover:text-white transition duration-300">Social Studies</Link></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p className="text-gray-300 mb-2">Email: info@practicegenius.com</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">
              &copy; {new Date().getFullYear()} PracticeGenius. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
