import React, { useState, useEffect } from 'react';
import { Worksheet } from '@/types/worksheet';
import WorksheetService from '@/services/worksheet.service';
import { toast } from 'react-hot-toast';

interface SubscriptionLevelEditorProps {
  worksheets: Worksheet[];
  onUpdate?: () => void;
}

const SubscriptionLevelEditor: React.FC<SubscriptionLevelEditorProps> = ({ 
  worksheets,
  onUpdate 
}) => {
  const [selectedWorksheets, setSelectedWorksheets] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<'Free' | 'Essential' | 'Premium'>('Free');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  // Handle select all checkbox
  useEffect(() => {
    if (selectAll) {
      setSelectedWorksheets(worksheets.map(worksheet => worksheet._id));
    } else if (selectedWorksheets.length === worksheets.length) {
      // If all are selected but selectAll is false, clear selection
      setSelectedWorksheets([]);
    }
  }, [selectAll, worksheets]);

  // Handle individual worksheet selection
  const handleWorksheetSelect = (worksheetId: string) => {
    setSelectedWorksheets(prev => {
      if (prev.includes(worksheetId)) {
        return prev.filter(id => id !== worksheetId);
      } else {
        return [...prev, worksheetId];
      }
    });
  };

  // Handle select all checkbox change
  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
  };

  // Handle subscription level change
  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLevel(e.target.value as 'Free' | 'Essential' | 'Premium');
  };

  // Update subscription level for selected worksheets
  const handleUpdateLevel = async () => {
    if (selectedWorksheets.length === 0) {
      toast.error('Please select at least one worksheet');
      return;
    }

    try {
      setIsUpdating(true);
      
      // Update each selected worksheet
      const updatePromises = selectedWorksheets.map(worksheetId => {
        const worksheet = worksheets.find(w => w._id === worksheetId);
        if (!worksheet) return null;
        
        // Create FormData with updated subscription level
        const formData = new FormData();
        formData.append('title', worksheet.title);
        formData.append('description', worksheet.description || '');
        formData.append('subject', worksheet.subject || '');
        formData.append('grade', worksheet.grade || '');
        formData.append('subscriptionLevel', selectedLevel);
        
        if (worksheet.keywords && Array.isArray(worksheet.keywords)) {
          formData.append('keywords', worksheet.keywords.join(','));
        }
        
        return WorksheetService.updateWorksheet(worksheetId, formData);
      });
      
      await Promise.all(updatePromises.filter(Boolean));
      
      toast.success(`Updated ${selectedWorksheets.length} worksheet(s) to ${selectedLevel} subscription level`);
      
      // Clear selection
      setSelectedWorksheets([]);
      setSelectAll(false);
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating subscription levels:', error);
      toast.error('Failed to update subscription levels');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Batch Edit Subscription Levels</h2>
      
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subscription Level
            </label>
            <select
              value={selectedLevel}
              onChange={handleLevelChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              disabled={isUpdating}
            >
              <option value="Free">Free</option>
              <option value="Essential">Essential</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
          
          <div className="flex-none pt-6">
            <button
              onClick={handleUpdateLevel}
              disabled={isUpdating || selectedWorksheets.length === 0}
              className={`py-2 px-4 rounded-md font-medium ${
                isUpdating || selectedWorksheets.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isUpdating ? 'Updating...' : 'Update Selected'}
            </button>
          </div>
        </div>
        
        <p className="mt-2 text-sm text-gray-500">
          {selectedWorksheets.length} worksheet{selectedWorksheets.length !== 1 ? 's' : ''} selected
        </p>
      </div>
      
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                    disabled={isUpdating}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2">Select All</span>
                </div>
              </th>
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
                Current Level
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {worksheets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No worksheets found
                </td>
              </tr>
            ) : (
              worksheets.map((worksheet) => (
                <tr 
                  key={worksheet._id}
                  className={selectedWorksheets.includes(worksheet._id) ? 'bg-blue-50' : ''}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedWorksheets.includes(worksheet._id)}
                      onChange={() => handleWorksheetSelect(worksheet._id)}
                      disabled={isUpdating}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {worksheet.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {worksheet.subject || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {worksheet.grade || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      worksheet.subscriptionLevel === 'Premium' 
                        ? 'bg-purple-100 text-purple-800'
                        : worksheet.subscriptionLevel === 'Essential'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {worksheet.subscriptionLevel}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionLevelEditor;
