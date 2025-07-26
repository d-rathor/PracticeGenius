import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { NextPageWithLayout } from '@/types';
import Head from 'next/head';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';

import Pricing from '@/components/home/Pricing';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';

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

const HomePage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Practice4Genius - Educational Worksheets for Grades 1-5</title>
        <meta name="description" content="Practice4Genius provides high-quality educational worksheets for students in grades 1-5. Help your child excel with our expertly crafted practice materials." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
        <Hero />

        <Features />
        <Pricing />
        <Testimonials />
        <CallToAction />
    </>
  );
}

HomePage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default HomePage;
