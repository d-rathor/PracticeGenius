import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  signupEnabled: boolean;
}

const AdminSettings: React.FC = () => {
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Practice Genius',
    siteDescription: 'The ultimate platform for educational worksheets',
    contactEmail: 'contact@practicegenius.com',
    supportPhone: '+1 (555) 123-4567',
    maintenanceMode: false,
    signupEnabled: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch settings data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // For development, use hardcoded settings until the API is ready
        if (process.env.NODE_ENV === 'development') {
          // Create a small delay to simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Use default settings in development
          setSettings({
            siteName: 'Practice Genius',
            siteDescription: 'The ultimate platform for educational worksheets',
            contactEmail: 'contact@practicegenius.com',
            supportPhone: '+1 (555) 123-4567',
            maintenanceMode: false,
            signupEnabled: true
          });
          
          setIsLoading(false);
          return;
        }
        
        // In production, use the API
        try {
          // Use the proper API URL with environment variables
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/settings`;
          const response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('practicegenius_token') || ''}`
            }
          });
          
          if (!response.ok) {
            if (response.status === 401) {
              router.push('/auth/login?redirect=/admin/settings');
              return;
            }
            throw new Error(`Failed to fetch settings: ${response.status}`);
          }
          
          const data = await response.json();
          setSettings(data);
        } catch (apiError) {
          console.error('API error:', apiError);
          setError('Failed to load settings. Please try again.');
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // For development, simulate API call
      if (process.env.NODE_ENV === 'development') {
        // Create a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setSuccessMessage('Settings saved successfully!');
        setIsSaving(false);
        return;
      }

      // In production, use the API
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/settings`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('practicegenius_token') || ''}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSuccessMessage('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Site Settings</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="large" />
              </div>
            ) : error ? (
              <div className="border border-red-200 text-red-800 bg-red-50 p-4 rounded-lg" role="alert">{error}</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="rounded-lg bg-white shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-medium">General Settings</h2>
                    <p className="text-sm text-gray-500">
                      Configure the basic settings for your Practice Genius site
                    </p>
                  </div>
                  <div className="px-6 py-4">
                    {successMessage && (
                      <div className="border border-green-200 text-green-800 bg-green-50 p-4 rounded-lg mb-4" role="alert">
                        {successMessage}
                      </div>
                    )}

                    <div className="space-y-6">
                      <div>
                        <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                          Site Name
                        </label>
                        <Input
                          id="siteName"
                          name="siteName"
                          value={settings.siteName}
                          onChange={handleInputChange}
                          className="mt-1"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                          Site Description
                        </label>
                        <Input
                          id="siteDescription"
                          name="siteDescription"
                          value={settings.siteDescription}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                          Contact Email
                        </label>
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          value={settings.contactEmail}
                          onChange={handleInputChange}
                          className="mt-1"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="supportPhone" className="block text-sm font-medium text-gray-700">
                          Support Phone
                        </label>
                        <Input
                          id="supportPhone"
                          name="supportPhone"
                          value={settings.supportPhone}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>

                      <div className="flex items-center">
                        <Input
                          id="maintenanceMode"
                          name="maintenanceMode"
                          type="checkbox"
                          checked={settings.maintenanceMode}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                          Maintenance Mode
                        </label>
                      </div>

                      <div className="flex items-center">
                        <Input
                          id="signupEnabled"
                          name="signupEnabled"
                          type="checkbox"
                          checked={settings.signupEnabled}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="signupEnabled" className="ml-2 block text-sm text-gray-700">
                          Enable User Signup
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    {isSaving ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Settings'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
