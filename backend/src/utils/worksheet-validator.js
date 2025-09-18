const { worksheetDslSchema } = require('../schemas/worksheet.schema');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Validates worksheet DSL JSON against schema
 * @param {Object} worksheetJson - The worksheet JSON to validate
 * @returns {Object} - Result with validation status and errors if any
 */
const validateWorksheetDsl = (worksheetJson) => {
  const { error, value } = worksheetDslSchema.validate(worksheetJson, { 
    abortEarly: false,
    allowUnknown: false
  });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => ({
        path: detail.path.join('.'),
        message: detail.message
      })),
      value: null
    };
  }
  
  return {
    isValid: true,
    errors: [],
    value
  };
};

/**
 * Applies safe defaults to worksheet JSON
 * @param {Object} worksheetJson - The worksheet JSON to sanitize
 * @returns {Object} - Sanitized worksheet JSON
 */
const applySafeDefaults = (worksheetJson) => {
  const sanitized = { ...worksheetJson };
  
  // Ensure branding exists with defaults
  sanitized.branding = sanitized.branding || {
    logo: 'PracticeGenius',
    theme: 'orange-white-black'
  };
  
  // Ensure answer_key has a default value
  sanitized.answer_key = sanitized.answer_key !== undefined ? sanitized.answer_key : true;
  
  // Ensure layout has required properties
  if (sanitized.layout) {
    sanitized.layout.show_answer_boxes = 
      sanitized.layout.show_answer_boxes !== undefined ? sanitized.layout.show_answer_boxes : true;
    
    sanitized.layout.box_size = sanitized.layout.box_size || 'medium';
    sanitized.layout.spacing = sanitized.layout.spacing || 'normal';
  }
  
  // Sanitize items
  if (sanitized.items && Array.isArray(sanitized.items)) {
    sanitized.items = sanitized.items.map(item => {
      // Ensure assets is an array if it exists
      if (item.assets && !Array.isArray(item.assets)) {
        item.assets = [];
      }
      
      // Sanitize assets
      if (item.assets && Array.isArray(item.assets)) {
        item.assets = item.assets.map(asset => {
          // Clamp count to 1-10
          if (asset.count !== undefined) {
            asset.count = Math.max(1, Math.min(20, asset.count));
          }
          
          return asset;
        });
      }
      
      return item;
    });
  }
  
  return sanitized;
};

/**
 * Auto-repairs invalid worksheet JSON using AI
 * @param {Object} worksheetJson - The invalid worksheet JSON
 * @param {Array} errors - Validation errors
 * @returns {Promise<Object>} - Repaired worksheet JSON
 */
const autoRepairWorksheetDsl = async (worksheetJson, errors) => {
  try {
    const errorMessages = errors.map(err => `${err.path}: ${err.message}`).join('\n');
    
    const prompt = `
You are a JSON repair specialist. Fix the following invalid JSON according to the schema requirements.
Do not add any explanations or text outside the JSON.

SCHEMA ERRORS:
${errorMessages}

INVALID JSON:
${JSON.stringify(worksheetJson, null, 2)}

FIXED JSON:
`;

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
    const repairedJson = JSON.parse(cleanedText);
    
    // Apply safe defaults to the repaired JSON
    return applySafeDefaults(repairedJson);
    
  } catch (error) {
    console.error('Error in auto-repair:', error);
    // If auto-repair fails, return the original with safe defaults applied
    return applySafeDefaults(worksheetJson);
  }
};

module.exports = {
  validateWorksheetDsl,
  applySafeDefaults,
  autoRepairWorksheetDsl
};
