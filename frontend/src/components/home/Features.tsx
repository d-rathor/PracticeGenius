import React from 'react';

interface FeaturesProps {
  // Add any props here if needed
}

/**
 * Features component for the home page
 * Displays the "Why Choose Practice4Genius" section with key benefits
 */
const Features: React.FC<FeaturesProps> = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Practice4Genius?</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-2 text-orange-500">Expertly Crafted</h3>
            <p className="text-gray-700">
              Our worksheets are designed by experienced educators to align with curriculum standards.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-2 text-orange-500">Easy to Use</h3>
            <p className="text-gray-700">
              Download, print, and start learning immediately with our user-friendly worksheets.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-2 text-orange-500">Comprehensive Coverage</h3>
            <p className="text-gray-700">
              From basic concepts to advanced topics, we cover the full spectrum of learning needs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
