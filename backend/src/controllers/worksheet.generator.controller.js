const Joi = require('joi');
const { default: httpStatus } = require('http-status');
const OpenAI = require('openai');
const Replicate = require('replicate');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const catchAsync = require('../utils/catchAsync');

// Initialize OpenAI client (for DALL-E image generation) - DEPRECATED
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Initialize Replicate client (for Stable Diffusion image generation)
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Initialize Google Gemini client (for text generation)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const worksheetGeneratorSchema = Joi.object({
  grade: Joi.string().required(),
  subject: Joi.string().required(),
  topic: Joi.string().required(),
  customTopic: Joi.string().allow('').optional(), // Allow customTopic field from frontend
  summary: Joi.string().allow('').optional(),
  numOfQuestions: Joi.number().integer().min(1).max(20).required(),
  includeImages: Joi.boolean().required(),
  generateAnswerKey: Joi.boolean().required(),
});

const generateWorksheet = catchAsync(async (req, res) => {
  const { error, value } = worksheetGeneratorSchema.validate(req.body);
  if (error) {
    console.error('Joi validation error:', error.details[0].message);
    return res.status(httpStatus.BAD_REQUEST).json({ 
      error: `Invalid input: ${error.details[0].message}`,
      success: false 
    });
  }

  const { grade, subject, topic, customTopic, summary, numOfQuestions, includeImages, generateAnswerKey } = value;
  
  // Use custom topic if provided
  const finalTopic = topic === 'Create your own topic' ? customTopic : topic;
  
  if (!finalTopic || finalTopic.trim() === '') {
    return res.status(httpStatus.BAD_REQUEST).json({ 
      error: 'Topic is required. Please select a topic or provide a custom topic.',
      success: false 
    });
  }

  console.log(`Starting worksheet generation: Grade ${grade}, Subject ${subject}, Topic ${finalTopic}, Questions ${numOfQuestions}, Images ${includeImages}`);

  // Declare filePath variable in outer scope for error handling
  let filePath;

  try {
    // 1. Generate Questions with Google Gemini
    const subjectContext = {
      'Math': 'Focus on problem-solving, logical reasoning, and practical applications. Include word problems that relate to real-life scenarios.',
      'Science': 'Emphasize scientific method, observation, and cause-and-effect relationships. Include questions about experiments and natural phenomena.',
      'English': 'Focus on reading comprehension, vocabulary, grammar, and creative thinking. Include context-based questions.',
      'History': 'Emphasize chronological thinking, cause and effect, and understanding historical significance.',
      'Geography': 'Focus on spatial thinking, environmental awareness, and cultural understanding.',
    };
    
    const gradeContext = {
      'Grade 1': 'Use simple vocabulary, concrete concepts, and familiar examples. Questions should be straightforward with clear, obvious answers.',
      'Grade 2': 'Use age-appropriate language with basic reasoning. Include simple comparisons and classifications.',
      'Grade 3': 'Introduce basic analysis and simple problem-solving. Use vocabulary appropriate for 8-9 year olds.',
      'Grade 4': 'Include more complex reasoning and multi-step thinking. Vocabulary can be more advanced.',
      'Grade 5': 'Use analytical thinking and abstract concepts. Include questions requiring synthesis of information.',
    };

    const prompt = `
      CONTEXT: You are an expert educator and curriculum designer creating high-quality educational content.
      
      STUDENT PROFILE:
      - Grade Level: ${grade}
      - Subject: ${subject}
      - Topic: "${finalTopic}"
      ${summary ? `- Additional Context: "${summary}"` : ''}
      
      EDUCATIONAL GUIDELINES:
      - ${gradeContext[grade] || 'Use age-appropriate language and concepts for the specified grade level.'}
      - ${subjectContext[subject] || 'Focus on core concepts and practical understanding relevant to the subject.'}
      
      QUALITY STANDARDS:
      - Each question should test understanding, not just memorization
      - Avoid trick questions or ambiguous wording
      - Ensure one clearly correct answer with plausible distractors
      - Use inclusive language and diverse examples
      - Make questions engaging and relevant to students' lives
      
      TASK: Generate exactly ${numOfQuestions} multiple-choice questions following these specifications:
      - Each question has exactly 4 options (A, B, C, D)
      - One clearly correct answer
      - Three plausible but incorrect distractors
      - Questions progress from basic to more challenging
      
      OUTPUT FORMAT: Return a single JSON object with this exact structure:
      {
        "questions": [
          {
            "question": "Question text here?",
            "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
            "answer": "A"
          }
        ]
      }
      
      Do not include markdown backticks or any other formatting.
    `;

    console.log('Sending request to Google Gemini for text generation...');
    
    let result;
    let questions;
    
    try {
      result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text || text.trim() === '') {
        throw new Error('AI service returned empty response');
      }
      
      console.log('Received response from Gemini, parsing JSON...');
      
      // Clean the response text
      let cleanedText = text.trim();
      
      // Remove markdown backticks if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Parse JSON
      const parsedResponse = JSON.parse(cleanedText);
      
      if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
        throw new Error('AI response missing questions array');
      }
      
      questions = parsedResponse.questions;
      
      if (questions.length === 0) {
        throw new Error('AI service returned no questions');
      }
      
      // Validate question structure
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question || !q.options || !q.answer) {
          throw new Error(`Question ${i + 1} is missing required fields (question, options, answer)`);
        }
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Question ${i + 1} must have exactly 4 options`);
        }
        if (!['A', 'B', 'C', 'D'].includes(q.answer)) {
          throw new Error(`Question ${i + 1} answer must be A, B, C, or D`);
        }
      }
      
      console.log(`Successfully generated ${questions.length} questions`);
      
    } catch (error) {
      console.error('Error in AI text generation:', error);
      
      if (error instanceof SyntaxError) {
        throw new Error('Text generation failed: AI service returned invalid data format. Please try again.');
      } else if (error.message && error.message.includes('quota')) {
        throw new Error('Text generation failed: AI service quota exceeded. Please try again later.');
      } else if (error.message && error.message.includes('timeout')) {
        throw new Error('Text generation failed: Request timed out. Please try again with fewer questions.');
      } else if (error.message && error.message.includes('authentication')) {
        throw new Error('Text generation failed: AI service authentication failed. Please contact support.');
      } else if (error.message && error.message.includes('AI service')) {
        throw new Error(error.message);
      } else if (error.message && error.message.includes('missing')) {
        throw new Error(`Text generation failed: ${error.message}`);
      } else {
        throw new Error(`Text generation failed: ${error.message || 'Unknown AI service error'}`);
      }
    }

    // 2. Create PDF Document
    const doc = new PDFDocument({ margin: 50 });
    const timestamp = Date.now();
    const filename = `worksheet-${timestamp}.pdf`;
    filePath = path.join(__dirname, '../../public/worksheets', filename);
    
    // Ensure the worksheets directory exists
    const worksheetsDir = path.dirname(filePath);
    if (!fs.existsSync(worksheetsDir)) {
      fs.mkdirSync(worksheetsDir, { recursive: true });
    }
    
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add logo from Logo6.png (from frontend public folder)
    const logoPath = path.join(__dirname, '../../../frontend/public/images/Logo6.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 380, 2, { 
        fit: [180, 110], // Further increased size while maintaining aspect ratio
        align: 'center',
        valign: 'center'
      });
    } else {
      console.warn('Logo6.png not found at:', logoPath);
    }

    // Add styled header lines on the top left with proper alignment
    const labelX = 50;  // X position for labels
    const valueX = 120; // X position for values (aligned vertically)
    
    // Grade line
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#2C3E50');
    doc.text('Grade:', labelX, 35);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#FF6B35');
    doc.text(grade.toString(), valueX, 35);
    
    // Subject line
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#2C3E50');
    doc.text('Subject:', labelX, 55);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#FF6B35');
    doc.text(subject.toString(), valueX, 55);
    
    // Topic line
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#2C3E50');
    doc.text('Topic:', labelX, 75);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#FF6B35');
    doc.text(finalTopic.toString(), valueX, 75);

    // Generate AI summary of the questions content
    let aiSummary = '';
    try {
      console.log('Generating AI summary of worksheet questions...');
      
      // Extract question text for AI analysis
      const questionTexts = questions.map(q => q.question).join(' | ');
      
      const summaryPrompt = `Analyze these ${subject} questions for Grade ${grade} students about ${finalTopic} and write a brief 40-50 word summary describing the key topics, concepts, and skills covered. Be specific about what students will learn and practice.

Questions: ${questionTexts}

Write a concise summary (40-50 words) focusing on the educational content and learning objectives:`;
      
      const summaryResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: summaryPrompt }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      if (summaryResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        aiSummary = summaryResponse.data.candidates[0].content.parts[0].text.trim();
        console.log('AI summary generated successfully');
      }
    } catch (error) {
      console.warn('Failed to generate AI summary:', error.message);
      // Fallback to basic summary if AI fails
      aiSummary = `Questions cover fundamental concepts in ${finalTopic}, including key principles and practical applications suitable for ${grade} grade level.`;
    }

    // Add Description field below header with proper spacing
    const descriptionY = 95;
    doc.fontSize(9).font('Helvetica').fillColor('#666666');
    
    // Generate enhanced description with AI summary
    let description = '';
    // Always use standard description (ignore user-provided summary)
    description = `This worksheet contains ${numOfQuestions} multiple-choice questions about ${finalTopic} for Grade ${grade} ${subject} students. Practice and test your understanding of key concepts.`;
    
    // Add AI-generated content summary
    if (aiSummary) {
      description += ` ${aiSummary}`;
    }
    
    // Limit total description to 80 words for better formatting
    const words = description.split(' ');
    if (words.length > 80) {
      description = words.slice(0, 80).join(' ') + '...';
    }
    
    // Add description text with proper word wrapping and spacing
    const descriptionHeight = doc.heightOfString(description, {
      width: 495,
      align: 'left',
      lineGap: 3
    });
    
    doc.text(description, 50, descriptionY, {
      width: 495, // Full width minus margins
      align: 'left',
      lineGap: 3
    });

    // Calculate separator position based on description height
    const separatorY = descriptionY + descriptionHeight + 15;
    
    // Modern gradient-style separator line with shadow effect
    doc.strokeColor('#FF6B35').lineWidth(4).moveTo(50, separatorY).lineTo(545, separatorY).stroke();
    doc.strokeColor('#FFB366').lineWidth(1).moveTo(50, separatorY + 3).lineTo(545, separatorY + 3).stroke();

    // Reset text color and position for content with proper spacing
    doc.fillColor('#000000');
    doc.y = separatorY + 25; // Proper spacing after separator

    // 3. Add Questions (and Images) to PDF
    // Process questions sequentially to avoid async timing conflicts
    for (const [index, q] of questions.entries()) {
      if (includeImages) {
        // Enhanced image prompt with educational context
        const imageSubjectContext = {
          'Math': 'mathematical concepts, numbers, shapes, charts, or problem-solving scenarios',
          'Science': 'scientific experiments, nature, animals, plants, or laboratory equipment',
          'English': 'books, reading, writing, letters, or storytelling scenes',
          'History': 'historical figures, ancient civilizations, historical events, or time periods',
          'Geography': 'maps, landscapes, countries, natural features, or cultural elements',
        };
        
        // Create very simple, basic educational images - minimal and uncongested
        const imagePrompt = `Create a very simple, basic educational image for children studying ${subject} in ${grade}.
        
        CONTENT: ${q.question.substring(0, 80)}
        
        STYLE: Very simple, basic flat illustration - not detailed or complex.
        
        LAYOUT - EXTREMELY SIMPLE:
        - Show only 1-2 objects maximum (absolutely NOT congested)
        - Single object centered on white background is preferred
        - If 2 objects, place them far apart with lots of white space
        - Objects must be directly related to the question content
        - No decorative elements or extra details
        
        COLORS AND STYLE:
        - Use only 2-3 basic colors maximum
        - Simple, clear shapes - very basic and recognizable
        - Flat design with no shadows, gradients, or effects
        - Large, bold shapes that are easy to see
        
        OBJECTS - KEEP IT EXTREMELY SIMPLE:
        - Choose ONE simple object that directly relates to the question
        - Examples: single apple, one cat, one tree, one circle
        - Make the object large and centered
        - Use basic, iconic shapes only
        
        BACKGROUND:
        - Pure white background only
        - No patterns, textures, or decorations
        - Lots of empty white space around the object
        
        CRITICAL REQUIREMENTS:
        - NO text, letters, numbers, or words anywhere
        - NO decorative elements or extra details
        - NO complex shapes or realistic details
        - Show only what is essential to the question
        - Very basic, simple, and clean
        - Large object with lots of white space
        
        AVOID COMPLETELY:
        - Multiple objects (unless absolutely necessary)
        - Any text, numbers, or written content
        - Detailed or realistic illustrations
        - Busy or cluttered compositions
        - Small objects or fine details
        - Background elements or decorations
        - Complex colors or shading`;
        
        // Replicate API (Direct Axios Call) with error handling
        let imageUrl = null;
        try {
          console.log(`Starting image generation for question ${index + 1}...`);
          
          if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error('Replicate API token not configured');
          }
          
          // Step 1: Start the prediction
          const predictionResponse = await axios.post('https://api.replicate.com/v1/predictions', {
            version: '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc', // stability-ai/sdxl (latest)
            input: { 
              prompt: imagePrompt,
              width: 768,
              height: 768,
            },
          }, {
            headers: {
              'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout for initial request
          });

          if (!predictionResponse.data || !predictionResponse.data.id) {
            throw new Error('Invalid response from image generation service');
          }

          const predictionId = predictionResponse.data.id;
          console.log(`Starting image generation polling for prediction ${predictionId}`);

          // Step 2: Poll for completion
          let prediction = predictionResponse.data;
          const maxAttempts = 30; // 30 attempts = ~60 seconds max
          let attempts = 0;

          while (prediction.status === 'starting' || prediction.status === 'processing') {
            attempts++;
            if (attempts > maxAttempts) {
              break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            
            console.log(`Polling attempt ${attempts}/${maxAttempts}, status: ${prediction.status}`);
            
            try {
              const resultResponse = await axios.get(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` },
                timeout: 5000 // 5 second timeout for polling requests
              });
              
              if (!resultResponse.data) {
                console.warn('Empty response from image generation polling');
                continue;
              }
              
              prediction = resultResponse.data;
              
            } catch (pollError) {
              console.warn(`Polling attempt ${attempts} failed:`, pollError.message);
              if (attempts >= maxAttempts - 2) {
                throw new Error('Image generation polling failed repeatedly');
              }
              continue;
            }
          }
          
          if (attempts >= maxAttempts) {
            throw new Error(`Image generation timed out after ${maxAttempts * 2} seconds`);
          }

          if (prediction.status === 'failed') {
            throw new Error(`Replicate image generation failed: ${prediction.error}`);
          }

          imageUrl = prediction.output[0];
          
          // Download image to buffer
          try {
            console.log(`Downloading image for question ${index + 1}...`);
            const imageResponse = await axios.get(imageUrl, { 
              responseType: 'arraybuffer',
              timeout: 30000 // 30 second timeout for image download
            });
            
            if (!imageResponse.data || imageResponse.data.length === 0) {
              throw new Error('Downloaded image is empty');
            }
            
            const imageBuffer = Buffer.from(imageResponse.data, 'binary');
            q.imageBuffer = imageBuffer;
            
          } catch (downloadError) {
            console.error(`Failed to download image for question ${index + 1}:`, downloadError);
            
            if (downloadError.code === 'ETIMEDOUT') {
              console.warn('Image download timed out');
            } else if (downloadError.response?.status >= 400) {
              console.warn(`Image download failed with status ${downloadError.response.status}`);
            } else {
              console.warn(`Image download failed: ${downloadError.message}`);
            }
          }
          
        } catch (imageError) {
          console.error(`Image generation failed for question ${index + 1}:`, imageError.message);
          
          // Log specific error types for debugging
          if (imageError.message.includes('Replicate API token')) {
            console.warn('Replicate API token not configured - skipping image generation');
          } else if (imageError.message.includes('timed out')) {
            console.warn('Image generation timed out - continuing without image');
          } else if (imageError.message.includes('failed')) {
            console.warn('Replicate service failed - continuing without image');
          } else {
            console.warn('Unexpected image generation error - continuing without image');
          }
          
          // Continue worksheet generation without image
          q.imageBuffer = null;
        }
      }

      // Check if we need a new page (leave space for at least 100 points)
      if (doc.y > doc.page.height - 150) {
        doc.addPage();
      }
      
      // Create side-by-side layout: Question on left, Image on right
      const currentY = doc.y;
      const leftColumnWidth = 350; // Width for question column
      const rightColumnWidth = 180; // Width for image column
      const leftColumnX = 50; // Left margin
      const rightColumnX = leftColumnX + leftColumnWidth + 20; // Image column starts after question + gap
      
      // Add question and options on the left side
      doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${q.question}`, leftColumnX, currentY, {
        width: leftColumnWidth,
        align: 'left'
      });
      
      // Calculate question text height
      const questionTextHeight = doc.heightOfString(`${index + 1}. ${q.question}`, {
        width: leftColumnWidth
      });
      
      // Position for options (right after question text)
      const optionsY = currentY + questionTextHeight + 5;
      doc.y = optionsY;
      
      // Add options below the question with controlled spacing
      doc.fontSize(11).font('Helvetica');
      q.options.forEach((option, optionIndex) => {
        doc.text(option, leftColumnX, doc.y, {
          width: leftColumnWidth,
          align: 'left'
        });
        doc.y += 18; // Fixed spacing between options
      });
      
      // Add image on the right side if available
      if (includeImages && q.imageBuffer) {
        try {
          const imageY = currentY + 10; // Slight offset from question start
          const imageSize = 120; // Reduced from 180 to 120 pixels for better alignment
          doc.image(q.imageBuffer, rightColumnX, imageY, {
            width: imageSize,
            height: imageSize, // Square aspect ratio
            fit: [imageSize, imageSize]
          });
        } catch (imageError) {
          console.warn(`Failed to add image to PDF for question ${index + 1}:`, imageError.message);
        }
      }
      
      // Add some spacing after each question
      doc.y += 20;
    }

    // 4. Ready to finalize (footer elements disabled)
    
    // 5. Finalize PDF
    doc.end();

    // Wait for PDF to be written
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    console.log(`Worksheet PDF created: ${filename}`);

    // 6. Generate Answer Key (if requested)
    let answerKeyUrl = null;
    if (generateAnswerKey) {
      const answerKeyFilename = `answer-key-${timestamp}.pdf`;
      const answerKeyPath = path.join(__dirname, '../../public/worksheets', answerKeyFilename);
      
      const answerDoc = new PDFDocument({ margin: 50 });
      const answerStream = fs.createWriteStream(answerKeyPath);
      answerDoc.pipe(answerStream);

      // Add logo from Logo6.png (same as worksheet)
      if (fs.existsSync(logoPath)) {
        answerDoc.image(logoPath, 380, 2, { 
          fit: [180, 110], // Further increased size while maintaining aspect ratio
          align: 'center',
          valign: 'center'
        });
      } else {
        console.warn('Logo6.png not found for answer key at:', logoPath);
      }

      // Add styled header lines on the top left with proper alignment (same as worksheet)
      const answerLabelX = 50;  // X position for labels
      const answerValueX = 120; // X position for values (aligned vertically)
      
      // Grade line
      answerDoc.fontSize(14).font('Helvetica-Bold').fillColor('#2C3E50');
      answerDoc.text('Grade:', answerLabelX, 35);
      answerDoc.fontSize(12).font('Helvetica-Bold').fillColor('#FF6B35');
      answerDoc.text(grade.toString(), answerValueX, 35);
      
      // Subject line
      answerDoc.fontSize(14).font('Helvetica-Bold').fillColor('#2C3E50');
      answerDoc.text('Subject:', answerLabelX, 55);
      answerDoc.fontSize(12).font('Helvetica-Bold').fillColor('#FF6B35');
      answerDoc.text(subject.toString(), answerValueX, 55);
      
      // Topic line
      answerDoc.fontSize(14).font('Helvetica-Bold').fillColor('#2C3E50');
      answerDoc.text('Topic:', answerLabelX, 75);
      answerDoc.fontSize(12).font('Helvetica-Bold').fillColor('#FF6B35');
      answerDoc.text(finalTopic.toString(), answerValueX, 75);

      // Add Description field below header with proper spacing (same as worksheet)
      const answerDescriptionY = 95;
      answerDoc.fontSize(9).font('Helvetica').fillColor('#666666');
      
      // Generate enhanced description with AI summary (same as worksheet)
      let answerDescription = '';
      // Always use standard description (ignore user-provided summary)
      answerDescription = `This worksheet contains ${numOfQuestions} multiple-choice questions about ${finalTopic} for Grade ${grade} ${subject} students. Practice and test your understanding of key concepts.`;
      
      // Add AI-generated content summary (reuse the same aiSummary from worksheet)
      if (aiSummary) {
        answerDescription += ` ${aiSummary}`;
      }
      
      // Limit total description to 80 words for better formatting
      const answerWords = answerDescription.split(' ');
      if (answerWords.length > 80) {
        answerDescription = answerWords.slice(0, 80).join(' ') + '...';
      }
      
      // Add description text with proper word wrapping and spacing
      const answerDescriptionHeight = answerDoc.heightOfString(answerDescription, {
        width: 495,
        align: 'left',
        lineGap: 3
      });
      
      answerDoc.text(answerDescription, 50, answerDescriptionY, {
        width: 495, // Full width minus margins
        align: 'left',
        lineGap: 3
      });

      // Calculate Answer Key label position based on description height
      const answerKeyLabelY = answerDescriptionY + answerDescriptionHeight + 10;
      
      // Add "Answer Key" label with proper alignment and black color
      answerDoc.fontSize(16).font('Helvetica-Bold').fillColor('#000000')
        .text('ANSWER KEY', 50, answerKeyLabelY);

      // Calculate separator position
      const answerSeparatorY = answerKeyLabelY + 25;
      
      // Modern gradient-style separator line with shadow effect
      answerDoc.strokeColor('#FF6B35').lineWidth(4).moveTo(50, answerSeparatorY).lineTo(545, answerSeparatorY).stroke();
      answerDoc.strokeColor('#FFB366').lineWidth(1).moveTo(50, answerSeparatorY + 3).lineTo(545, answerSeparatorY + 3).stroke();

      // Reset text color and position for content with proper spacing
      answerDoc.fillColor('#000000');
      answerDoc.y = answerSeparatorY + 25; // Proper spacing after separator

      // Add questions with highlighted correct answers
      questions.forEach((q, index) => {
        if (answerDoc.y > answerDoc.page.height - 100) {
          answerDoc.addPage();
        }
        
        answerDoc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${q.question}`, 50, answerDoc.y);
        answerDoc.y += 20;
        
        answerDoc.fontSize(11).font('Helvetica');
        q.options.forEach((option, optionIndex) => {
          const isCorrect = q.answer === ['A', 'B', 'C', 'D'][optionIndex];
          
          if (isCorrect) {
            // Highlight correct answer
            answerDoc.font('Helvetica-Bold').fillColor('#228B22').text(`${option} ✓ CORRECT`, 50, answerDoc.y);
            answerDoc.fillColor('#000000'); // Reset color
          } else {
            answerDoc.font('Helvetica').text(option, 50, answerDoc.y);
          }
          answerDoc.y += 18;
        });
        
        answerDoc.y += 10; // Extra spacing between questions
      });

      answerDoc.end();

      await new Promise((resolve, reject) => {
        answerStream.on('finish', resolve);
        answerStream.on('error', reject);
      });

      answerKeyUrl = `/worksheets/${answerKeyFilename}`;
      console.log(`Answer key PDF created: ${answerKeyFilename}`);
    }

    // 7. Generate preview URLs (simplified approach)
    let worksheetPreviewUrl = null;
    let answerKeyPreviewUrl = null;
    
    try {
      // For now, we'll use a simple approach - return the PDF URLs as preview URLs
      // In a production environment, you would use a library like pdf-poppler or pdf2pic
      // to generate actual thumbnail images from the PDF first page
      worksheetPreviewUrl = `/worksheets/${path.basename(filePath)}`;
      
      if (answerKeyUrl) {
        answerKeyPreviewUrl = answerKeyUrl;
      }
    } catch (previewError) {
      console.warn('Preview generation failed:', previewError.message);
      // Continue without previews if generation fails
    }
    
    // 8. Send Response with URLs and preview URLs
    const responseData = { 
      success: true,
      downloadUrl: `/worksheets/${path.basename(filePath)}`,
      worksheetPreviewUrl: worksheetPreviewUrl,
      message: `Worksheet generated successfully with ${questions.length} questions${includeImages ? ' and images' : ''}${generateAnswerKey ? ' and answer key' : ''}.`
    };
    
    if (answerKeyUrl) {
      responseData.answerKeyUrl = answerKeyUrl;
      responseData.answerKeyPreviewUrl = answerKeyPreviewUrl;
    }
    
    console.log(`Worksheet generation completed successfully: ${path.basename(filePath)}`);
    console.log('About to send response:', JSON.stringify(responseData, null, 2));
    
    try {
      const response = res.status(httpStatus.OK).json(responseData);
      console.log('Response sent successfully');
      return response;
    } catch (responseError) {
      console.error('Error sending response:', responseError);
      throw responseError;
    }

  } catch (worksheetError) {
    console.error('Worksheet Generation Error:', worksheetError);
    
    // Determine the type of error and provide appropriate user-friendly message
    let errorMessage = 'Failed to generate worksheet due to an unexpected error.';
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    
    if (worksheetError.message) {
      // Check for specific error types and provide user-friendly messages
      if (worksheetError.message.includes('Text generation failed')) {
        errorMessage = `Question generation failed: ${worksheetError.message.replace('Text generation failed: ', '')}`;
        statusCode = httpStatus.SERVICE_UNAVAILABLE;
      } else if (worksheetError.message.includes('AI service')) {
        errorMessage = worksheetError.message;
        statusCode = httpStatus.SERVICE_UNAVAILABLE;
      } else if (worksheetError.message.includes('quota') || worksheetError.message.includes('rate limit')) {
        errorMessage = 'AI service quota exceeded. Please try again later or contact support.';
        statusCode = httpStatus.TOO_MANY_REQUESTS;
      } else if (worksheetError.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again with a simpler request or fewer questions.';
        statusCode = httpStatus.REQUEST_TIMEOUT;
      } else if (worksheetError.message.includes('authentication') || worksheetError.message.includes('API key')) {
        errorMessage = 'Service authentication failed. Please contact support.';
        statusCode = httpStatus.UNAUTHORIZED;
      } else if (worksheetError.message.includes('PDF') || worksheetError.message.includes('file')) {
        errorMessage = 'Failed to create worksheet PDF. Please try again.';
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      } else if (worksheetError.message.includes('network') || worksheetError.message.includes('ECONNRESET')) {
        errorMessage = 'Network error occurred. Please check your connection and try again.';
        statusCode = httpStatus.SERVICE_UNAVAILABLE;
      } else {
        // Use the original error message if it's already user-friendly
        errorMessage = worksheetError.message;
      }
    }
    
    // Log additional error details for debugging
    if (worksheetError.response) {
      console.error('Error Response Data:', worksheetError.response.data);
      console.error('Error Response Status:', worksheetError.response.status);
    }
    if (worksheetError.stack) {
      console.error('Error Stack:', worksheetError.stack);
    }
    
    // Clean up any partial files if they exist
    try {
      if (typeof filePath !== 'undefined' && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Cleaned up partial worksheet file');
      }
    } catch (cleanupError) {
      console.warn('Failed to clean up partial files:', cleanupError.message);
    }
    
    // Send user-friendly error response
    res.status(statusCode).json({ 
      success: false,
      error: errorMessage,
      details: `Worksheet generation failed for Grade ${grade} ${subject} on topic "${finalTopic || topic || 'Unknown'}". Please try again or contact support if the problem persists.`
    });
  }
});

module.exports = {
  generateWorksheet,
};
