import React from 'react';
import Head from 'next/head';
import MainLayout from '@/components/layout/MainLayout';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Pricing from '@/components/home/Pricing';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';

/**
 * Home page component
 * Recreated to match practicegenius.online exactly
 */
export default function HomePage() {
  return (
    <>
      <Head>
        <title>Practic4eGenius - Educational Worksheets for Grades 1-5</title>
        <meta name="description" content="Practice4Genius provides high-quality educational worksheets for students in grades 1-5. Help your child excel with our expertly crafted practice materials." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <MainLayout>
        <Hero />
        <Features />
        <Pricing />
        <Testimonials />
        <CallToAction />
      </MainLayout>
    </>
  );
}
