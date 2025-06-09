import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

interface Feature {
  id?: string;
  name: string;
  description: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: Feature[];
  isPopular: boolean;
  isActive: boolean;
}

const EditSubscriptionPlan: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [yearlyPrice, setYearlyPrice] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [features, setFeatures] = useState<Feature[]>([{ name: '', description: '' }]);

  // Fetch plan data
  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/admin/subscription-plans/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('practicegenius_token')}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/login?redirect=/admin/subscription-plans');
            return;
          }
          if (response.status === 404) {
            router.push('/admin/subscription-plans');
            return;
          }
          throw new Error('Failed to fetch subscription plan');
        }
        
        const plan: SubscriptionPlan = await response.json();
        
        // Populate form fields
        setName(plan.name);
        setDescription(plan.description);
        setMonthlyPrice(plan.monthlyPrice.toString());
        setYearlyPrice(plan.yearlyPrice.toString());
        setIsPopular(plan.isPopular);
        setIsActive(plan.isActive);
        setFeatures(plan.features.length > 0 ? plan.features : [{ name: '', description: '' }]);
        
      } catch (err) {
        console.error('Error fetching subscription plan:', err);
        setError('Failed to load subscription plan. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlan();
  }, [id, router]);

  // Handle adding a new feature field
  const handleAddFeature = () => {
    setFeatures([...features, { name: '', description: '' }]);
  };

  // Handle removing a feature field
  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = [...features];
    updatedFeatures.splice(index, 1);
    setFeatures(updatedFeatures);
  };

  // Handle feature field changes
  const handleFeatureChange = (index: number, field: keyof Feature, value: string) => {
    const updatedFeatures = [...features];
    updatedFeatures[index][field] = value;
    setFeatures(updatedFeatures);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !description || !monthlyPrice || !yearlyPrice) {
      setError('Please fill in all required fields.');
      return;
    }
    
    // Validate features
    const validFeatures = features.filter(feature => feature.name.trim() !== '');
    if (validFeatures.length === 0) {
      setError('Please add at least one feature.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch(`/api/admin/subscription-plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('practicegenius_token')}`
        },
        body: JSON.stringify({
          name,
          description,
          monthlyPrice: parseFloat(monthlyPrice),
          yearlyPrice: parseFloat(yearlyPrice),
          isPopular,
          isActive,
          features: validFeatures
        })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login?redirect=/admin/subscription-plans');
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update subscription plan');
      }
      
      // Redirect to subscription plans list on success
      router.push('/admin/subscription-plans');
      
    } catch (err: any) {
      console.error('Error updating subscription plan:', err);
      setError(err.message || 'Failed to update subscription plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Subscription Plan</h1>
            <Link 
              href="/admin/subscription-plans" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Cancel
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-medium text-gray-900">Plan Information</h2>
                  <p className="text-sm text-gray-500">
                    Update the details for this subscription plan
                  </p>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
                      <span className="block sm:inline">{error}</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    {/* Plan Name */}
                    <div className="sm:col-span-3">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Plan Name <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    {/* Monthly Price */}
                    <div className="sm:col-span-3">
                      <label htmlFor="monthly-price" className="block text-sm font-medium text-gray-700">
                        Monthly Price ($) <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          id="monthly-price"
                          value={monthlyPrice}
                          onChange={(e) => setMonthlyPrice(e.target.value)}
                          required
                          min="0"
                          step="0.01"
                          className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">USD</span>
                        </div>
                      </div>
                    </div>

                    {/* Yearly Price */}
                    <div className="sm:col-span-3">
                      <label htmlFor="yearly-price" className="block text-sm font-medium text-gray-700">
                        Yearly Price ($) <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          id="yearly-price"
                          value={yearlyPrice}
                          onChange={(e) => setYearlyPrice(e.target.value)}
                          required
                          min="0"
                          step="0.01"
                          className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">USD</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Options */}
                    <div className="sm:col-span-3">
                      <fieldset>
                        <legend className="text-sm font-medium text-gray-700">Plan Status</legend>
                        <div className="mt-4 space-y-4">
                          <div className="flex items-center">
                            <input
                              id="active"
                              name="active"
                              type="checkbox"
                              checked={isActive}
                              onChange={(e) => setIsActive(e.target.checked)}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="active" className="ml-3 block text-sm font-medium text-gray-700">
                              Active (visible to users)
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="popular"
                              name="popular"
                              type="checkbox"
                              checked={isPopular}
                              onChange={(e) => setIsPopular(e.target.checked)}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="popular" className="ml-3 block text-sm font-medium text-gray-700">
                              Mark as Popular
                            </label>
                          </div>
                        </div>
                      </fieldset>
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-6">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                          className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Brief description of the subscription plan.
                      </p>
                    </div>

                    {/* Features */}
                    <div className="sm:col-span-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">Features</h3>
                        <button
                          type="button"
                          onClick={handleAddFeature}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                          Add Feature
                        </button>
                      </div>
                      <div className="mt-2 space-y-4">
                        {features.map((feature, index) => (
                          <div key={index} className="flex items-start space-x-4">
                            <div className="flex-grow">
                              <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                <div>
                                  <label htmlFor={`feature-name-${index}`} className="block text-sm font-medium text-gray-700">
                                    Feature Name {index === 0 && <span className="text-red-500">*</span>}
                                  </label>
                                  <div className="mt-1">
                                    <input
                                      type="text"
                                      id={`feature-name-${index}`}
                                      value={feature.name}
                                      onChange={(e) => handleFeatureChange(index, 'name', e.target.value)}
                                      required={index === 0}
                                      className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label htmlFor={`feature-description-${index}`} className="block text-sm font-medium text-gray-700">
                                    Feature Description
                                  </label>
                                  <div className="mt-1">
                                    <input
                                      type="text"
                                      id={`feature-description-${index}`}
                                      value={feature.description}
                                      onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                                      className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(index)}
                                className="mt-6 inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-end">
                    <Link
                      href="/admin/subscription-plans"
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 mr-3"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Plan'}
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditSubscriptionPlan;
