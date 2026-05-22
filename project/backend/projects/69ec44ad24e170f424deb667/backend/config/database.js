const { MongoClient } = require('mongodb');
const schema = require('./database/mongoDB/schema');

const mongoDBConnectionString = 'mongodb://localhost:27017';
const dbName = 'mydatabase';

const client = new MongoClient(mongoDBConnectionString);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    return db;
  } catch (err) {
    console.error(err);
  }
}

async function getMongoDBCollection(collectionName) {
  const db = await connectToMongoDB();
  return db.collection(collectionName);
}

module.exports = {
  getMongoDBCollection,
  schema,
};