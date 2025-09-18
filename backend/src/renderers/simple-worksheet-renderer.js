const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const seedrandom = require('seedrandom');

// Utility to generate a random seed if not provided
const generateSeed = () => Math.floor(Math.random() * 1000000);

/**
 * Renders a worksheet as HTML based on the provided DSL
 * @param {Object} worksheetDsl - The worksheet DSL object
 * @returns {String} - HTML string representation of the worksheet
 */
const renderWorksheetToHtml = (worksheetDsl) => {
  // Use seed for reproducibility if provided, otherwise generate one
  const seed = worksheetDsl.meta.seed || generateSeed();
  const rng = seedrandom(seed.toString());
  
  // Store the seed in the DSL for future reference
  worksheetDsl.meta.seed = seed;
  
  // Define theme colors based on the branding theme
  const themeColors = {
    'orange-white-black': {
      primary: '#FF6B35',
      secondary: '#FFB366',
      text: '#2C3E50',
      background: '#FFFFFF',
      accent: '#F8F9FA'
    },
    'blue-white-gray': {
      primary: '#3498DB',
      secondary: '#85C1E9',
      text: '#2C3E50',
      background: '#FFFFFF',
      accent: '#F8F9FA'
    },
    'green-white-black': {
      primary: '#2ECC71',
      secondary: '#82E0AA',
      text: '#2C3E50',
      background: '#FFFFFF',
      accent: '#F8F9FA'
    },
    'purple-white-gray': {
      primary: '#9B59B6',
      secondary: '#D2B4DE',
      text: '#2C3E50',
      background: '#FFFFFF',
      accent: '#F8F9FA'
    }
  };
  
  // Get theme colors
  const theme = themeColors[worksheetDsl.branding.theme] || themeColors['orange-white-black'];
  
  // Define box sizes
  const boxSizes = {
    small: '30px',
    medium: '40px',
    large: '50px'
  };
  
  // Define spacing
  const spacings = {
    tight: '0.8rem',
    normal: '1.2rem',
    spacious: '1.8rem'
  };
  
  // Get box size and spacing
  const boxSize = boxSizes[worksheetDsl.layout.box_size || 'medium'];
  const spacing = spacings[worksheetDsl.layout.spacing || 'normal'];
  
  // Generate CSS for the worksheet
  const css = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      color: ${theme.text};
      background-color: ${theme.background};
      line-height: 1.4;
      font-size: 14px;
      padding: 0;
      margin: 0;
    }
    
    .worksheet {
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      border-bottom: 4px solid ${theme.primary};
      padding-bottom: 0.5rem;
    }
    
    .header-left {
      flex: 1;
    }
    
    .header-right {
      text-align: right;
      flex: 1;
    }
    
    .logo {
      max-width: 180px;
      max-height: 60px;
    }
    
    .meta {
      margin-bottom: 0.5rem;
    }
    
    .meta-label {
      font-weight: bold;
      color: ${theme.text};
      font-size: 14px;
    }
    
    .meta-value {
      color: ${theme.primary};
      font-weight: bold;
      font-size: 12px;
    }
    
    .title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: ${theme.primary};
    }
    
    .instructions {
      font-size: 14px;
      margin-bottom: 1.5rem;
      padding: 0.75rem;
      background-color: ${theme.accent};
      border-left: 4px solid ${theme.primary};
    }
    
    .grid-layout {
      display: grid;
      grid-template-columns: repeat(${worksheetDsl.layout.cols || 1}, 1fr);
      grid-gap: ${spacing};
    }
    
    .list-layout {
      display: flex;
      flex-direction: column;
      gap: ${spacing};
    }
    
    .columns-layout {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: ${spacing};
    }
    
    .columns-layout .item {
      flex: 1 0 45%;
    }
    
    .item {
      margin-bottom: ${spacing};
      page-break-inside: avoid;
    }
    
    .item-prompt {
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .answer-box {
      border: 2px solid ${theme.text};
      width: ${boxSize};
      height: ${boxSize};
      display: inline-block;
      vertical-align: middle;
      margin-left: 0.5rem;
    }
    
    .assets-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 0.5rem 0;
      justify-content: flex-start;
      align-items: center;
    }
    
    .asset {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    .asset-row {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .asset-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-gap: 0.5rem;
    }
    
    .asset-scattered {
      position: relative;
      min-height: 100px;
    }
    
    .asset-scattered .asset {
      position: absolute;
    }
    
    .footer {
      margin-top: 2rem;
      text-align: center;
      font-size: 10px;
      color: ${theme.text};
      border-top: 1px solid ${theme.secondary};
      padding-top: 0.5rem;
    }
    
    .page-break {
      page-break-after: always;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      
      .worksheet {
        padding: 0.5in;
      }
    }
  `;
  
  // Render items HTML
  const renderItems = (items, showAnswerBoxes, isAnswerKey) => {
    return items.map((item, index) => {
      // Render assets if they exist
      const assetsHtml = item.assets && item.assets.length > 0 
        ? renderAssets(item.assets)
        : '';
      
      // Render answer box if needed
      const answerBoxHtml = showAnswerBoxes 
        ? `<div class="answer-box">${isAnswerKey ? item.target_answer : ''}</div>`
        : '';
      
      return `
        <div class="item">
          <div class="item-prompt">${index + 1}. ${item.prompt}</div>
          ${assetsHtml}
          ${answerBoxHtml}
        </div>
      `;
    }).join('');
  };
  
  // Render assets HTML
  const renderAssets = (assets) => {
    // Group assets by arrangement
    const assetsByArrangement = {};
    assets.forEach(asset => {
      const arrangement = asset.arrangement || 'row';
      if (!assetsByArrangement[arrangement]) {
        assetsByArrangement[arrangement] = [];
      }
      assetsByArrangement[arrangement].push(asset);
    });
    
    // Render each arrangement group
    let assetsHtml = '';
    for (const [arrangement, assetsGroup] of Object.entries(assetsByArrangement)) {
      let groupHtml = '';
      assetsGroup.forEach(asset => {
        // Repeat asset based on count
        const count = asset.count || 1;
        for (let i = 0; i < count; i++) {
          groupHtml += renderAsset(asset);
        }
      });
      
      assetsHtml += `<div class="assets-container asset-${arrangement}">${groupHtml}</div>`;
    }
    
    return assetsHtml;
  };
  
  // Render a single asset
  const renderAsset = (asset) => {
    const size = asset.size || 'medium';
    const sizeMap = {
      small: '20px',
      medium: '30px',
      large: '40px'
    };
    
    switch (asset.type) {
      case 'icon':
        // Use data URI for SVG icons to ensure they're embedded in the HTML
        try {
          const svgPath = path.join(__dirname, `../../public/images/icons/${asset.name}.svg`);
          const svgContent = fs.readFileSync(svgPath, 'utf8');
          const svgBase64 = Buffer.from(svgContent).toString('base64');
          const dataUri = `data:image/svg+xml;base64,${svgBase64}`;
          
          return `<div class="asset" style="width: ${sizeMap[size]}; height: ${sizeMap[size]};">
            <img src="${dataUri}" 
                 alt="${asset.name}" 
                 style="width: 100%; height: 100%;">
          </div>`;
        } catch (error) {
          console.error(`Error loading SVG icon ${asset.name}:`, error);
          return `<div class="asset" style="width: ${sizeMap[size]}; height: ${sizeMap[size]}; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center;">
            ${asset.name}
          </div>`;
        }
      
      case 'shape':
        return `<div class="asset" style="width: ${sizeMap[size]}; height: ${sizeMap[size]};">
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            ${renderShape(asset.name, asset.color || '#000000')}
          </svg>
        </div>`;
      
      case 'number':
        return `<div class="asset" style="width: ${sizeMap[size]}; height: ${sizeMap[size]}; 
                                       font-weight: bold; font-size: ${parseInt(sizeMap[size]) * 0.6}px;">
          ${asset.name}
        </div>`;
      
      case 'text':
        return `<div class="asset" style="font-size: ${parseInt(sizeMap[size]) * 0.5}px;">
          ${asset.name}
        </div>`;
      
      default:
        return `<div class="asset">${asset.name}</div>`;
    }
  };
  
  // Render an SVG shape
  const renderShape = (shapeName, color) => {
    const shapes = {
      circle: '<circle cx="50" cy="50" r="40" fill="' + color + '" />',
      square: '<rect x="10" y="10" width="80" height="80" fill="' + color + '" />',
      triangle: '<polygon points="50,10 90,90 10,90" fill="' + color + '" />',
      star: '<polygon points="50,10 61,35 90,35 65,55 75,80 50,65 25,80 35,55 10,35 39,35" fill="' + color + '" />',
      heart: '<path d="M50,30 C35,10 10,20 10,40 C10,60 25,65 50,90 C75,65 90,60 90,40 C90,20 65,10 50,30 Z" fill="' + color + '" />',
      diamond: '<polygon points="50,10 90,50 50,90 10,50" fill="' + color + '" />',
      hexagon: '<polygon points="25,10 75,10 90,50 75,90 25,90 10,50" fill="' + color + '" />',
      octagon: '<polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" fill="' + color + '" />',
      oval: '<ellipse cx="50" cy="50" rx="40" ry="30" fill="' + color + '" />',
      rectangle: '<rect x="10" y="25" width="80" height="50" fill="' + color + '" />'
    };
    
    return shapes[shapeName] || shapes.circle;
  };
  
  // Generate HTML for the worksheet
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${worksheetDsl.meta.title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
      <style>${css}</style>
    </head>
    <body>
      <div class="worksheet">
        <div class="header">
          <div class="header-left">
            <div class="meta">
              <span class="meta-label">Grade:</span>
              <span class="meta-value">${worksheetDsl.meta.grade}</span>
            </div>
            <div class="meta">
              <span class="meta-label">Subject:</span>
              <span class="meta-value">${worksheetDsl.meta.subject}</span>
            </div>
            <div class="title">${worksheetDsl.meta.title}</div>
          </div>
          <div class="header-right">
            <div class="logo" style="font-weight: bold; font-size: 18px; color: ${theme.primary};">PracticeGenius</div>
          </div>
        </div>
        
        <div class="instructions">
          ${worksheetDsl.instructions}
        </div>
        
        <div class="${worksheetDsl.layout.type}-layout">
          ${renderItems(worksheetDsl.items, worksheetDsl.layout.show_answer_boxes, false)}
        </div>
        
        <div class="footer">
          © PracticeGenius ${new Date().getFullYear()} | ${worksheetDsl.branding.footer || ''}
        </div>
      </div>
      
      ${worksheetDsl.answer_key ? `
        <div class="page-break"></div>
        <div class="worksheet">
          <div class="header">
            <div class="header-left">
              <div class="meta">
                <span class="meta-label">Grade:</span>
                <span class="meta-value">${worksheetDsl.meta.grade}</span>
              </div>
              <div class="meta">
                <span class="meta-label">Subject:</span>
                <span class="meta-value">${worksheetDsl.meta.subject}</span>
              </div>
              <div class="title">${worksheetDsl.meta.title} - ANSWER KEY</div>
            </div>
            <div class="header-right">
              <div class="logo" style="font-weight: bold; font-size: 18px; color: ${theme.primary};">PracticeGenius</div>
            </div>
          </div>
          
          <div class="instructions">
            Answer key for: ${worksheetDsl.instructions}
          </div>
          
          <div class="${worksheetDsl.layout.type}-layout">
            ${renderItems(worksheetDsl.items, worksheetDsl.layout.show_answer_boxes, true)}
          </div>
          
          <div class="footer">
            © PracticeGenius ${new Date().getFullYear()} | ANSWER KEY | ${worksheetDsl.branding.footer || ''}
          </div>
        </div>
      ` : ''}
    </body>
    </html>
  `;
  
  return html;
};

