import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface Worksheet {
  id: string;
  title: string;
  subject: string;
  grade: string;
  downloadCount: number;
  dateAccessed: string;
}

interface SubscriptionInfo {
  plan: string;
  status: string;
  renewalDate: string;
  downloadsRemaining?: number;
}

const DashboardPage: React.FC = () => {
  const [recentWorksheets, setRecentWorksheets] = useState<Worksheet[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('practicegenius_token');
    console.log('Dashboard - Token check:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      console.log('No authentication token found, redirecting to login');
      window.location.href = '/auth/login?redirect=/dashboard';
      return;
    }
    
    // Simulate API call to fetch data
    setTimeout(() => {
      // Mock data - in a real app, this would come from an API
      setRecentWorksheets([
        {
          id: '1',
          title: 'Addition and Subtraction',
          subject: 'Math',
          grade: 'Grade 2',
          downloadCount: 3,
          dateAccessed: '2025-06-01'
        },
        {
          id: '2',
          title: 'Vocabulary Builder',
          subject: 'English',
          grade: 'Grade 3',
          downloadCount: 1,
          dateAccessed: '2025-06-05'
        },
        {
          id: '3',
          title: 'Solar System Facts',
          subject: 'Science',
          grade: 'Grade 4',
          downloadCount: 2,
          dateAccessed: '2025-06-07'
        }
      ]);

      setSubscription({
        plan: 'Premium',
        status: 'Active',
        renewalDate: '2025-07-08',
        downloadsRemaining: 47
      });

      setIsLoading(false);
    }, 1000);
  }, []);

  const getSubjectColor = (subject: string): string => {
    switch (subject.toLowerCase()) {
      case 'math':
        return 'bg-blue-100 text-blue-800';
      case 'english':
        return 'bg-green-100 text-green-800';
      case 'science':
        return 'bg-purple-100 text-purple-800';
      case 'social studies':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex space-x-2">
            <Link 
              href="/dashboard/worksheets" 
              className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition duration-300"
            >
              Browse Worksheets
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {/* Subscription Status Card */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Subscription Status</h2>
                  <Badge variant={subscription?.status === 'Active' ? 'success' : 'warning'}>
                    {subscription?.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Plan</p>
                    <p className="font-medium">{subscription?.plan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Renewal Date</p>
                    <p className="font-medium">{subscription?.renewalDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Downloads Remaining</p>
                    <p className="font-medium">{subscription?.downloadsRemaining}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/dashboard/subscription" 
                  className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                >
                  Manage Subscription →
                </Link>
              </CardFooter>
            </Card>

            {/* Recent Worksheets Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Recently Accessed Worksheets</h2>
                  <Link 
                    href="/dashboard/worksheets" 
                    className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Accessed
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Downloads
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentWorksheets.map((worksheet) => (
                        <tr key={worksheet.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{worksheet.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSubjectColor(worksheet.subject)}`}>
                              {worksheet.subject}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{worksheet.grade}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{worksheet.dateAccessed}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {worksheet.downloadCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link 
                              href={`/dashboard/worksheets/${worksheet.id}`} 
                              className="text-orange-500 hover:text-orange-600"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardContent className="text-center py-6">
                  <div className="text-4xl font-bold text-orange-500 mb-2">12</div>
                  <div className="text-gray-500">Total Downloads</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="text-center py-6">
                  <div className="text-4xl font-bold text-orange-500 mb-2">5</div>
                  <div className="text-gray-500">Saved Worksheets</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="text-center py-6">
                  <div className="text-4xl font-bold text-orange-500 mb-2">3</div>
                  <div className="text-gray-500">Subjects Explored</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
