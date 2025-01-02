import { getDatabase } from '../lib/mongodb.js';

// Get MongoDB URI from command line argument or environment variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://firozanam:DispliTechGlobal2025@displitechglobal.zhclf.mongodb.net/?retryWrites=true&w=majority&appName=Sudolink/megaskyshop';

// Set it in process.env for the mongodb.js module to use
process.env.MONGODB_URI = MONGODB_URI;

async function testConnection() {
    try {
        console.log('Testing database connection...');
        console.log('Using MongoDB URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
        
        const db = await getDatabase();
        console.log('Successfully connected to database');

        // Test reading from a collection
        const collections = await db.listCollections().toArray();
        console.log('\nAvailable collections:');
        collections.forEach(collection => {
            console.log(`- ${collection.name}`);
        });

        // Test reading from settings collection
        const settings = await db.collection('settings').findOne({});
        console.log('\nSample settings document:', settings);

        console.log('\nDatabase connection test completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Database connection test failed:', error);
        process.exit(1);
    }
}

testConnection();
