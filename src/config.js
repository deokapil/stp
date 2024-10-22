import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  mongodb: {
    url: process.env.MONGODB_URL,
    database: process.env.MONGODB_DATABASE,
    collection: process.env.MONGODB_COLLECTION,
  },
  csvFilePath: process.env.CSV_FILE_PATH,
};

export default config;
