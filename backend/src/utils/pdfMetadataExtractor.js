const pdfParse = require('pdf-parse');

/**
 * Extract metadata (Grade, Subject, Title) from PDF content
 * @param {Buffer} pdfBuffer The PDF file buffer
 * @return {Promise<Object>} Extracted metadata
 */
async function extractPdfMetadata(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text;
    
    // Extract grade (e.g., "Grade 5", "Grade: 3", "Class 4")
    const gradeMatch = text.match(/Grade\s*:?\s*(\d+)/i) || 
                       text.match(/Class\s*:?\s*(\d+)/i) ||
                       text.match(/\b(Grade|Class)\s*(\d+)\b/i);
    
    const grade = gradeMatch ? (gradeMatch[1] || gradeMatch[2]) : '';
    
    // Extract subject (e.g., "Subject: Math", "Mathematics", "English")
    const commonSubjects = ['Math', 'Mathematics', 'English', 'Science', 'History', 
                           'Geography', 'Social Studies', 'Physics', 'Chemistry', 'Biology'];
    
    let subject = '';
    
    // Try to find subject with a label first
    const subjectLabelMatch = text.match(/Subject\s*:?\s*([A-Za-z\s]+?)(?:\n|\.|\,)/i);
    if (subjectLabelMatch) {
      subject = subjectLabelMatch[1].trim();
    } else {
      // Try to find any common subject mentioned in the text
      for (const commonSubject of commonSubjects) {
        const regex = new RegExp(`\\b${commonSubject}\\b`, 'i');
        if (regex.test(text)) {
          subject = commonSubject;
          break;
        }
      }
    }
    
    // Extract title
    // First try to find an explicit title
    const titleMatch = text.match(/Title\s*:?\s*([^\n]+)/i) ||
                      text.match(/Worksheet\s*:?\s*([^\n]+)/i) ||
                      text.match(/Topic\s*:?\s*([^\n]+)/i);
    
    let title = '';
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else if (data.info && data.info.Title) {
      // Use PDF metadata title if available
      title = data.info.Title;
    } else {
      // Use the first non-empty line as a fallback title
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      if (lines.length > 0) {
        title = lines[0].trim();
        // Limit title length
        if (title.length > 100) {
          title = title.substring(0, 97) + '...';
        }
      }
    }
    
    // If we still don't have a title, create one from subject and grade
    if (!title && (subject || grade)) {
      title = `${subject || 'General'} Worksheet${grade ? ' for Grade ' + grade : ''}`;
    } else if (!title) {
      title = 'Educational Worksheet';
    }
    
    // Generate description
    let description = '';
    if (subject && grade) {
      description = `${subject} worksheet for Grade ${grade} students.`;
    } else if (subject) {
      description = `${subject} worksheet for students.`;
    } else if (grade) {
      description = `Educational worksheet for Grade ${grade} students.`;
    } else {
      description = 'Educational worksheet for students.';
    }
    
    // Generate keywords
    const keywords = [];
    if (subject) keywords.push(subject);
    if (grade) keywords.push(`Grade ${grade}`);
    keywords.push('worksheet', 'education', 'learning');
    
    return {
      grade,
      subject,
      title,
      description,
      subscriptionLevel: 'Free', // Default to Free as requested
      keywords: [...new Set(keywords)] // Remove duplicates
    };
  } catch (error) {
    console.error('Error extracting PDF metadata:', error);
    return {
      grade: '',
      subject: '',
      title: 'Educational Worksheet',
      description: 'Educational worksheet for students.',
      subscriptionLevel: 'Free',
      keywords: ['worksheet', 'education', 'learning']
    };
  }
}

module.exports = {
  extractPdfMetadata
};
