const Joi = require('joi');
const { default: httpStatus } = require('http-status');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const catchAsync = require('../utils/catchAsync');
const { getWorksheetDslPrompt } = require('../prompts/worksheet-dsl.prompt');
const { validateWorksheetDsl, applySafeDefaults, autoRepairWorksheetDsl } = require('../utils/worksheet-validator');
const { renderWorksheetToPdf } = require('../renderers/simple-worksheet-renderer');
const { getAvailableIcons, generateImage } = require('../utils/asset-manager');
const seedrandom = require('seedrandom');

// Initialize Google Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Input validation schema
const worksheetGeneratorInputSchema = Joi.object({
  grade: Joi.string().required(),
  subject: Joi.string().required(),
  topic: Joi.string().required(),
  customTopic: Joi.string().allow('').optional(),
  summary: Joi.string().allow('').optional(),
  numOfQuestions: Joi.number().integer().min(1).max(20).required(),
  includeImages: Joi.boolean().required(),
  generateAnswerKey: Joi.boolean().required(),
  layoutType: Joi.string().valid('grid', 'list', 'columns', 'free').default('grid'),
  rows: Joi.number().integer().min(1).max(10).default(2),
  cols: Joi.number().integer().min(1).max(10).default(5),
  theme: Joi.string().valid('orange-white-black', 'blue-white-gray', 'green-white-black', 'purple-white-gray').default('orange-white-black'),
  seed: Joi.number().integer().optional(),
  randomizeItems: Joi.boolean().default(true)
});

/**
 * Generate worksheet using DSL approach
 */
