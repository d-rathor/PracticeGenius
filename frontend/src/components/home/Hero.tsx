import React from 'react';
import Link from 'next/link';

interface HeroProps {
  // Add any props here if needed
}

/**
 * Hero component for the homepage
 */
const Hero: React.FC<HeroProps> = () => {
  return (
    <section className="bg-black text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0 pr-0 md:pr-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-orange-500">Quality Worksheets</span> for Your Child's Success
            </h1>
            <p className="text-lg mb-6">
              Access premium educational worksheets for grades 1-5 in Math, Science, 
              and English.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              <Link 
                href="/auth/signup" 
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded transition duration-300 w-full sm:w-auto text-center"
              >
                Get Started Now
              </Link>
              <Link 
                href="/worksheets" 
                className="bg-transparent border border-white hover:bg-white hover:text-black text-white font-medium py-3 px-6 rounded transition duration-300 w-full sm:w-auto text-center"
              >
                Browse Worksheets
              </Link>
            </div>
            
            {/* Stats section */}
            <div className="flex justify-around sm:justify-start sm:gap-8">
              <div className="bg-zinc-900 p-4 rounded-lg text-center flex-1 sm:flex-grow-0 sm:min-w-[100px]">
                <div className="text-orange-500 text-2xl font-bold mb-1">500+</div>
                <div className="text-sm">Worksheets</div>
              </div>
              <div className="bg-zinc-900 p-4 rounded-lg text-center flex-1 sm:flex-grow-0 sm:min-w-[100px]">
                <div className="text-orange-500 text-2xl font-bold mb-1">5</div>
                <div className="text-sm">Grade Levels</div>
              </div>
              <div className="bg-zinc-900 p-4 rounded-lg text-center flex-1 sm:flex-grow-0 sm:min-w-[100px]">
                <div className="text-orange-500 text-2xl font-bold mb-1">3</div>
                <div className="text-sm">Subjects</div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="relative h-56 md:h-[320px] w-full rounded-lg overflow-hidden border-4 border-white">
              <img 
                src="/images/Children2.png" 
                alt="Children learning with worksheets" 
                className="w-full h-full object-cover rounded"
                loading="eager"
                decoding="sync"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
