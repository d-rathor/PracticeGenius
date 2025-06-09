import React from 'react';
import Link from 'next/link';

interface PricingProps {
  // Add any props here if needed
}

/**
 * Pricing component for the home page
 */
const Pricing: React.FC<PricingProps> = () => {
  return (
    <section className="py-16 bg-orange-500 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Simple, Transparent Pricing</h2>
          <p className="text-lg">Choose the plan that works best for your needs</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden text-gray-800">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4">Free</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">₹0</span>
                <span className="text-gray-500">/forever</span>
              </div>
              <p className="text-gray-600 mb-4">Basic access to limited worksheets</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Access to 2 worksheets per grade</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Preview all worksheets</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Basic support</span>
                </li>
              </ul>
              <Link 
                href="/register" 
                className="block w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-center rounded transition duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
          
          {/* Essential Plan */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden text-gray-800 relative transform scale-105 z-10">
            <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1">
              POPULAR
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4">Essential</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">₹499</span>
                <span className="text-gray-500">/per month</span>
              </div>
              <p className="text-gray-600 mb-4">Perfect for regular learning needs</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Access to all Essential worksheets</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Unlimited downloads</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Monthly new worksheets</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Email support</span>
                </li>
              </ul>
              <Link 
                href="/register" 
                className="block w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white text-center rounded transition duration-300"
              >
                Subscribe Now
              </Link>
            </div>
          </div>
          
          {/* Premium Plan */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden text-gray-800">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4">Premium</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">₹999</span>
                <span className="text-gray-500">/per month</span>
              </div>
              <p className="text-gray-600 mb-4">Complete access to all resources</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Access to ALL worksheets</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Unlimited downloads</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Priority access to new worksheets</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Premium support</span>
                </li>
              </ul>
              <Link 
                href="/register" 
                className="block w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-center rounded transition duration-300"
              >
                Subscribe Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