/**
 * Converts HTML to PDF using Puppeteer
 * @param {String} html - HTML string to convert
 * @param {String} outputPath - Path to save the PDF
 * @returns {Promise<String>} - Path to the generated PDF
 */
const convertHtmlToPdf = async (html, outputPath) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: outputPath,
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.1in',
        right: '0.1in',
        bottom: '0.1in',
        left: '0.1in'
      }
    });
    
    return outputPath;
  } finally {
    await browser.close();
  }
};

/**
 * Generates a preview image of the first page of a PDF
 * @param {String} pdfPath - Path to the PDF file
 * @param {String} outputPath - Path to save the preview image
 * @returns {Promise<String>} - Path to the generated preview image
 */
const generatePdfPreview = async (pdfPath, outputPath) => {
  try {
    // Use ImageMagick to convert the first page of the PDF to PNG
    // Based on the memory about using ImageMagick directly
    const magickPath = process.env.IMAGEMAGICK_PATH || 'magick';
    
    await promisify(execFile)(magickPath, [
      'convert',
      `${pdfPath}[0]`,
      outputPath
    ]);
    
    return outputPath;
  } catch (error) {
    console.error('Error generating PDF preview:', error);
    throw error;
  }
};

/**
 * Renders a worksheet to PDF based on the provided DSL
 * @param {Object} worksheetDsl - The worksheet DSL object
 * @param {String} outputDir - Directory to save the PDF
 * @returns {Promise<Object>} - Paths to the generated files
 */
const renderWorksheetToPdf = async (worksheetDsl, outputDir) => {
  try {
    // Generate HTML from the DSL
    const html = renderWorksheetToHtml(worksheetDsl);
    
    // Create timestamp for filenames
    const timestamp = Date.now();
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Define output paths
    const pdfPath = path.join(outputDir, `worksheet-${timestamp}.pdf`);
    const previewPath = path.join(outputDir, `worksheet-preview-${timestamp}.png`);
    
    // Convert HTML to PDF
    await convertHtmlToPdf(html, pdfPath);
    
    // Generate preview image
    await generatePdfPreview(pdfPath, previewPath);
    
    // Return paths
    return {
      pdfPath,
      previewPath,
      timestamp
    };
  } catch (error) {
    console.error('Error rendering worksheet to PDF:', error);
    throw error;
  }
};

module.exports = {
  renderWorksheetToHtml,
  renderWorksheetToPdf,
  generatePdfPreview
};
