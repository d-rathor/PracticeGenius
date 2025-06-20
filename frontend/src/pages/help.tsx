import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { NextPage } from 'next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const faqData = {
  general: [
    {
      question: 'What is Practice Genius?',
      answer: 'Practice Genius is an educational platform that provides high-quality printable and interactive worksheets for students in grades 1-5. Our worksheets cover subjects including Math, Science, and English, designed to complement classroom learning and provide additional practice opportunities.',
    },
    {
      question: 'How do I get started with Practice Genius?',
      answer: 'Getting started is easy! Simply create a free account to access our basic worksheets. For full access to our premium content, you can subscribe to one of our affordable plans. Once registered, you can browse worksheets by subject, grade level, or topic.',
    },
    {
      question: 'Are the worksheets aligned with educational standards?',
      answer: 'Yes, all our worksheets are carefully designed to align with common educational standards. Our team of experienced educators ensures that the content is age-appropriate and pedagogically sound.',
    },
    {
      question: 'Can I use Practice Genius on mobile devices?',
      answer: 'Absolutely! Practice Genius is fully responsive and works on smartphones, tablets, and computers. You can access your worksheets anytime, anywhere.',
    },
  ],
  account: [
    {
      question: 'How do I create an account?',
      answer: 'To create an account, click on the "Register" button in the top right corner of the page. Fill in your details, verify your email address, and you\'re ready to go!',
    },
    {
      question: 'What subscription plans do you offer?',
      answer: 'We offer several subscription options: Monthly ($9.99/month), Annual ($89.99/year, save 25%), and Family Plan ($129.99/year for up to 5 users). Teachers can also inquire about our special school pricing.',
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription at any time from your account settings. Navigate to "My Account" > "Subscription" and click on "Cancel Subscription". Your access will continue until the end of your billing period.',
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes, you can change your subscription plan at any time. Any changes will take effect at the start of your next billing cycle.',
    },
  ],
  worksheets: [
    {
      question: 'How do I find worksheets for a specific topic?',
      answer: 'You can use our search function or browse worksheets by subject, grade level, or topic. We also offer curated collections for popular topics and seasonal themes.',
    },
    {
      question: 'Can I print the worksheets?',
      answer: 'Yes, all our worksheets are designed to be printer-friendly. Simply click the "Print" button on any worksheet page to generate a clean, printable version.',
    },
    {
      question: 'Are answer keys provided?',
      answer: 'Yes, answer keys are available for all our worksheets. Premium subscribers can access answer keys directly, while free users can see answers for selected worksheets.',
    },
    {
      question: 'Can I save worksheets for later use?',
      answer: 'Yes, you can save worksheets to your favorites for quick access later. Premium users can also organize worksheets into custom collections.',
    },
  ],
  technical: [
    {
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click on "Login" and then select "Forgot Password". Enter your email address, and we\'ll send you instructions to reset your password.',
    },
    {
      question: 'The worksheets aren\'t displaying correctly. What should I do?',
      answer: 'First, try refreshing your browser. If the issue persists, clear your browser cache or try using a different browser. If you\'re still experiencing problems, please contact our support team.',
    },
    {
      question: 'Can I use Practice Genius offline?',
      answer: 'While our platform requires an internet connection to access, you can download and print worksheets for offline use.',
    },
    {
      question: 'How do I report a technical issue or bug?',
      answer: 'If you encounter any technical issues, please contact our support team at support@practicegenius.com with details of the problem, including screenshots if possible.',
    },
  ],
};

const HelpPage: NextPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800">How Can We <span className="text-orange-500">Help You?</span></h1>
          <p className="text-lg text-gray-600 mt-2">
            Find answers to frequently asked questions about Practice Genius. If you can&apos;t find what you&apos;re
            looking for, please don&apos;t hesitate to contact our support team.
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            <TabsTrigger value="general" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">General Questions</TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Account & Subscription</TabsTrigger>
            <TabsTrigger value="worksheets" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Using Worksheets</TabsTrigger>
            <TabsTrigger value="technical" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Technical Support</TabsTrigger>
          </TabsList>

          {Object.entries(faqData).map(([category, faqs]) => (
            <TabsContent key={category} value={category}>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem value={`item-${category}-${index}`} key={index}>
                    <AccordionTrigger className="text-lg font-medium text-gray-700 hover:text-orange-600 text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-gray-600 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center mt-12">
          <h2 className="text-2xl font-semibold text-gray-800">Still Need Help?</h2>
          <p className="text-gray-600 mt-2">
            Our support team is here to assist you with any questions or issues you might have.
          </p>
          <a 
            href="mailto:support@practicegenius.com" 
            className="mt-4 inline-block bg-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-600 transition duration-300"
          >
            Email Support
          </a>
        </div>
      </div>
    </MainLayout>
  );
};

export default HelpPage;
