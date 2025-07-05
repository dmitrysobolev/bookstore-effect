import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalTeardown() {
  console.log('🧹 Cleaning up test environment...');

  // Get the MongoDB server instance from global setup
  const mongoServer: MongoMemoryServer = (global as any).__MONGO_SERVER__;

  if (mongoServer) {
    await mongoServer.stop();
    console.log('✅ Test MongoDB stopped');
  }

  // Clean up environment variables
  delete process.env.MONGODB_URI;
  delete process.env.DB_NAME;
  delete process.env.NODE_ENV;
  delete process.env.PORT;

  console.log('✅ Test environment cleaned up');
}