const generateWorksheetDsl = catchAsync(async (req, res) => {
  // Validate input
  const { error, value } = worksheetGeneratorInputSchema.validate(req.body);
  if (error) {
    console.error('Joi validation error:', error.details[0].message);
    return res.status(httpStatus.BAD_REQUEST).json({ 
      error: `Invalid input: ${error.details[0].message}`,
      success: false 
    });
  }

  const { 
    grade, subject, topic, customTopic, summary, numOfQuestions, 
    includeImages, generateAnswerKey, layoutType, rows, cols, theme, seed, randomizeItems 
  } = value;
  
  // Use custom topic if provided
  const finalTopic = topic === 'Create your own topic' ? customTopic : topic;
  
  if (!finalTopic || finalTopic.trim() === '') {
    return res.status(httpStatus.BAD_REQUEST).json({ 
      error: 'Topic is required. Please select a topic or provide a custom topic.',
      success: false 
    });
  }

  console.log(`Starting DSL worksheet generation: Grade ${grade}, Subject ${subject}, Topic ${finalTopic}, Questions ${numOfQuestions}`);

  try {
    // 1. Generate worksheet DSL using LLM
    console.log('Generating worksheet DSL using LLM...');
    
    const promptParams = {
      grade,
      subject,
      topic: finalTopic,
      description: summary || '',
      itemCount: numOfQuestions,
      layoutType,
      rows,
      cols,
      includeAnswerKey: generateAnswerKey,
      theme
    };
    
    const prompt = getWorksheetDslPrompt(promptParams);
    
    // Call LLM to generate DSL
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text || text.trim() === '') {
      throw new Error('AI service returned empty response');
    }
    
    // Clean the response text
    let cleanedText = text.trim();
    
    // Remove markdown backticks if present
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Parse JSON
    let worksheetDsl;
    try {
      worksheetDsl = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Error parsing JSON from LLM:', parseError);
      throw new Error('Failed to parse worksheet structure from AI response');
    }
    
    // 2. Validate and repair DSL if needed
    console.log('Validating worksheet DSL...');
    let validationResult = validateWorksheetDsl(worksheetDsl);
    
    if (!validationResult.isValid) {
      console.log('Worksheet DSL validation failed, attempting auto-repair...');
      worksheetDsl = await autoRepairWorksheetDsl(worksheetDsl, validationResult.errors);
      
      // Validate again after repair
      validationResult = validateWorksheetDsl(worksheetDsl);
      if (!validationResult.isValid) {
        throw new Error('Failed to generate valid worksheet structure after repair attempts');
      }
    }
    
    // Apply safe defaults
    worksheetDsl = applySafeDefaults(worksheetDsl);
    
    // Add seed for reproducibility if provided or generate one
    const worksheetSeed = seed || Math.floor(Math.random() * 1000000);
    worksheetDsl.meta.seed = worksheetSeed;
    
    // Randomize the order of items using the seed if randomization is enabled
    if (randomizeItems && worksheetDsl.items && worksheetDsl.items.length > 0) {
      console.log('Randomizing worksheet items using seed:', worksheetSeed);
      const rng = seedrandom(worksheetSeed.toString());
      
      // Shuffle the items array
      for (let i = worksheetDsl.items.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [worksheetDsl.items[i], worksheetDsl.items[j]] = [worksheetDsl.items[j], worksheetDsl.items[i]];
      }
    }
    
    // Update the item numbers (if they have numbers in their prompts)
    if (worksheetDsl.items && worksheetDsl.items.length > 0) {
      worksheetDsl.items.forEach((item, index) => {
        if (item.prompt && item.prompt.match(/^\d+\./)) {
          item.prompt = `${index + 1}.${item.prompt.substring(item.prompt.indexOf('.') + 1)}`;
        }
      });
    }
    
    // 3. Process assets if images are requested
    if (includeImages) {
      console.log('Processing assets for worksheet...');
      
      // Get available icons
      const availableIcons = await getAvailableIcons();
      
      // Process each item with assets
      for (const item of worksheetDsl.items) {
        if (item.assets && Array.isArray(item.assets)) {
          for (const asset of item.assets) {
            // For icon type assets, ensure they exist or generate them
            if (asset.type === 'icon' && !availableIcons.includes(asset.name)) {
              // Generate image for missing icon
              console.log(`Generating image for missing icon: ${asset.name}`);
              await generateImage(asset.name, asset.name);
            }
          }
        }
      }
    }
    
    // 4. Render worksheet to PDF
    console.log('Rendering worksheet to PDF...');
    const outputDir = path.join(__dirname, '../../public/worksheets');
    const renderResult = await renderWorksheetToPdf(worksheetDsl, outputDir);
    
    // 5. Prepare response
    const responseData = {
      success: true,
      downloadUrl: `/worksheets/${path.basename(renderResult.pdfPath)}`,
      worksheetPreviewUrl: `/worksheets/${path.basename(renderResult.previewPath)}`,
      message: `Worksheet generated successfully with ${worksheetDsl.items.length} items${includeImages ? ' and assets' : ''}${generateAnswerKey ? ' and answer key' : ''}.`
    };
    
    console.log('Worksheet generation completed successfully');
    return res.status(httpStatus.OK).json(responseData);
    
  } catch (error) {
    console.error('Worksheet Generation Error:', error);
    
    // Determine the type of error and provide appropriate user-friendly message
    let errorMessage = 'Failed to generate worksheet due to an unexpected error.';
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    
    if (error.message) {
      if (error.message.includes('AI service')) {
        errorMessage = error.message;
        statusCode = httpStatus.SERVICE_UNAVAILABLE;
      } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
        errorMessage = 'AI service quota exceeded. Please try again later or contact support.';
        statusCode = httpStatus.TOO_MANY_REQUESTS;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again with a simpler request or fewer questions.';
        statusCode = httpStatus.REQUEST_TIMEOUT;
      } else if (error.message.includes('authentication') || error.message.includes('API key')) {
        errorMessage = 'Service authentication failed. Please contact support.';
        statusCode = httpStatus.UNAUTHORIZED;
      } else if (error.message.includes('PDF') || error.message.includes('file')) {
        errorMessage = 'Failed to create worksheet PDF. Please try again.';
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      } else if (error.message.includes('network') || error.message.includes('ECONNRESET')) {
        errorMessage = 'Network error occurred. Please check your connection and try again.';
        statusCode = httpStatus.SERVICE_UNAVAILABLE;
      } else {
        // Use the original error message if it's already user-friendly
        errorMessage = error.message;
      }
    }
    
    // Send user-friendly error response
    return res.status(statusCode).json({ 
      success: false,
      error: errorMessage,
      details: `Worksheet generation failed for Grade ${grade} ${subject} on topic "${finalTopic}". Please try again or contact support if the problem persists.`
    });
  }
});

module.exports = {
  generateWorksheetDsl
};
