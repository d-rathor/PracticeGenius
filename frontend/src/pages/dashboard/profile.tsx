import React, { useEffect, useState, FormEvent } from 'react';
import AuthService from '@/services/auth.service'; // Assuming AuthService handles profile updates
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false); // To toggle password form visibility
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await AuthService.getProfile(); // Use AuthService
        if (response.success && response.data) {
          setProfile(response.data);
          initFormData(response.data);
        } else {
          // Fallback to mock data or show error if API call failed but didn't throw
          console.error('Failed to fetch profile data:', response.message);
          // Optionally, set mock data here if desired as a fallback
          // For now, just log error and let loading complete
        }
      } catch (error) {
        console.error('Error fetching profile, falling back to mock data (if any):', error);
        // Fallback to mock data if needed
        const mockProfile = {
          id: 'user123',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          role: 'user',
          avatar: '/images/avatar-placeholder.jpg',
          createdAt: '2025-01-15'
        };
        setProfile(mockProfile);
        initFormData(mockProfile);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const initFormData = (profileData: UserProfile) => { // Renamed to avoid conflict with state variable
    setFormData({
      name: profileData.name
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const updatedUser = await AuthService.updateProfile({ name: formData.name });
      if (updatedUser && updatedUser.success) {
        setProfile(prevProfile => prevProfile ? { ...prevProfile, name: updatedUser.data.name } : null);
        alert('Profile updated successfully!');
        setIsEditing(false);
      } else {
        alert(updatedUser.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating your profile.');
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const resetPasswordForm = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (!passwordData.currentPassword || !passwordData.newPassword) {
        setPasswordMessage({ type: 'error', text: 'All password fields are required.' });
        return;
    }

    // The try/catch is removed to handle API errors via the response object for a more graceful UX.
    const response = await AuthService.changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    if (response.success) {
      setPasswordMessage({ type: 'success', text: response.message || 'Password changed successfully!' });
      resetPasswordForm();
      setIsChangingPassword(false); // Optionally hide form on success
    } else {
      // This now handles both validation errors and API errors like 401
      setPasswordMessage({ type: 'error', text: response.message || 'Failed to change password. Please check your current password.' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {/* Profile Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Profile Information</h2>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded text-sm transition duration-300"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                    
                    {/* Email field removed as it's not editable as per requirements */}
                    {/* Preferences section removed */}
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          initFormData(profile!);
                        }}
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition duration-300"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 mr-4 flex-shrink-0">
                        <img 
                          src={'/images/Logo1.png'}
                          alt={profile?.name || 'User Avatar'}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // prevent infinite loop if fallback fails
                            target.src = '/favicon.ico'; // Fallback to site logo
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{profile?.name}</h3>
                        <p className="text-sm text-gray-500">{profile?.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium">{formatDate(profile?.createdAt || '')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Account Type</p>
                        <p className="font-medium capitalize">{profile?.role}</p>
                      </div>
                    </div>
                    
                    {/* Preferences section removed */}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Security Section */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Security</h2>
              </CardHeader>
              <CardContent>
                {passwordMessage && (
                  <div className={`mb-4 p-3 rounded-md ${passwordMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {passwordMessage.text}
                  </div>
                )}
                {!isChangingPassword ? (
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Password</p>
                      <p className="font-medium">••••••••</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => { setIsChangingPassword(false); setPasswordMessage(null); resetPasswordForm(); }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
                      >
                        Save New Password
                      </button>
                    </div>
                  </form>
                )}
              </CardContent>
              {!isChangingPassword && (
                <CardFooter className="flex justify-end">
                  <button 
                    onClick={() => { setIsChangingPassword(true); setPasswordMessage(null); }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Change Password
                  </button>
                </CardFooter>
              )}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
