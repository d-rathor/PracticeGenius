const { execFile } = require('child_process');
const { writeFile, readFile, unlink } = require('fs/promises');
const path = require('path');
const os = require('os');

/**
 * Generates a PNG preview image for the first page of a given PDF buffer.
 * This implementation uses the ImageMagick 'convert' command-line tool,
 * which is the most robust and reliable method, avoiding all npm dependency issues.
 *
 * @param {Buffer} pdfBuffer The buffer containing the PDF file data.
 * @returns {Promise<Buffer|null>} A promise that resolves with the PNG image buffer, or null if an error occurs.
 */
async function generatePdfPreview(pdfBuffer) {
  console.log('Generating PDF preview with ImageMagick...');
  const tempId = `preview-${Date.now()}`;
  const tempPdfPath = path.join(os.tmpdir(), `${tempId}.pdf`);
  const tempPngPath = path.join(os.tmpdir(), `${tempId}.png`);

  try {
    // 1. Write the PDF buffer to a temporary file
    await writeFile(tempPdfPath, pdfBuffer);

    // 2. Run the ImageMagick 'convert' command
    //    The '[0]' selects the first page of the PDF.
    // For ImageMagick 7, the command is 'magick convert'.
    // This avoids conflicts with the Windows system 'convert.exe'.
    const args = [`${tempPdfPath}[0]`, tempPngPath];
    await new Promise((resolve, reject) => {
      const isWindows = process.platform === 'win32';
      const command = isWindows ? process.env.MAGICK_PATH : 'convert';
      const commandArgs = isWindows ? ['convert', ...args] : args;

      if (!command) {
        const errMsg = isWindows
          ? 'MAGICK_PATH environment variable not set for Windows. Cannot generate PDF previews.'
          : 'ImageMagick \'convert\' command not found. Ensure it is installed in the Docker container.';
        console.error(errMsg);
        return reject(new Error(errMsg));
      }

      execFile(command, commandArgs, (error, stdout, stderr) => {
        if (error) {
          console.error('ImageMagick Error:', stderr);
          console.error(`Failed to execute: ${command} ${commandArgs.join(' ')}`);
          return reject(error);
        }
        resolve(stdout);
      });
    });

    // 3. Read the generated PNG file into a buffer
    const imageBuffer = await readFile(tempPngPath);
    console.log('Successfully generated PDF preview with ImageMagick.');
    return imageBuffer;

  } catch (error) {
    console.error('An error occurred during ImageMagick PDF preview generation:', error);
    return null;

  } finally {
    // 4. Clean up temporary files
    try {
      await unlink(tempPdfPath);
      await unlink(tempPngPath);
    } catch (cleanupError) {
      // Log cleanup errors but don't throw, as the main goal was accomplished
      console.error('Error cleaning up temporary files:', cleanupError);
    }
  }
}

module.exports = {
  generatePdfPreview,
};
