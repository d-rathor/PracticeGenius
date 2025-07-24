import React from 'react';
import Link from 'next/link';

const subjects = [
  {
    name: 'Maths',
    description: 'Sharpen your numerical and problem-solving skills.',
    href: '/worksheets?subject=Maths',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  {
    name: 'Science',
    description: 'Explore the wonders of the natural world.',
    href: '/worksheets?subject=Science',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  {
    name: 'English',
    description: 'Master language, literature, and communication.',
    href: '/worksheets?subject=English',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
];

const Subjects = () => {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          Explore by Subject
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subjects.map((subject) => (
            <Link key={subject.name} href={subject.href} legacyBehavior>
              <a className={`block p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300 ${subject.bgColor}`}>
                <h3 className={`text-2xl font-bold ${subject.textColor}`}>{subject.name}</h3>
                <p className={`mt-2 ${subject.textColor} opacity-90`}>{subject.description}</p>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Subjects;
