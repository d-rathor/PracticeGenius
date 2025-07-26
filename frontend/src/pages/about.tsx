import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Zap, Users, BookOpen } from 'lucide-react';

const AboutPage: NextPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 md:py-12 text-gray-700">
        {/* Top Section: Founder, Introduction & Our Approach */}
        <section className="mb-16 md:mb-20">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            {/* Left Column: Founder Image */}
            <div className="relative w-full h-80 md:h-[450px] rounded-lg overflow-hidden shadow-xl">
              <Image 
                src="/images/AboutUs.png"
                alt="Founder of Practice Genius"
                layout="fill"
                objectFit="cover" objectPosition="center 35%"
              />
            </div>
            {/* Right Column: Text Content */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                About <span className="text-orange-500">Practice4Genius</span>
              </h1>
              <p className="mb-4 text-base md:text-lg">
                Practice4Genius was founded by a mother who, like many parents, struggled to find quality worksheets for her school-going child. What began as a personal need turned into a mission — to make learning accessible, engaging, and effective for every child.
              </p>
              <p className="mb-4 text-base md:text-lg">
                Practice4Genius is built with that same spirit — to support parents, educators, and most importantly, students — by offering printable, subject-specific worksheets in Math, Science, and English for Grades 1 to 5. We offer flexible subscription plans, including free access, so that every family can find a learning path that works for them.
              </p>
              <p className="text-base md:text-lg mb-8">
                We believe that practice is essential for mastery, and our worksheets provide the perfect opportunity for students to reinforce concepts learned in the classroom.
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Our Approach</h2>
              <p className="mb-4 text-base md:text-lg">
                Each worksheet is carefully designed to be engaging, age-appropriate, and pedagogically sound. We focus on:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-6 text-base md:text-lg pl-1">
                <li>Clear, concise instructions that students can understand</li>
                <li>Progressive difficulty levels to challenge learners appropriately</li>
                <li>Varied question formats to maintain engagement</li>
                <li>Visual elements that support learning objectives</li>
                <li>Alignment with curriculum standards across multiple regions</li>
              </ul>
              <div className="mt-6">
                <Link href="/worksheets" legacyBehavior>
                  <a className="inline-block bg-orange-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-orange-600 transition duration-300 text-base md:text-lg">
                    Explore Our Worksheets
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-12 md:py-16 bg-gray-50 rounded-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-10 md:mb-12 text-center">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-4 md:px-8">
            {[{
                icon: <CheckCircle size={32} className="text-white" />,
                title: 'Quality',
                text: 'We are committed to creating high-quality educational resources that meet the needs of students and teachers.',
              },{
                icon: <Zap size={32} className="text-white" />,
                title: 'Innovation',
                text: 'We continuously explore new approaches to make learning more effective and engaging.',
              },{
                icon: <Users size={32} className="text-white" />,
                title: 'Inclusivity',
                text: 'We design our resources to be accessible and beneficial for students of all backgrounds and abilities.',
              },{
                icon: <BookOpen size={32} className="text-white" />,
                title: 'Education',
                text: 'We believe in the power of education to transform lives and are dedicated to supporting student success.',
              },].map((value, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="mb-4 p-3 bg-orange-500 rounded-full">
                  {value.icon}
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default AboutPage;
