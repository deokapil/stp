const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

async function saveData(data) {
  try {
    const database = client.db('music-metadata'); // Replace with your database name
    const collection = database.collection('tracks'); // Replace with your collection name
    const result = await collection.insertOne(data);
    console.log(`Inserted document with ID: ${result.insertedId}`);
  } catch (error) {
    console.error('Error saving data to MongoDB:', error);
  }
}

module.exports = {
  connectToDatabase,
  saveData,
};
