import React, { useEffect, useState } from 'react';
import AdminService from '@/services/admin.service';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { withAuth } from '@/contexts/AuthContext';

const AdminDashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorksheets: 0,
  });

  useEffect(() => {
    // Fetch admin dashboard data
    const fetchDashboardData = async () => {
      try {
        const data = await AdminService.getStats();
        setStats(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{stats.totalUsers}</div>
                </CardContent>
              </Card>
              
              
              
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-700">Total Worksheets</h2>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{stats.totalWorksheets}</div>
                </CardContent>
              </Card>
              
              
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-700">Quick Actions</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Link href="/admin/users" className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg">
                      <div className="font-medium">Manage Users</div>
                      <div className="text-sm text-gray-500">View, edit, and manage user accounts</div>
                    </Link>
                    <Link href="/admin/worksheets" className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg">
                      <div className="font-medium">Manage Worksheets</div>
                      <div className="text-sm text-gray-500">Upload, edit, and organize worksheets</div>
                    </Link>
                    <Link href="/admin/subscriptions" className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg">
                      <div className="font-medium">Manage Subscriptions</div>
                      <div className="text-sm text-gray-500">View and manage subscription plans</div>
                    </Link>
                    <Link href="/admin/settings" className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg">
                      <div className="font-medium">System Settings</div>
                      <div className="text-sm text-gray-500">Configure application settings</div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-700">System Status</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium">API Server</div>
                        <div className="text-sm text-gray-500">All systems operational</div>
                      </div>
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium">Database</div>
                        <div className="text-sm text-gray-500">Connected and healthy</div>
                      </div>
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium">Storage</div>
                        <div className="text-sm text-gray-500">85% available</div>
                      </div>
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium">Last Backup</div>
                        <div className="text-sm text-gray-500">Today at 04:00 AM</div>
                      </div>
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

// Wrap component with withAuth HOC and set adminOnly to true
export default withAuth(AdminDashboardPage, true);
