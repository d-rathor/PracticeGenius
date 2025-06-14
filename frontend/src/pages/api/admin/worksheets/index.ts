import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import formidable from 'formidable';
import fs from 'fs';
// import path from 'path'; // path is not used in the POST logic directly, can be omitted if not needed by GET
import FormData from 'form-data';

/**
 * @route   GET /api/admin/worksheets
 * @desc    Get all worksheets (admin only)
 * @access  Private/Admin
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {

  try {
    // Get token from request headers
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('No authorization token found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Forward request to backend API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/worksheets`;
    console.log('Fetching worksheets from backend:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('Backend API error response status:', response.status);
      
      // Forward the error response
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch worksheets' }));
      return res.status(response.status).json(errorData);
    }

    // Parse and return the worksheets data
    const data = await response.json();
    console.log('Worksheets fetched successfully:', data);
    
    // Return the data in the format expected by the frontend
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in worksheets API route:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
} else if (req.method === 'POST') {
    console.log('Worksheets API handler (POST in index.ts) called');
    // Copied POST logic from former worksheets.ts
    try {
      const token = req.headers.authorization?.split(' ')[1];
      console.log('Auth token present:', !!token);
      
      if (!token) {
        console.log('No authorization token found');
        return res.status(401).json({ message: 'Unauthorized' });
      }

      console.log('Starting to parse form data...');
      const form = formidable({
        multiples: false,
        maxFieldsSize: 20 * 1024 * 1024, 
        maxFileSize: 200 * 1024 * 1024, 
        maxFields: 1000, 
        encoding: 'utf-8', 
        keepExtensions: true 
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
      
      console.log('Raw form fields received:', fields);
      
      const worksheetData = {
        title: fields.title ? String(fields.title) : '',
        subject: fields.subject ? String(fields.subject) : '',
        grade: fields.grade ? String(fields.grade) : '',
        difficulty: fields.difficulty ? String(fields.difficulty) : 'medium',
        description: fields.description ? String(fields.description) : '',
        content: fields.content ? String(fields.content) : '', 
        subscriptionPlanId: fields.subscriptionPlanId ? String(fields.subscriptionPlanId) : '',
      };
      
      console.log('Extracted worksheet data with full values:', {
        title: worksheetData.title,
        subject: worksheetData.subject,
        grade: worksheetData.grade,
        difficulty: worksheetData.difficulty,
        subscriptionPlanId: worksheetData.subscriptionPlanId,
        description: worksheetData.description.length > 30 ? 
          `${worksheetData.description.substring(0, 30)}... (${worksheetData.description.length} chars)` : 
          worksheetData.description,
        content: worksheetData.content.length > 30 ? 
          `${worksheetData.content.substring(0, 30)}... (${worksheetData.content.length} chars)` : 
          worksheetData.content
      });

      console.log('Extracted worksheet data:', worksheetData);

      if (!worksheetData.title || !worksheetData.subject || !worksheetData.grade || 
          !worksheetData.description || !worksheetData.content || !worksheetData.subscriptionPlanId) {
        console.log('Validation failed - missing required fields');
        return res.status(400).json({ message: 'Please provide all required fields' });
      }

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

      let subscriptionLevel = 'Free';
      console.log('Subscription Plan ID:', worksheetData.subscriptionPlanId);
      
      try {
        const PLAN_ID_MAPPING = {
          '6845887ac00cddf1f741f6c0': 'Free',
          '6845887ac00cddf1f741f6c1': 'Essential',
          '6845887ac00cddf1f741f6c2': 'Premium'
        };
        
        if (worksheetData.subscriptionPlanId in PLAN_ID_MAPPING) {
          subscriptionLevel = PLAN_ID_MAPPING[worksheetData.subscriptionPlanId as keyof typeof PLAN_ID_MAPPING];
          console.log(`Found exact match for plan ID: ${worksheetData.subscriptionPlanId} -> ${subscriptionLevel}`);
        }
        else if (worksheetData.subscriptionPlanId && worksheetData.subscriptionPlanId.length >= 24) {
          console.log('Attempting to fetch plan details from API...');
          try {
            const planResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/subscription-plans/${worksheetData.subscriptionPlanId}`);
            
            if (planResponse.ok) {
              const planData = await planResponse.json();
              console.log('Subscription plan data from API:', planData);
              
              if (planData.success && planData.data && planData.data.name) {
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
        
        if (subscriptionLevel === 'Free') {
          const planIdLower = worksheetData.subscriptionPlanId.toLowerCase();
          if (planIdLower.includes('premium')) {
            subscriptionLevel = 'Premium';
            console.log('Matched Premium via string inclusion');
          } 
          else if (planIdLower.includes('essential')) {
            subscriptionLevel = 'Essential';
            console.log('Matched Essential via string inclusion');
          }
        }
        console.log('Final subscription level determined:', subscriptionLevel);
      } catch (error) {
        console.error('Error mapping subscription plan ID to level:', error);
      }
      
      console.log('Mapped subscription level:', subscriptionLevel);
      const { subscriptionPlanId, ...otherData } = worksheetData;
      console.log('Subscription level mapped to:', subscriptionLevel);
      
      const formData = new FormData();
      console.log('Complete worksheet data being sent to backend:', {
        title: worksheetData.title,
        subject: worksheetData.subject,
        grade: worksheetData.grade,
        difficulty: worksheetData.difficulty,
        description: worksheetData.description.substring(0, 20) + '...',
        content: worksheetData.content.substring(0, 20) + '...',
        subscriptionLevel: subscriptionLevel
      });
      
      formData.append('title', String(worksheetData.title));
      formData.append('subject', String(worksheetData.subject));
      formData.append('grade', String(worksheetData.grade));
      formData.append('difficulty', String(worksheetData.difficulty || 'medium'));
      formData.append('description', String(worksheetData.description));
      formData.append('content', String(worksheetData.content));
      formData.append('subscriptionLevel', String(subscriptionLevel));
      formData.append('subscriptionPlanId', String(worksheetData.subscriptionPlanId));
      
      try {
        console.log('Adding file to form data from path:', pdfFile.filepath);
        const fileStream = fs.createReadStream(pdfFile.filepath);
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
    } catch (error) {
      console.error('Error creating worksheet:', error);
      return res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : String(error) });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
