import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { withAuth } from '@/contexts/AuthContext';

interface Subscription {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  planId: string;
  planName: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminSubscriptions: React.FC = () => {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch subscriptions data
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // For development, use hardcoded subscriptions until the API is ready
        if (process.env.NODE_ENV === 'development') {
          // Create a small delay to simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const mockSubscriptions: Subscription[] = [
            {
              id: '1',
              userId: 'user1',
              user: {
                id: 'user1',
                name: 'John Doe',
                email: 'john@example.com'
              },
              planId: 'plan1',
              planName: 'Premium Monthly',
              status: 'active',
              startDate: '2025-05-01T00:00:00Z',
              endDate: '2025-06-01T00:00:00Z',
              autoRenew: true,
              createdAt: '2025-05-01T12:00:00Z',
              updatedAt: '2025-05-01T12:00:00Z'
            },
            {
              id: '2',
              userId: 'user2',
              user: {
                id: 'user2',
                name: 'Jane Smith',
                email: 'jane@example.com'
              },
              planId: 'plan2',
              planName: 'Premium Annual',
              status: 'active',
              startDate: '2025-04-15T00:00:00Z',
              endDate: '2026-04-15T00:00:00Z',
              autoRenew: true,
              createdAt: '2025-04-15T09:30:00Z',
              updatedAt: '2025-04-15T09:30:00Z'
            },
            {
              id: '3',
              userId: 'user3',
              user: {
                id: 'user3',
                name: 'Robert Johnson',
                email: 'robert@example.com'
              },
              planId: 'plan1',
              planName: 'Premium Monthly',
              status: 'cancelled',
              startDate: '2025-03-10T00:00:00Z',
              endDate: '2025-04-10T00:00:00Z',
              autoRenew: false,
              createdAt: '2025-03-10T14:45:00Z',
              updatedAt: '2025-03-25T11:20:00Z'
            },
            {
              id: '4',
              userId: 'user4',
              user: {
                id: 'user4',
                name: 'Emily Wilson',
                email: 'emily@example.com'
              },
              planId: 'plan3',
              planName: 'Basic Monthly',
              status: 'expired',
              startDate: '2025-02-05T00:00:00Z',
              endDate: '2025-03-05T00:00:00Z',
              autoRenew: false,
              createdAt: '2025-02-05T10:15:00Z',
              updatedAt: '2025-03-05T00:00:00Z'
            },
            {
              id: '5',
              userId: 'user5',
              user: {
                id: 'user5',
                name: 'Michael Brown',
                email: 'michael@example.com'
              },
              planId: 'plan2',
              planName: 'Premium Annual',
              status: 'active',
              startDate: '2025-01-20T00:00:00Z',
              endDate: '2026-01-20T00:00:00Z',
              autoRenew: true,
              createdAt: '2025-01-20T16:30:00Z',
              updatedAt: '2025-01-20T16:30:00Z'
            }
          ];
          
          setSubscriptions(mockSubscriptions);
          setIsLoading(false);
          return;
        }
        
        // In production, use the API
        try {
          // Use the proper API URL with environment variables
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/subscriptions`;
          const response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('practicegenius_token') || ''}`
            }
          });
          
          if (!response.ok) {
            if (response.status === 401) {
              router.push('/auth/login?redirect=/admin/subscriptions');
              return;
            }
            throw new Error(`Failed to fetch subscriptions: ${response.status}`);
          }
          
          const data = await response.json();
          // Handle different possible API response formats
          const subscriptionsData = Array.isArray(data) ? data : data.subscriptions || [];
          setSubscriptions(subscriptionsData);
        } catch (apiError) {
          console.error('API error:', apiError);
          setError('Failed to load subscriptions. Please try again.');
          setSubscriptions([]);
        }
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError('Failed to load subscriptions. Please try again.');
        setSubscriptions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, [router]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter subscriptions based on search term and status filter
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = 
      subscription.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      subscription.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.planName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Subscription Management</h1>
            <Link 
              href="/admin/subscription-plans" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Manage Subscription Plans
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">All Subscriptions</h2>
                  <p className="text-sm text-gray-500">
                    Manage user subscriptions and their status
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div>
                    <label htmlFor="search" className="sr-only">Search</label>
                    <input
                      type="text"
                      id="search"
                      placeholder="Search by user or plan"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="sr-only">Filter by status</label>
                    <select
                      id="status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              ) : filteredSubscriptions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plan
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Auto-Renew
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSubscriptions.map((subscription) => (
                        <tr key={subscription.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {subscription.user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {subscription.user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{subscription.planName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(subscription.status)}>
                              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{formatDate(subscription.startDate)}</div>
                            <div>to {formatDate(subscription.endDate)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {subscription.autoRenew ? (
                              <span className="text-green-600">Yes</span>
                            ) : (
                              <span className="text-red-600">No</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/admin/subscriptions/${subscription.id}`}
                              className="text-orange-600 hover:text-orange-900 mr-4"
                            >
                              View
                            </Link>
                            <Link
                              href={`/admin/subscriptions/${subscription.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No subscriptions found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter to find what you\'re looking for.' 
                      : 'Get started by creating a new subscription.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

// Wrap component with withAuth HOC and set adminOnly to true
export default withAuth(AdminSubscriptions, true);
