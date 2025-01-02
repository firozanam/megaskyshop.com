const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

if (!process.env.MONGODB_URI) {
  throw new Error('MongoDB URI is not set in environment variables');
}

const uri = process.env.MONGODB_URI;
const dbName = 'megaskyshop';

const options = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 75000,
  connectTimeoutMS: 30000,
  maxPoolSize: 50,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  family: 4,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  useNewUrlParser: true,
  useUnifiedTopology: true
};

let client = null;
let clientPromise = null;
let isConnecting = false;
let lastConnectionAttempt = 0;
const CONNECTION_TIMEOUT = 5000; // 5 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function connect(retryCount = 0) {
  try {
    // If we already have a client and it's connected, return it
    if (client?.topology?.isConnected()) {
      return client;
    }
    
    // If another connection attempt is in progress, wait
    if (isConnecting) {
      const now = Date.now();
      if (now - lastConnectionAttempt < CONNECTION_TIMEOUT) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return connect(retryCount);
      }
      // If connection attempt is taking too long, reset state
      isConnecting = false;
    }

    isConnecting = true;
    lastConnectionAttempt = Date.now();

    // Clean up old client if it exists
    if (client) {
      try {
        await client.close(true);
      } catch (e) {
        console.error('Error closing old MongoDB connection:', e);
      }
      client = null;
    }

    // Create new client
    client = new MongoClient(uri, options);
    await client.connect();
    
    // Verify connection
    const db = client.db(dbName);
    await db.command({ ping: 1 });
    
    console.log('Successfully connected to MongoDB');
    isConnecting = false;
    return client;
  } catch (error) {
    isConnecting = false;
    console.error(`MongoDB connection error (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error);
    
    // Clean up failed client
    if (client) {
      try {
        await client.close(true);
      } catch (e) {
        console.error('Error closing failed MongoDB connection:', e);
      }
      client = null;
    }
    
    // Retry logic
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying connection in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connect(retryCount + 1);
    }
    
    throw error;
  }
}

// Initialize connection promise
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connect().catch(async err => {
      console.error('Failed to establish initial MongoDB connection:', err);
      // Always return a new connection attempt instead of null
      return connect(1);
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = connect().catch(async err => {
    console.error('Failed to establish initial MongoDB connection:', err);
    // Always return a new connection attempt instead of null
    return connect(1);
  });
}

async function getDatabase() {
  try {
    // Get client, creating new connection if needed
    let mongoClient = await clientPromise;
    
    // If client is null or not connected, try to reconnect
    if (!mongoClient?.topology?.isConnected()) {
      console.log('No active connection, attempting to reconnect...');
      mongoClient = await connect();
    }

    // Get database instance
    const db = mongoClient.db(dbName);
    
    // Verify connection is alive
    try {
      await db.command({ ping: 1 });
    } catch (pingError) {
      console.error('Database ping failed, reconnecting...', pingError);
      mongoClient = await connect();
      return mongoClient.db(dbName);
    }
    
    return db;
  } catch (error) {
    console.error('Error getting database:', error);
    throw error;
  }
}

async function dbConnect() {
  try {
    if (mongoose.connections[0].readyState) {
      return true;
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbName
    });

    console.log('Mongoose connected successfully');
    return true;
  } catch (error) {
    console.error('Mongoose connection error:', error);
    throw error;
  }
}

module.exports = { 
  dbConnect, 
  getDatabase, 
  clientPromise 
};
