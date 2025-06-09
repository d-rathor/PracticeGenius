import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { withAuth } from '@/contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        
        {/* Basic stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="text-center py-6">
              <div className="text-4xl font-bold text-orange-500 mb-2">25</div>
              <div className="text-gray-500">Total Users</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-6">
              <div className="text-4xl font-bold text-orange-500 mb-2">18</div>
              <div className="text-gray-500">Active Subscriptions</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-6">
              <div className="text-4xl font-bold text-orange-500 mb-2">3</div>
              <div className="text-gray-500">Total Worksheets</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Placeholder for more content */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Recent user activity will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

// Wrap component with withAuth HOC and set adminOnly to true
export default withAuth(AdminDashboard, true);
