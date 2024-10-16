const axios = require('axios');
const fs = require('node:fs');
const path = require('node:path');
const logger = require('../utils/logger');

const tempDir = path.join(__dirname, '../../tmp');

// Ensure the temporary directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

async function downloadFile(url) {
  try {
    const response = await axios({
      method: 'GET',
      url,
      responseType: 'stream',
    });

    const fileName = path.basename(url);
    const filePath = path.join(tempDir, fileName);

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        logger.info(`Downloaded file: ${fileName}`);
        resolve(filePath);
      });
      writer.on('error', reject);
    });
  } catch (error) {
    logger.error(`Error downloading file from ${url}: ${error}`);
    throw error;
  }
}

module.exports = {
  downloadFile,
};
