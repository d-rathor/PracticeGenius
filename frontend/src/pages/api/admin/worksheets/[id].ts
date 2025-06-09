import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import formidable from 'formidable';
import fs from 'fs';

// Define the File interface for formidable
interface FormidableFile {
  filepath: string;
  originalFilename: string | null;
  newFilename: string;
  mimetype: string | null;
  size: number;
  [key: string]: any;
}

// Required for formidable to parse form data
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * @route   GET /api/admin/worksheets/[id]
 * @desc    Get a single worksheet by ID (admin only)
 * @access  Private/Admin
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  console.log(`API handler called for worksheet ID: ${id} with method: ${req.method}`);
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getWorksheet(req, res, id as string);
    case 'PUT':
      return updateWorksheet(req, res, id as string);
    case 'DELETE':
      return deleteWorksheet(req, res, id as string);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

/**
 * Get a single worksheet by ID
 */
async function getWorksheet(req: NextApiRequest, res: NextApiResponse, id: string) {
  console.log(`GET /api/admin/worksheets/${id} called`);
  
  try {
    // Get token from request headers
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Auth token present:', !!token);
    
    if (!token) {
      console.log('No authorization token found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Forward request to backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/worksheets/${id}`;
    console.log('Fetching worksheet from backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
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
        return res.status(response.status).json({ message: 'Error fetching worksheet from backend' });
      }
    }
    
    // Parse and return the worksheet data
    const worksheetData = await response.json();
    console.log('Worksheet data fetched successfully:', worksheetData);
    
    // Handle different response structures
    const data = worksheetData.data || worksheetData;
    console.log('Processed worksheet data:', data);
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in getWorksheet:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Update a worksheet by ID
 */
async function updateWorksheet(req: NextApiRequest, res: NextApiResponse, id: string) {
  console.log(`PUT /api/admin/worksheets/${id} called`);
  
  try {
    // Get token from request headers
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Auth token present:', !!token);
    
    if (!token) {
      console.log('No authorization token found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Parse form data with formidable
    const form = formidable({
      maxFileSize: 200 * 1024 * 1024, // 200MB
      maxFieldsSize: 20 * 1024 * 1024, // 20MB
      maxFields: 10,
      keepExtensions: true,
      encoding: 'utf-8',
      multiples: false
    });

    // Parse the form data
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Error parsing form data:', err);
          reject(err);
          return;
        }
        resolve([fields, files]);
      });
    });

    console.log('Form fields received:', fields);
    console.log('Files received:', files);

    // Convert fields to string values
    const title = String(fields.title || '');
    const subject = String(fields.subject || '');
    const grade = String(fields.grade || '');
    const difficulty = String(fields.difficulty || 'medium');
    const description = String(fields.description || '');
    const content = String(fields.content || '');

    console.log('Processed fields:', { title, subject, grade, difficulty });

    // Create form data for backend API
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('grade', grade);
    formData.append('difficulty', difficulty);
    formData.append('description', description);
    formData.append('content', content);

    // Handle file upload if present
    if (files.pdfFile) {
      // Handle both single file and array of files (formidable can return either)
      const pdfFile = Array.isArray(files.pdfFile) 
        ? files.pdfFile[0] as unknown as FormidableFile 
        : files.pdfFile as unknown as FormidableFile;
      
      if (pdfFile && pdfFile.filepath) {
        console.log('PDF file found:', pdfFile.originalFilename);
        const fileBuffer = fs.readFileSync(pdfFile.filepath);
        
        // Create a Blob from the file buffer
        const file = new Blob([fileBuffer]);
        formData.append('file', file, pdfFile.originalFilename || 'worksheet.pdf');
      }
    }

    // Forward request to backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/worksheets/${id}`;
    console.log('Updating worksheet at backend:', backendUrl);
    
    // Create a JSON object with the form fields
    const updateData: Record<string, any> = {
      title,
      subject,
      grade,
      difficulty,
      description,
      content
    };
    
    console.log('Update data:', updateData);
    
    // Check if we have a file to upload
    let hasFile = false;
    if (files.pdfFile) {
      const fileObj = files.pdfFile;
      if (Array.isArray(fileObj) && fileObj.length > 0) {
        hasFile = true;
        console.log('File found in array');
      } else if (!Array.isArray(fileObj) && fileObj && typeof fileObj === 'object') {
        hasFile = true;
        console.log('File found as object');
      }
    }
    
    // If we have a file, use multipart/form-data, otherwise use JSON
    let response;
    
    if (hasFile) {
      // Use FormData for file uploads
      const FormData = require('form-data');
      const nodeFetchFormData = new FormData();
      
      // Add all the fields to the FormData
      Object.entries(updateData).forEach(([key, value]) => {
        nodeFetchFormData.append(key, String(value));
      });
      
      // Handle the file
      try {
        const fileObj = files.pdfFile;
        let filePath = '';
        let fileName = 'worksheet.pdf';
        let mimeType = 'application/pdf';
        
        if (Array.isArray(fileObj) && fileObj.length > 0) {
          if (fileObj[0] && typeof fileObj[0] === 'object') {
            // Use type assertion to access properties safely
            const file = fileObj[0] as any;
            filePath = file.filepath || '';
            fileName = file.originalFilename || 'worksheet.pdf';
            mimeType = file.mimetype || 'application/pdf';
          }
        } else if (!Array.isArray(fileObj) && fileObj && typeof fileObj === 'object') {
          // Use type assertion to access properties safely
          const file = fileObj as any;
          filePath = file.filepath || '';
          fileName = file.originalFilename || 'worksheet.pdf';
          mimeType = file.mimetype || 'application/pdf';
        }
        
        if (filePath) {
          console.log(`Adding file: ${fileName} (${mimeType})`);
          const fileStream = fs.createReadStream(filePath);
          nodeFetchFormData.append('file', fileStream, {
            filename: fileName,
            contentType: mimeType
          });
        }
      } catch (fileError) {
        console.error('Error processing file:', fileError);
      }
      
      // Send the request with FormData
      response = await fetch(backendUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...nodeFetchFormData.getHeaders()
        },
        body: nodeFetchFormData
      });
    } else {
      // Use JSON for requests without files
      response = await fetch(backendUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
    }
    
    console.log('Backend API response status:', response.status);
    
    // Get the response text first
    const responseText = await response.text();
    console.log('Response text length:', responseText.length);
    
    // Try to parse as JSON if possible
    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      responseData = { message: responseText || 'Unknown response from server' };
    }
    
    if (!response.ok) {
      console.error('Backend API error response status:', response.status);
      console.error('Backend API error response data:', responseData);
      return res.status(response.status).json(responseData);
    }
    
    console.log('Worksheet updated successfully');
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error in updateWorksheet:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Delete a worksheet by ID
 */
