const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { promisify } = require('util');
const { execFile } = require('child_process');
const Replicate = require('replicate');

// Initialize Replicate client (for image generation)
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Define asset directories
const ICONS_DIR = path.join(__dirname, '../../public/images/icons');
const GENERATED_IMAGES_DIR = path.join(__dirname, '../../src/generated-images');

// Ensure directories exist
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

if (!fs.existsSync(GENERATED_IMAGES_DIR)) {
  fs.mkdirSync(GENERATED_IMAGES_DIR, { recursive: true });
}

/**
 * Get list of available icons
 * @returns {Promise<Array>} - Array of available icon names
 */
const getAvailableIcons = async () => {
  try {
    const files = await fs.promises.readdir(ICONS_DIR);
    return files
      .filter(file => file.endsWith('.svg'))
      .map(file => file.replace('.svg', ''));
  } catch (error) {
    console.error('Error getting available icons:', error);
    return [];
  }
};

/**
 * Check if an icon exists
 * @param {String} iconName - Name of the icon to check
 * @returns {Promise<Boolean>} - Whether the icon exists
 */
const iconExists = async (iconName) => {
  try {
    const icons = await getAvailableIcons();
    return icons.includes(iconName);
  } catch (error) {
    console.error('Error checking if icon exists:', error);
    return false;
  }
};

/**
 * Get path to an icon
 * @param {String} iconName - Name of the icon
 * @returns {Promise<String>} - Path to the icon
 */
const getIconPath = async (iconName) => {
  const exists = await iconExists(iconName);
  if (!exists) {
    throw new Error(`Icon "${iconName}" does not exist`);
  }
  return path.join(ICONS_DIR, `${iconName}.svg`);
};

/**
 * Generate an image using AI
 * @param {String} prompt - Prompt for image generation
 * @param {String} name - Name for the generated image
 * @returns {Promise<String>} - Path to the generated image
 */
const generateImage = async (prompt, name) => {
  try {
    // Check if image already exists in cache
    const cachedImagePath = path.join(GENERATED_IMAGES_DIR, `${name}.png`);
    if (fs.existsSync(cachedImagePath)) {
      console.log(`Using cached image: ${name}`);
      return cachedImagePath;
    }

    console.log(`Generating image for: ${name}`);

    // Enhanced image prompt with educational context from memory
    const enhancedPrompt = `
Create a simple educational image for children:

CONTENT: ${prompt}

STYLE REQUIREMENTS:
1) Bright, friendly, clear flat-style illustrations
2) Vibrant colors (yellows, greens, reds, pinks, greys)
3) Well-spaced, clearly recognizable objects
4) Clean organized composition
5) Educational objects (fruits, animals, geometric shapes, everyday items)
6) White/light backgrounds for printing
7) Support for counting and number recognition
8) High contrast for clarity
9) No complex shadows/gradients
10) Age-appropriate and curriculum-aligned content

CRITICAL REQUIREMENTS:
- VERY simple, basic illustration - not detailed or complex
- Show only 1-2 objects maximum (not congested)
- Single object centered on white background is preferred
- Objects must be directly related to the prompt
- NO text, letters, numbers, or words anywhere
- Large, bold shapes that are easy to see
`;

    // Generate image using Replicate API
    const output = await replicate.run(
      "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
      {
        input: {
          prompt: enhancedPrompt,
          width: 768,
          height: 768,
        }
      }
    );

    if (!output || !output[0]) {
      throw new Error('Image generation failed: No output from Replicate API');
    }

    const imageUrl = output[0];

    // Download image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    await fs.promises.writeFile(cachedImagePath, response.data);

    return cachedImagePath;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

/**
 * Convert SVG to PNG
 * @param {String} svgPath - Path to SVG file
 * @param {String} pngPath - Path to output PNG file
 * @returns {Promise<String>} - Path to the PNG file
 */
const convertSvgToPng = async (svgPath, pngPath) => {
  try {
    // Use ImageMagick to convert SVG to PNG
    const magickPath = process.env.IMAGEMAGICK_PATH || 'magick';
    
    await promisify(execFile)(magickPath, [
      'convert',
      svgPath,
      pngPath
    ]);
    
    return pngPath;
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
    throw error;
  }
};

module.exports = {
  getAvailableIcons,
  iconExists,
  getIconPath,
  generateImage,
  convertSvgToPng
};
