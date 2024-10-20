import fs from 'node:fs';
import { parse } from 'csv-parser';
import logger from './utils/logger.js';
import downloadService from './services/download.js';
import mongodbService from './services/mongodb.js';

async function processCSV(filePath) {
  const results = [];
  fs.createReadStream(filePath)
    .pipe(parse())
    .on('data', async (row) => {
      try {
        // 1. Check if data already exists in MongoDB
        const existingData = await mongodbService.findDataByRowId(row[0]); // Assuming row ID is in the first column

        if (existingData) {
          logger.info(`Data for row ${row[0]} already exists in MongoDB. Skipping.`);
          return;
        }

        // 2. Download the MP3 file (replace with your column index)
        const downloadUrl = row[6]; // Assuming MP3 URL is in the 7th column (index 6)
        const filePath = await downloadService.downloadFile(downloadUrl);

        // 2. Generate fingerprint (Implementation needed in fingerprint.js)
        const fingerprint = await fingerprintService.generateFingerprint(filePath);

        // 3. Get Acoustid ID (Implementation needed in acoustid.js)
        const acoustidData = await acoustidService.getAcoustId(fingerprint);
        const acoustidId = acoustidData.results[0].id;

        // 4. Get MusicBrainz details (Implementation needed in musicbrainz.js)
        const musicbrainzData = await musicbrainzService.getMusicBrainzData(acoustidId);

        // 6. Save to MongoDB
        await mongodbService.saveData({ ...musicbrainzData, rowId: row[0] }); // Assuming row ID is in the first column

        logger.info(`Processed row ${row[0]}`);

        // 7. Delete the downloaded file
        fs.unlink(filePath, (err) => {
          if (err) {
            logger.error(`Error deleting file ${filePath}: ${err}`);
          } else {
            logger.info(`Deleted file: ${filePath}`);
          }
        });
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