async function deleteWorksheet(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Get token from request headers
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Auth token present:', !!token);
    
    if (!token) {
      console.log('No authorization token found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Forward delete request to backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/worksheets/${id}`;
    console.log('Deleting worksheet from backend:', backendUrl);
    
    try {
      const response = await fetch(backendUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Backend API delete response status:', response.status);
      
      // Even if the response is not OK, we'll try to handle it gracefully
      // The backend might return a 404 if the worksheet is already deleted
      if (response.status === 404) {
        console.log('Worksheet not found, might be already deleted');
        return res.status(200).json({ success: true, message: 'Worksheet deleted successfully' });
      }
      
      if (!response.ok) {
        console.error('Backend API error response status:', response.status);
        
        try {
          const errorData = await response.json();
          console.error('Backend API error response data:', errorData);
          return res.status(response.status).json(errorData);
        } catch (parseError) {
          console.error('Could not parse error response from backend:', parseError);
          return res.status(response.status).json({ message: 'Error deleting worksheet from backend' });
        }
      }
    } catch (fetchError) {
      console.error('Fetch error when deleting worksheet:', fetchError);
      return res.status(500).json({ message: 'Network error when trying to delete worksheet' });
    }
    
    // Since we've already handled error cases, we can just return success
    return res.status(200).json({ success: true, message: 'Worksheet deleted successfully' });
  } catch (error) {
    console.error('Error in deleteWorksheet:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
