import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
// Use built-in form-data package which is compatible with node-fetch
import FormData from 'form-data';

// Configure API to not parse the body, as we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * @route   POST /api/admin/worksheets
 * @desc    Create a new worksheet (admin only)
 * @access  Private/Admin
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Worksheets API handler called with method:', req.method);
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from request headers
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Auth token present:', !!token);
    
    if (!token) {
      console.log('No authorization token found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Parse form data
    console.log('Starting to parse form data...');
    // Configure formidable with options to prevent truncation
    const form = formidable({
      multiples: false,
      maxFieldsSize: 20 * 1024 * 1024, // 20MB max field size
      maxFileSize: 200 * 1024 * 1024, // 200MB max file size
      maxFields: 1000, // Allow more fields
      encoding: 'utf-8', // Ensure proper encoding
      keepExtensions: true // Keep file extensions
    });
    
    const parseForm = async (): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
      return new Promise((resolve, reject) => {
        form.parse(req, (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
          if (err) {
            console.error('Error parsing form:', err);
            reject(err);
            return;
          }
          console.log('Form parsed successfully');
          console.log('Fields received:', Object.keys(fields));
          console.log('Files received:', Object.keys(files));
          resolve({ fields, files });
        });
      });
    };

    // Parse the form and get fields and files
    let fields: formidable.Fields;
    let files: formidable.Files;
    
    try {
      const result = await parseForm();
      fields = result.fields;
      files = result.files;
      console.log('Form parsing completed');
    } catch (formError) {
      console.error('Form parsing failed:', formError);
      return res.status(400).json({ message: 'Error parsing form data', details: formError instanceof Error ? formError.message : String(formError) });
    }
    
    // Log raw fields for debugging
    console.log('Raw form fields received:', fields);
    
    // Extract form data - ensure we're getting the complete values
    const worksheetData = {
      title: fields.title ? String(fields.title) : '',
      subject: fields.subject ? String(fields.subject) : '',
      grade: fields.grade ? String(fields.grade) : '',
      difficulty: fields.difficulty ? String(fields.difficulty) : 'medium',
      description: fields.description ? String(fields.description) : '',
      content: fields.content ? String(fields.content) : '',
      subscriptionPlanId: fields.subscriptionPlanId ? String(fields.subscriptionPlanId) : '',
    };
    
    // Debug log to verify we're getting the full values
    console.log('Extracted worksheet data with full values:', {
      title: worksheetData.title,
      subject: worksheetData.subject,
      grade: worksheetData.grade,
      difficulty: worksheetData.difficulty,
      subscriptionPlanId: worksheetData.subscriptionPlanId,
      // Only show part of longer fields
      description: worksheetData.description.length > 30 ? 
        `${worksheetData.description.substring(0, 30)}... (${worksheetData.description.length} chars)` : 
        worksheetData.description,
      content: worksheetData.content.length > 30 ? 
        `${worksheetData.content.substring(0, 30)}... (${worksheetData.content.length} chars)` : 
        worksheetData.content
    });

    // Log the extracted data for debugging
    console.log('Extracted worksheet data:', worksheetData);

    // Validate required fields
    if (!worksheetData.title || !worksheetData.subject || !worksheetData.grade || 
        !worksheetData.description || !worksheetData.content || !worksheetData.subscriptionPlanId) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if file is present
    const pdfFile = files.file as formidable.File | formidable.File[];
    
    if (!pdfFile) {
      console.error('No file uploaded');
      return res.status(400).json({ message: 'Please upload a worksheet file' });
    }
    
    if (!pdfFile || Array.isArray(pdfFile)) {
      console.error('Invalid file format or multiple files uploaded');
      return res.status(400).json({ message: 'Please upload a single valid worksheet file' });
    }
    
    console.log('File received:', pdfFile.originalFilename, 'Size:', pdfFile.size, 'Type:', pdfFile.mimetype);

    // Map the subscription plan ID to subscription level
    // This is a direct mapping approach without requiring an extra API call
    let subscriptionLevel = 'Free'; // Default to Free
    
    // Log the subscription plan ID for debugging
    console.log('Subscription Plan ID:', worksheetData.subscriptionPlanId);
    
    // Direct mapping based on subscription plan ID
    try {
      // Hard-coded mapping for known MongoDB IDs
      const PLAN_ID_MAPPING = {
        '6845887ac00cddf1f741f6c0': 'Free',
        '6845887ac00cddf1f741f6c1': 'Essential',
        '6845887ac00cddf1f741f6c2': 'Premium'
      };
      
      // First check if we have an exact match in our mapping
      if (worksheetData.subscriptionPlanId in PLAN_ID_MAPPING) {
        subscriptionLevel = PLAN_ID_MAPPING[worksheetData.subscriptionPlanId as keyof typeof PLAN_ID_MAPPING];
        console.log(`Found exact match for plan ID: ${worksheetData.subscriptionPlanId} -> ${subscriptionLevel}`);
      }
      // If no exact match, try to fetch from API if it looks like a valid MongoDB ID
      else if (worksheetData.subscriptionPlanId && worksheetData.subscriptionPlanId.length >= 24) {
        console.log('Attempting to fetch plan details from API...');
        try {
          const planResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/subscription-plans/${worksheetData.subscriptionPlanId}`);
          
          if (planResponse.ok) {
            const planData = await planResponse.json();
            console.log('Subscription plan data from API:', planData);
            
            if (planData.success && planData.data && planData.data.name) {
              // Use the plan name directly as the subscription level
              subscriptionLevel = planData.data.name;
              console.log('Using subscription level from API:', subscriptionLevel);
            }
          } else {
            console.log('Failed to fetch plan details, status:', planResponse.status);
          }
        } catch (fetchError) {
          console.error('Error fetching plan details:', fetchError);
        }
      }
      
      // If we still have the default 'Free' value, try string matching
      if (subscriptionLevel === 'Free') {
        const planIdLower = worksheetData.subscriptionPlanId.toLowerCase();
        
        // Check for premium in the ID
        if (planIdLower.includes('premium')) {
          subscriptionLevel = 'Premium';
          console.log('Matched Premium via string inclusion');
        } 
        // Check for essential in the ID
        else if (planIdLower.includes('essential')) {
          subscriptionLevel = 'Essential';
          console.log('Matched Essential via string inclusion');
        }
      }
      
      console.log('Final subscription level determined:', subscriptionLevel);
    } catch (error) {
      console.error('Error mapping subscription plan ID to level:', error);
      // Continue with default Free level if there's an error
    }
    
    console.log('Mapped subscription level:', subscriptionLevel);
    
    // Prepare data for backend API
    const { subscriptionPlanId, ...otherData } = worksheetData;
    
    console.log('Subscription level mapped to:', subscriptionLevel);
    
    // Create a FormData object for the backend request
    const formData = new FormData();
    
    // Log the complete worksheet data before sending
    console.log('Complete worksheet data being sent to backend:', {
      title: worksheetData.title,
      subject: worksheetData.subject,
      grade: worksheetData.grade,
      difficulty: worksheetData.difficulty,
      description: worksheetData.description.substring(0, 20) + '...', // Log partial description for brevity
      content: worksheetData.content.substring(0, 20) + '...', // Log partial content for brevity
      subscriptionLevel: subscriptionLevel
    });
    
    // Add all the text fields - ensure we're sending the complete strings
    formData.append('title', String(worksheetData.title));
    formData.append('subject', String(worksheetData.subject));
    formData.append('grade', String(worksheetData.grade));
    formData.append('difficulty', String(worksheetData.difficulty || 'medium'));
    formData.append('description', String(worksheetData.description));
    formData.append('content', String(worksheetData.content));
    formData.append('subscriptionLevel', String(subscriptionLevel)); // Use the mapped subscription level
    formData.append('subscriptionPlanId', String(worksheetData.subscriptionPlanId)); // Also send the original ID
    
    // Add the file directly from the filesystem
    try {
      console.log('Adding file to form data from path:', pdfFile.filepath);
      // Create a readable stream from the file
      const fileStream = fs.createReadStream(pdfFile.filepath);
      
      // Append the file stream with field name 'file'
      formData.append('file', fileStream, {
        filename: pdfFile.originalFilename || 'worksheet.pdf',
        contentType: pdfFile.mimetype || 'application/pdf'
      });
      
      console.log('Making direct request to backend API with file...');
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/worksheets`;
      console.log('Backend URL:', backendUrl);
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type, it will be set automatically with the boundary
        },
        body: formData
      });

      console.log('Backend API response status:', response.status);

      if (!response.ok) {
        console.error('Backend API error response status:', response.status);
        
        try {
          const errorData = await response.json();
          console.error('Backend API error response data:', errorData);
          return res.status(response.status).json(errorData);
        } catch (parseError) {
          console.error('Could not parse error response from backend:', parseError);
          
          try {
            const errorText = await response.text();
            console.error('Backend API error response text:', errorText);
            return res.status(response.status).json({ message: errorText || 'Unknown error from backend' });
          } catch (textError) {
            console.error('Could not get error text from backend:', textError);
            return res.status(response.status).json({ message: 'Unknown error from backend' });
          }
        }
      }
      
      // Try to parse the successful response
      try {
        const responseData = await response.json();
        console.log('Backend API success response:', responseData);
        return res.status(201).json(responseData);
      } catch (parseError) {
        console.error('Could not parse success response from backend:', parseError);
        return res.status(201).json({ message: 'Worksheet created successfully' });
      }
    } catch (fetchError) {
      console.error('Error making request to backend API:', fetchError);
      return res.status(500).json({ message: 'Error connecting to backend API', details: fetchError instanceof Error ? fetchError.message : String(fetchError) });
    }

    // Response is already handled in the try/catch block above
  } catch (error) {
    console.error('Error creating worksheet:', error);
    return res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : String(error) });
  }
}
