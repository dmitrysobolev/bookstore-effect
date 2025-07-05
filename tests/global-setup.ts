import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

export default async function globalSetup() {
  console.log("🔧 Setting up test environment...");

  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: "bookstore_test",
    },
  });

  const mongoUri = mongoServer.getUri();

  // Set global environment variables for all tests
  process.env.MONGODB_URI = mongoUri;
  process.env.DB_NAME = "bookstore_test";
  process.env.NODE_ENV = "test";
  process.env.PORT = "3001";

  // Store the server instance for cleanup
  (global as any).__MONGO_SERVER__ = mongoServer;

  console.log(`✅ Test MongoDB running at: ${mongoUri}`);
}
