import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
  preferences: {
    emailNotifications: boolean;
    newsletterSubscribed: boolean;
    defaultSubject?: string;
    defaultGrade?: string;
  };
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    emailNotifications: false,
    newsletterSubscribed: false,
    defaultSubject: '',
    defaultGrade: ''
  });

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchProfile = async () => {
      try {
        // Check if we're in the browser
        if (typeof window !== 'undefined') {
          // First try to get profile from the API
          try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
              const data = await response.json();
              setProfile(data);
              initFormData(data);
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error fetching from API, falling back to mock data:', error);
          }
          
          // Use mock data
          const mockProfile = {
            id: 'user123',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'user',
            avatar: '/images/avatar-placeholder.jpg',
            createdAt: '2025-01-15',
            preferences: {
              emailNotifications: true,
              newsletterSubscribed: false,
              defaultSubject: 'Math',
              defaultGrade: 'Grade 3'
            }
          };
          
          setProfile(mockProfile);
          initFormData(mockProfile);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const initFormData = (profile: UserProfile) => {
    setFormData({
      name: profile.name,
      email: profile.email,
      emailNotifications: profile.preferences.emailNotifications,
      newsletterSubscribed: profile.preferences.newsletterSubscribed,
      defaultSubject: profile.preferences.defaultSubject || '',
      defaultGrade: profile.preferences.defaultGrade || ''
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would be an API call to update the profile
    console.log('Updating profile with:', formData);
    
    // Update local state to reflect changes
    if (profile) {
      const updatedProfile = {
        ...profile,
        name: formData.name,
        email: formData.email,
        preferences: {
          ...profile.preferences,
          emailNotifications: formData.emailNotifications,
          newsletterSubscribed: formData.newsletterSubscribed,
          defaultSubject: formData.defaultSubject,
          defaultGrade: formData.defaultGrade
        }
      };
      
      setProfile(updatedProfile);
    }
    
    setIsEditing(false);
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
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Preferences</h3>
                      
                      <div className="flex items-center mb-3">
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          name="emailNotifications"
                          checked={formData.emailNotifications}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                          Receive email notifications
                        </label>
                      </div>
                      
                      <div className="flex items-center mb-3">
                        <input
                          type="checkbox"
                          id="newsletterSubscribed"
                          name="newsletterSubscribed"
                          checked={formData.newsletterSubscribed}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="newsletterSubscribed" className="ml-2 block text-sm text-gray-700">
                          Subscribe to newsletter
                        </label>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label htmlFor="defaultSubject" className="block text-sm font-medium text-gray-700">Default Subject</label>
                          <select
                            id="defaultSubject"
                            name="defaultSubject"
                            value={formData.defaultSubject}
                            onChange={handleSelectChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                          >
                            <option value="">Select a subject</option>
                            <option value="Math">Math</option>
                            <option value="English">English</option>
                            <option value="Science">Science</option>
                            <option value="Social Studies">Social Studies</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="defaultGrade" className="block text-sm font-medium text-gray-700">Default Grade</label>
                          <select
                            id="defaultGrade"
                            name="defaultGrade"
                            value={formData.defaultGrade}
                            onChange={handleSelectChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                          >
                            <option value="">Select a grade</option>
                            <option value="Grade 1">Grade 1</option>
                            <option value="Grade 2">Grade 2</option>
                            <option value="Grade 3">Grade 3</option>
                            <option value="Grade 4">Grade 4</option>
                            <option value="Grade 5">Grade 5</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
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
                      <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 mr-4">
                        <img 
                          src={profile?.avatar || '/images/avatar-placeholder.jpg'} 
                          alt={profile?.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/avatar-placeholder.jpg';
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
                    
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Preferences</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Email Notifications</p>
                          <p className="font-medium">{profile?.preferences.emailNotifications ? 'Enabled' : 'Disabled'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Newsletter</p>
                          <p className="font-medium">{profile?.preferences.newsletterSubscribed ? 'Subscribed' : 'Not Subscribed'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Default Subject</p>
                          <p className="font-medium">{profile?.preferences.defaultSubject || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Default Grade</p>
                          <p className="font-medium">{profile?.preferences.defaultGrade || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
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
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Password</p>
                    <p className="font-medium">••••••••</p>
                  </div>
                  
                  <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                    Change Password
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
