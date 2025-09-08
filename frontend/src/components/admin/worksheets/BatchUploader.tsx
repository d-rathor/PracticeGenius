import React, { useState, useRef } from 'react';
import LocalFolderService, { ProcessFileResult } from '@/services/localFolder.service';
import { toast } from 'react-hot-toast';

const BatchUploader: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<ProcessFileResult[]>([]);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to array
      const fileArray = Array.from(e.target.files);
      
      // Filter for PDF files only
      const pdfFiles = fileArray.filter(file => file.type === 'application/pdf');
      
      if (pdfFiles.length !== fileArray.length) {
        toast.error('Only PDF files are allowed. Non-PDF files were removed.');
      }
      
      setFiles(pdfFiles);
    }
  };

  // Clear selected files
  const handleClearFiles = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload selected files
  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    try {
      setIsUploading(true);
      setProgress(0);
      
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          // Don't go to 100% until we get the response
          return prev < 90 ? prev + 10 : prev;
        });
      }, 500);
      
      const response = await LocalFolderService.uploadBatch(files);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setResults(response.data || []);
      
      const successCount = response.data.filter(result => result.success).length;
      toast.success(`Successfully processed ${successCount} out of ${files.length} files`);
      
      // Clear files after successful upload
      handleClearFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select PDF Worksheets
        </label>
        <div className="flex items-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-2 px-4 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 font-medium text-sm"
          >
            Choose Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="ml-3 text-sm text-gray-500">
            {files.length > 0 ? `${files.length} file${files.length !== 1 ? 's' : ''} chosen` : 'No file chosen'}
          </span>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Selected Files</h3>
          <ul className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
            {files.map((file, index) => (
              <li key={index} className="text-sm py-1 flex items-center">
                <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 4v12h10V4H5zm1 1h8v10H6V5z" clipRule="evenodd" />
                  <path d="M10 8v4h1V8h-1z" />
                </svg>
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mb-6">
        <button
          onClick={handleUpload}
          disabled={isUploading || files.length === 0}
          className={`py-2 px-4 rounded-md font-medium ${
            isUploading || files.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </button>
      </div>
      
      {isUploading && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">Processing files... {progress}%</p>
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Instructions</h3>
        <div className="bg-blue-50 p-4 rounded-md">
          <ol className="list-decimal list-inside space-y-2">
            <li>Select multiple PDF files using the file picker above.</li>
            <li>Click the "Upload Files" button to start the batch upload process.</li>
            <li>The system will automatically extract metadata from each PDF.</li>
            <li>After upload, you can view the results and any errors that occurred.</li>
            <li>All worksheets are initially set to the Free subscription level.</li>
            <li>You can edit worksheet details later from the main worksheets page.</li>
          </ol>
        </div>
      </div>
      
      {results.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Upload Results</h3>
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.fileName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        result.success
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {result.success ? (
                        <div>
                          <p>Title: {result.metadata?.title}</p>
                          <p>Subject: {result.metadata?.subject}</p>
                          <p>Grade: {result.metadata?.grade}</p>
                        </div>
                      ) : (
                        <p className="text-red-500">{result.error}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchUploader;
