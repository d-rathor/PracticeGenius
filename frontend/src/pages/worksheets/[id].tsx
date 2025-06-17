import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';
import WorksheetService from '@/services/worksheet.service'; // Import WorksheetService
import { Button } from '@/components/ui/Button'; // Assuming Button component exists and is styled
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';

interface Worksheet {
  id: string;
  title: string;
  subject: string;
  grade: string;
  difficulty: string;
  subscriptionLevel: 'Free' | 'Essential' | 'Premium';
  description: string;
  content: string;
  downloadCount: number;
  dateCreated: string;
  imageUrl?: string; // Optional, as not all worksheets might have a preview image
  // Add fields related to the downloadable file, assuming backend provides them:
  fileKey?: string; 
  fileUrl: string; // This is the B2 URL, not the pre-signed one for direct download by user
  originalFilename?: string;
  mimeType?: string;
  fileSize?: number;
}

const WorksheetDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuthContext(); // Added user from context
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Authentication state is now handled by useAuthContext

  useEffect(() => {
    if (!id) return;

    const fetchWorksheet = async () => {
      try {
        setIsLoading(true);

        // Get token from localStorage to make an authenticated request if available
        const token = localStorage.getItem('practicegenius_token');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/worksheets/${id}`;
        console.log('Fetching worksheet from:', apiUrl, 'Authenticated:', !!token);

        const response = await fetch(apiUrl, { headers });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();

        // The actual worksheet data is nested in the 'data' property from our API
        if (responseData && responseData.data) {
          setWorksheet(responseData.data);
        } else {
          // Fallback for cases where the structure might be flat (e.g., from a different source)
          setWorksheet(responseData);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch worksheet:', err);
        setError('Failed to load worksheet. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchWorksheet();
  }, [id]);

  const getDifficultyColor = (difficulty: string | undefined): string => {
    if (!difficulty) return 'bg-gray-100 text-gray-800';
    
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectColor = (subject: string | undefined): string => {
    if (!subject) return 'bg-gray-100 text-gray-800';
    
    switch (subject.toLowerCase()) {
      case 'math':
        return 'bg-blue-100 text-blue-800';
      case 'english':
        return 'bg-green-100 text-green-800';
      case 'science':
        return 'bg-purple-100 text-purple-800';
      case 'social studies':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionLevelColor = (level: string | undefined): string => {
    if (!level) return 'bg-gray-100 text-gray-800';
    switch (level.toLowerCase()) {
      case 'free':
        return 'bg-green-100 text-green-800'; // Or another color for Free
      case 'essential':
        return 'bg-blue-100 text-blue-800'; // Or another color for Essential
      case 'premium':
        return 'bg-purple-100 text-purple-800'; // Or another color for Premium
      default:
        return 'bg-gray-100 text-gray-800';
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

  // Helper function to determine if the user can access the worksheet content
  const canUserAccessWorksheet = (
    worksheetSubscriptionLevel: 'Free' | 'Essential' | 'Premium',
    userRole: string | undefined,
    userSubscriptionPlanName: string | undefined
  ): boolean => {
    if (!isAuthenticated) return worksheetSubscriptionLevel === 'Free'; // Anonymous users can only see Free previews
    if (userRole === 'admin') {
      return true;
    }

    const levels = { Free: 0, Essential: 1, Premium: 2 };
    const requiredLevel = levels[worksheetSubscriptionLevel];
    
    // Determine user's effective subscription level name
    let effectiveUserPlanName: 'Free' | 'Essential' | 'Premium' = 'Free'; // Default for authenticated users without active sub
    if (userSubscriptionPlanName && (userSubscriptionPlanName === 'Free' || userSubscriptionPlanName === 'Essential' || userSubscriptionPlanName === 'Premium')) {
      effectiveUserPlanName = userSubscriptionPlanName;
    }

    const userLevel = levels[effectiveUserPlanName];

    return userLevel >= requiredLevel;
  };

  const handleDownload = async () => {
    if (!worksheet || !worksheet.id || !worksheet.fileKey) {
      setDownloadError('Worksheet data is incomplete or no file available for download.');
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);
    try {
      const response = await WorksheetService.downloadWorksheet(worksheet.id);
      const downloadUrl = response?.data?.downloadUrl;

      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      } else {
        console.error('API response did not contain a download URL:', response);
        throw new Error('Download URL not provided by the server.');
      }
    } catch (err: any) {
      // --- BEGIN NEW LOGS ---
      console.log('[handleDownload] Caught error object (stringified with own props):', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      console.log('[handleDownload] err.response (raw):', err.response);
      console.log('[handleDownload] err.response?.status (from raw response):', err.response?.status);
      console.log('[handleDownload] err.status (direct property on error object):', err.status);
      console.log('[handleDownload] err.data (parsed error data from API client):', err.data);
      console.log('[handleDownload] err.message (direct property on error object):', err.message);
      // --- END NEW LOGS ---

      const apiMessage = err.data?.message || 'An error occurred.'; // Get message from our standardized error
      const apiStatus = err.status; // Get status from our standardized error

      if (apiStatus === 403) { 
        console.log('[handleDownload] Detected 403 error using err.status. Opening subscription modal.');
        // You can customize the message for the modal if needed, e.g. using apiMessage
        setIsSubscriptionModalOpen(true); 
      } else {
        console.log(`[handleDownload] Error is not 403 (status from err.status: ${apiStatus}). Showing generic error message: ${apiMessage}`);
        console.error('Download error details in [id].tsx:', err); 
        setDownloadError(apiMessage); // Use the message from the API if available
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link 
            href="/worksheets" 
            className="text-orange-500 hover:text-orange-600 mr-2 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Worksheets
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="text-center py-12">
              <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
              <p className="text-gray-500">The worksheet you're looking for could not be found or there was an error loading it.</p>
              <Link 
                href="/worksheets" 
                className="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition duration-300"
              >
                Browse All Worksheets
              </Link>
            </CardContent>
          </Card>
        ) : worksheet ? (
          <>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Worksheet Preview */}
              <div className="lg:w-1/3">
                <Card className="h-full">
                  <div className="relative w-full h-64 bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={worksheet.imageUrl || '/images/Worksheet-logo-image.png'}
                      alt={worksheet.title}
                      className="w-full h-full object-contain rounded-t-lg"
                    />
                  </div>
                  <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {worksheet.subscriptionLevel && (
                        <Badge className={getSubscriptionLevelColor(worksheet.subscriptionLevel)}>
                          {worksheet.subscriptionLevel}
                        </Badge>
                      )}
                      <Badge className={getSubjectColor(worksheet.subject)}>
                        {worksheet.subject}
                      </Badge>
                      <Badge variant="outline">
                        {worksheet.grade}
                      </Badge>
                      <Badge className={getDifficultyColor(worksheet.difficulty)}>
                        {worksheet.difficulty}
                      </Badge>
                    </div>
                    {/* Conditional rendering for download button */}
                    {/* The 'downloads • Created Date' text has been removed. The button below is now the primary action item in this section. */}
                    {isAuthenticated && worksheet && worksheet.fileKey && (
                      <Button 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition duration-300 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {isDownloading ? 'Downloading...' : 'Download'}
                      </Button>
                    )}
                    {/* If not authenticated or no fileKey, nothing else is explicitly rendered here regarding download options */}
                    {downloadError && <p className="text-sm text-red-500 mt-2 text-center">Error: {downloadError}</p>}
                  </CardContent>
                </Card>
              </div>

              {/* Worksheet Details */}
              <div className="lg:w-2/3">
                <Card className="h-full">
                  <CardHeader>
                    <h1 className="text-2xl font-bold text-gray-900">{worksheet.title}</h1>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6"> {/* Replaced prose for more direct control, added space-y-6 for overall spacing */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Grade</h3>
                          <p className="mt-1 text-lg text-gray-900">{worksheet.grade || 'N/A'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                          <p className="mt-1 text-lg text-gray-900">{worksheet.subject || 'N/A'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Title</h3>
                          <p className="mt-1 text-lg text-gray-900">{worksheet.title || 'N/A'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Description</h3>
                          <p className="mt-1 text-gray-700 leading-relaxed">{worksheet.description || 'No description available.'}</p>
                        </div>
                      </div>
                      
                      <div> {/* Wrapper for Preview section */} 
                        <h2 className="text-xl font-semibold mb-3 text-gray-800">Preview</h2>
                        {/* Document Preview Logic with subscription check */} 
                        {canUserAccessWorksheet(worksheet.subscriptionLevel, user?.role, user?.activeSubscription?.plan?.name) ? (
                          <div className="bg-gray-100 rounded-lg border border-gray-300 mb-6 min-h-[500px] overflow-hidden">
                            {worksheet.fileUrl && worksheet.mimeType === 'application/pdf' ? (
                            <iframe 
                              src={worksheet.fileUrl} 
                              title={`${worksheet.title} Preview`} 
                              width="100%" 
                              height="500px" 
                              style={{ border: 'none' }}
                            />
                          ) : worksheet.fileUrl && (worksheet.mimeType === 'application/msword' || worksheet.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') ? (
                            <div className="p-6 text-center flex flex-col items-center justify-center h-full">
                              <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path><path d="M14.5 3.5V9h5.5"></path><path d="M9 13h6"></path><path d="M9 17h3"></path></svg>
                              <p className="text-gray-600 font-medium">Preview is not available for Word documents.</p>
                              <p className="text-sm text-gray-500 mt-1">Please download the file to view its content.</p>
                              {isAuthenticated && worksheet.fileKey && (
                                <Button 
                                  onClick={handleDownload}
                                  disabled={isDownloading}
                                  variant="outline"
                                  size="sm"
                                  className="mt-4"
                                >
                                  {isDownloading ? 'Downloading...' : 'Download'}
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="p-6 text-center flex flex-col items-center justify-center h-full">
                               <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path d="M7.828 19.828a4 4 0 01-5.656 0M12 6V5m0 14v-1m4.95-11.05l.707-.707m-10.607 0l-.707.707M5.05 19.95l.707.707m10.607 0l-.707-.707"></path></svg>
                              <p className="text-gray-600 font-medium">No preview available for this worksheet.</p>
                              {worksheet.fileKey && isAuthenticated && (
                                <p className="text-sm text-gray-500 mt-1">You can try downloading the file.</p>
                              )}
                            </div>
                          )}
                          </div>
                        ) : (
                          <div className="bg-gray-100 rounded-lg border border-gray-300 mb-6 min-h-[300px] overflow-hidden p-6 text-center flex flex-col items-center justify-center">
                            <svg className="w-12 h-12 text-orange-500 mb-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 15v2m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path><path d="M9 12l2 2 4-4"></path></svg>
                            <p className="text-gray-700 font-medium mb-2">
                              A <span className="font-semibold">{worksheet.subscriptionLevel}</span> subscription is required to preview this worksheet.
                            </p>
                            <Link href="/pricing" passHref>
                              <Button className="mt-2 bg-orange-500 hover:bg-orange-600 text-white">
                                Upgrade Your Plan
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Related Worksheets section removed */}

          </>
        ) : null}

        <Modal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} size="md">
          <ModalHeader onClose={() => setIsSubscriptionModalOpen(false)}>
            Premium Subscription Required
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-600">
              This worksheet is a premium resource. To download it, you need an active Premium subscription.
            </p>
            <p className="text-gray-600 mt-2">
              Upgrade your plan to get unlimited access to all our premium content.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsSubscriptionModalOpen(false)}>
              Close
            </Button>
            <Link href="/pricing">
              <Button>Upgrade Now</Button>
            </Link>
          </ModalFooter>
        </Modal>

      </div>
    </MainLayout>
  );
};

export default WorksheetDetailPage;
