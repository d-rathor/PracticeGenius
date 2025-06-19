import React from 'react';
import Link from 'next/link';

interface CallToActionProps {}

/**
 * CallToAction component for the home page
 * Final section encouraging users to sign up
 */
const CallToAction: React.FC<CallToActionProps> = () => {
  return (
    <section className="py-16 bg-orange-500 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to enhance your child&apos;s education?</h2>
        <p className="text-lg mb-8 max-w-3xl mx-auto">
          Join thousands of parents who trust PracticeGenius for quality educational resources.
        </p>
        <div className="flex justify-center">
          <Link 
            href="/auth/signup" 
            className="bg-white text-black hover:bg-gray-100 font-medium py-2 px-6 rounded transition duration-300"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
