import React, { useState, useEffect } from 'react';
import { SubscriptionPlan } from '@/types/types';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onSave: (updatedPlan: SubscriptionPlan) => void;
}

const EditPlanModal: React.FC<EditPlanModalProps> = ({ isOpen, onClose, plan, onSave }) => {
  const [name, setName] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState(0);
  const [features, setFeatures] = useState(''); // Comma-separated string for simplicity

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setMonthlyPrice(plan.price.monthly);
      setFeatures(plan.features.join(', '));
    } else {
      // Reset form if no plan is provided (e.g., for a 'create' mode later)
      setName('');
      setMonthlyPrice(0);
      setFeatures('');
    }
  }, [plan]);

  if (!isOpen || !plan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPlanData: SubscriptionPlan = {
      ...plan,
      name,
      price: { 
        monthly: Number(monthlyPrice),
        yearly: plan.price.yearly // Preserve original yearly price
      },
      features: features.split(',').map(f => f.trim()).filter(f => f !== ''),
    };
    onSave(updatedPlanData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Edit Subscription Plan</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="planName" className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
            <input 
              type="text" 
              id="planName" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="planMonthlyPrice" className="block text-sm font-medium text-gray-700 mb-1">Monthly Price</label>
            <input 
              type="number" 
              id="planMonthlyPrice" 
              value={monthlyPrice} 
              onChange={(e) => setMonthlyPrice(Number(e.target.value))} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              min="0"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="planFeatures" className="block text-sm font-medium text-gray-700 mb-1">Features (comma-separated)</label>
            <textarea 
              id="planFeatures" 
              value={features} 
              onChange={(e) => setFeatures(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 h-24"
              placeholder="Feature 1, Feature 2, Feature 3"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlanModal;
