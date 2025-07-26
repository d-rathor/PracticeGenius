import React from 'react';
import { useRouter } from 'next/router';

interface HowItWorksProps {}


/**
 * HowItWorks component for the home page
 * Explains the step-by-step process of using Practice4Genius
 */
const HowItWorks: React.FC<HowItWorksProps> = () => {
  const router = useRouter();

  return (
    <section className="how-it-works py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How Practice4Genius Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="step text-center">
            <div className="step-number bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
            <h3 className="text-xl font-semibold mb-2">Browse Worksheets</h3>
            <p className="text-gray-600">Search our extensive library of worksheets by subject, grade level, or topic.</p>
          </div>
          
          {/* Step 2 */}
          <div className="step text-center">
            <div className="step-number bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
            <h3 className="text-xl font-semibold mb-2">Download Resources</h3>
            <p className="text-gray-600">Download the worksheets you need in PDF format, ready for printing or digital use.</p>
          </div>
          
          {/* Step 3 */}
          <div className="step text-center">
            <div className="step-number bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600">Monitor your child's progress and identify areas for improvement with our tracking tools.</p>
          </div>
        </div>
        
        {/* Call to Action Button */}
        <div className="text-center mt-12">
          <button 
            onClick={() => router.push('/auth/signup')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
          >
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
