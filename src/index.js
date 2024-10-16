const fs = require('node:fs');
const { parse } = require('csv-parser');
const logger = require('./utils/logger');
const downloadService = require('./services/download');
const mongodbService = require('./services/mongodb');

async function processCSV(filePath) {
  const results = [];
  fs.createReadStream(filePath)
    .pipe(parse())
    .on('data', async (row) => {
      try {
        // 1. Download the MP3 file (replace with your column index)
        const downloadUrl = row[6]; // Assuming MP3 URL is in the 7th column (index 6)
        const filePath = await downloadService.downloadFile(downloadUrl);

        // 2. Generate fingerprint (Implementation needed in fingerprint.js)
        const fingerprint = await fingerprintService.generateFingerprint(filePath);

        // 3. Get Acoustid ID (Implementation needed in acoustid.js)
        const acoustidData = await acoustidService.getAcoustId(fingerprint);
        const acoustidId = acoustidData.results[0].id;

        // 4. Get MusicBrainz details (Implementation needed in musicbrainz.js)
        const musicbrainzData = await musicbrainzService.getMusicBrainzData(acoustidId);

        // 5. Save to MongoDB
        await mongodbService.saveData({ ...musicbrainzData, rowId: row[0] }); // Assuming row ID is in the first column

        logger.info(`Processed row ${row[0]}`);
      } catch (error) {
        logger.error(`Error processing row ${row[0]}: ${error}`);
      }
    })
    .on('end', () => {
      logger.info(`CSV file "${filePath}" processed`);
    });
}

// Replace with your CSV file path
const csvFilePath = 'path/to/your/file.csv';

processCSV(csvFilePath);
