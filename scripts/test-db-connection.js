import { MongoClient } from 'mongodb';

// Set MongoDB URI directly for testing
const MONGODB_URI = 'mongodb+srv://firozanam:DispliTechGlobal2025@displitechglobal.zhclf.mongodb.net/?retryWrites=true&w=majority&appName=Sudolink/megaskyshop';
const dbName = 'megaskyshop';

async function testConnection() {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not set');
    process.exit(1);
  }

  console.log('Testing connection with URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    const db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);
    
    const collections = await db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Try to read from settings collection
    const settings = await db.collection('settings').findOne({});
    if (settings) {
      console.log('\nSuccessfully read from settings collection');
      console.log('Sample document:', settings);
    } else {
      console.log('\nNo documents found in settings collection');
    }

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nClosed database connection');
    process.exit(0);
  }
}

testConnection();
