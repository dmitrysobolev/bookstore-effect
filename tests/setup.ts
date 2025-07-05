import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";

let mongoServer: MongoMemoryServer;
let mongoClient: MongoClient;

// Global test setup
beforeAll(async () => {
  // Start in-memory MongoDB instance for testing
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: "bookstore_test",
    },
  });

  const mongoUri = mongoServer.getUri();

  // Set environment variables for tests
  process.env.MONGODB_URI = mongoUri;
  process.env.DB_NAME = "bookstore_test";
  process.env.NODE_ENV = "test";

  // Create MongoDB client for test utilities
  mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
}, 60000); // 60 second timeout for MongoDB startup

// Global test teardown
afterAll(async () => {
  if (mongoClient) {
    await mongoClient.close();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);

// Clean database between tests
beforeEach(async () => {
  if (mongoClient) {
    const db = mongoClient.db("bookstore_test");
    const collections = await db.listCollections().toArray();

    // Drop all collections
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
    }
  }
});

// Test utilities
export const getTestDb = () => {
  if (!mongoClient) {
    throw new Error("MongoDB client not initialized");
  }
  return mongoClient.db("bookstore_test");
};

export const clearTestDb = async () => {
  const db = getTestDb();
  const collections = await db.listCollections().toArray();

  for (const collection of collections) {
    await db.collection(collection.name).deleteMany({});
  }
};

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Increase timeout for async operations
jest.setTimeout(30000);

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
