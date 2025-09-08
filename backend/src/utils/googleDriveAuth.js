const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');
const { APIError } = require('../middleware/error');

// Path to store token and credentials
const TOKEN_PATH = path.join(__dirname, '../../credentials/token.json');
const CREDENTIALS_PATH = path.join(__dirname, '../../credentials/credentials.json');

/**
 * Create an OAuth2 client with the given credentials
 * @param {Object} credentials The authorization client credentials
 * @return {google.auth.OAuth2} The OAuth2 client
 */
function createOAuth2Client(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

/**
 * Get and store new token after prompting for user authorization
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for
 * @return {Promise<google.auth.OAuth2>} The authorized OAuth2 client
 */
async function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  
  console.log('Authorize this app by visiting this url:', authUrl);
  throw new APIError(
    `Google Drive authorization required. Please visit the following URL and provide the generated code: ${authUrl}`,
    401
  );
}

/**
 * Load or request authorization to call Google Drive API
 * @return {Promise<google.auth.OAuth2>} The authorized OAuth2 client
 */
async function authorize() {
  try {
    // Check if credentials file exists
    const content = await fs.readFile(CREDENTIALS_PATH);
    const credentials = JSON.parse(content);
    const oAuth2Client = createOAuth2Client(credentials);
    
    try {
      // Check if we have previously stored a token
      const token = await fs.readFile(TOKEN_PATH);
      oAuth2Client.setCredentials(JSON.parse(token));
      return oAuth2Client;
    } catch (err) {
      return getAccessToken(oAuth2Client);
    }
  } catch (err) {
    throw new APIError(
      'Error loading Google Drive client credentials. Please ensure credentials.json is in the credentials directory.',
      500
    );
  }
}

/**
 * Initialize the Google Drive API client
 * @return {Promise<google.drive.Drive>} The authorized Drive client
 */
async function initDriveClient() {
  const auth = await authorize();
  return google.drive({ version: 'v3', auth });
}

/**
 * Save token to disk for later program executions
 * @param {Object} token The token to save
 */
async function saveToken(token) {
  try {
    // Ensure credentials directory exists
    await fs.mkdir(path.dirname(TOKEN_PATH), { recursive: true });
    await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to', TOKEN_PATH);
  } catch (err) {
    console.error('Error storing token:', err);
    throw new APIError('Failed to save authentication token.', 500);
  }
}

/**
 * Store the token received from the authorization code
 * @param {string} code The authorization code
 * @return {Promise<google.auth.OAuth2>} The authorized OAuth2 client
 */
async function storeToken(code) {
  try {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const credentials = JSON.parse(content);
    const oAuth2Client = createOAuth2Client(credentials);
    
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    await saveToken(tokens);
    return oAuth2Client;
  } catch (err) {
    console.error('Error retrieving access token:', err);
    throw new APIError('Failed to retrieve access token. Please try again.', 500);
  }
}

module.exports = {
  initDriveClient,
  storeToken
};
