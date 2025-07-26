import React from 'react';

interface TestimonialsProps {
  // Add any props here if needed
}

/**
 * Testimonials component for the home page
 * Displays parent testimonials about Practice4Genius
 */
const Testimonials: React.FC<TestimonialsProps> = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Parents Are Saying</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="border-l-4 border-orange-500 pl-4 mb-4">
              <p className="text-gray-700 italic mb-4">
                "Practice4Genius has made learning fun for my daughter. The worksheets are engaging and easy to follow!"
              </p>
            </div>
            <div className="text-orange-500 font-medium">— Priya S., Mumbai</div>
          </div>
          
          {/* Testimonial 2 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="border-l-4 border-orange-500 pl-4 mb-4">
              <p className="text-gray-700 italic mb-4">
                "I love the variety of subjects and the quality of the content. My son looks forward to his study time now!"
              </p>
            </div>
            <div className="text-orange-500 font-medium">— Rahul M., Bengaluru</div>
          </div>
          
          {/* Testimonial 3 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="border-l-4 border-orange-500 pl-4 mb-4">
              <p className="text-gray-700 italic mb-4">
                "The worksheets are well-structured and really help reinforce what my kids learn in school. Highly recommended!"
              </p>
            </div>
            <div className="text-orange-500 font-medium">— Anita D., Delhi</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
