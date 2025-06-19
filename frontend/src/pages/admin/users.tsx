import React, { useEffect, useState } from 'react';
import UserService from '@/services/user.service';
import { User } from '@/types/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { withAuth } from '@/contexts/AuthContext';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false); // State for delete operation

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const response = await UserService.getUsers();
        const usersData = Array.isArray(response) ? response : [];
        
        // Map _id to id and ensure all User properties are correctly typed
        const transformedUsers = usersData.map((user: any) => ({
          ...user, // Spread existing user properties first
          id: user._id, // Then map _id to id (overwriting if 'id' somehow existed)
          // Provide defaults for other potentially missing properties to match User type
          name: user.name || '',
          email: user.email || '',
          role: user.role || null,
          status: user.status || null,
          activeSubscription: user.activeSubscription || null,
          createdAt: user.createdAt || null,
        }));
        
        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);


  useEffect(() => {
    let filtered = [...users];
    
    if (searchQuery) {
      filtered = filtered.filter(user => 
        (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter) {
       filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, statusFilter, users]);

  const handleDelete = async (userId: string) => {
    console.log('handleDelete called with userId:', userId);
    if (!userId) {
      console.error('handleDelete called with invalid userId:', userId);
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    setIsDeleting(true);
    try {
      await UserService.deleteUser(userId); // This will error until UserService is updated
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setFilteredUsers(prevFilteredUsers => prevFilteredUsers.filter(user => user.id !== userId));
      console.log(`User ${userId} deleted successfully.`);
      // Consider adding a toast notification here for better UX
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
      // Consider adding a toast notification here for better UX
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string | null | undefined): string => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string | null | undefined): string => {
    if (!role) return 'bg-gray-100 text-gray-800';
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          {/* <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition duration-300">
            Add New User
          </button> */}
        </div>

        <Card>
          <CardContent className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => {
                        console.log('Rendering user row, user object:', user, 'user.id:', user?.id);
                        return (
                        <tr key={user.id || Math.random().toString()}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 font-medium">
                                  {user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : '?')}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name || 'Unknown User'}</div>
                                <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getRoleColor(user.role)}>
                              {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Unknown'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(user.status)}>
                              {user.status ? (user.status.charAt(0).toUpperCase() + user.status.slice(1)) : 'N/A'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.activeSubscription || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            N/A {/* Placeholder for Last Login */}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                            <button 
                              onClick={() => { console.log('Delete button clicked for user object:', user); if (user && user.id) { handleDelete(user.id); } else { console.error('Delete button clicked, but user or user.id is missing/invalid. User object:', user); } }} 
                              className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                              disabled={isDeleting}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                          No users found matching your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default withAuth(AdminUsersPage, true);