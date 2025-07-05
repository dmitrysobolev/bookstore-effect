#!/usr/bin/env node

const { MongoClient } = require("mongodb");

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "bookstore_effect";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkMongoDB() {
  let client;

  try {
    log("blue", "🔍 Checking MongoDB connection...");
    log("cyan", `Connection URI: ${MONGODB_URI}`);
    log("cyan", `Database Name: ${DB_NAME}`);
    console.log("");

    // Create MongoDB client
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 5000,
    });

    // Connect to MongoDB
    log("blue", "⏳ Connecting to MongoDB...");
    await client.connect();

    log("green", "✓ Successfully connected to MongoDB");

    // Check database access
    const db = client.db(DB_NAME);
    log("blue", `📊 Checking database access for '${DB_NAME}'...`);

    // List collections to verify database access
    const collections = await db.listCollections().toArray();
    log("green", `✓ Database access confirmed`);
    log("cyan", `  Found ${collections.length} collections:`);

    if (collections.length > 0) {
      collections.forEach((collection) => {
        log("cyan", `    - ${collection.name}`);
      });
    } else {
      log("yellow", "    - No collections found (database is empty)");
    }

    // Test write/read operations
    log("blue", "🧪 Testing write/read operations...");

    const testCollection = db.collection("_health_check");
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: "MongoDB health check",
    };

    // Insert test document
    const insertResult = await testCollection.insertOne(testDoc);
    log("green", "✓ Write operation successful");

    // Read test document
    const readResult = await testCollection.findOne({
      _id: insertResult.insertedId,
    });
    if (readResult) {
      log("green", "✓ Read operation successful");
    } else {
      throw new Error("Failed to read test document");
    }

    // Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    log("green", "✓ Cleanup successful");

    // Check server status
    log("blue", "📈 Checking server status...");
    const admin = db.admin();
    const serverStatus = await admin.serverStatus();

    log("green", "✓ Server status retrieved");
    log("cyan", `  MongoDB Version: ${serverStatus.version}`);
    log("cyan", `  Uptime: ${Math.floor(serverStatus.uptime / 60)} minutes`);
    log("cyan", `  Process: ${serverStatus.process}`);
    log("cyan", `  Host: ${serverStatus.host}`);

    console.log("");
    log("green", "🎉 MongoDB is healthy and ready!");
    console.log("");
    log("blue", "📋 Summary:");
    log("green", "  ✓ Connection established");
    log("green", "  ✓ Database accessible");
    log("green", "  ✓ Read/write operations working");
    log("green", "  ✓ Server responding");

    return true;
  } catch (error) {
    console.log("");
    log("red", "❌ MongoDB Health Check Failed");
    log("red", `Error: ${error.message}`);
    console.log("");

    // Provide helpful troubleshooting information
    log("yellow", "🔧 Troubleshooting tips:");

    if (error.message.includes("ECONNREFUSED")) {
      log("yellow", "  • MongoDB server is not running");
      log("yellow", "  • Start MongoDB with: mongod");
      log(
        "yellow",
        "  • Or use: brew services start mongodb-community (macOS)",
      );
      log("yellow", "  • Or use: sudo service mongod start (Linux)");
    } else if (error.message.includes("authentication failed")) {
      log("yellow", "  • Check MongoDB authentication credentials");
      log("yellow", "  • Verify username and password in connection string");
    } else if (error.message.includes("timeout")) {
      log("yellow", "  • MongoDB server may be unresponsive");
      log("yellow", "  • Check if MongoDB is running and accessible");
      log("yellow", "  • Verify network connectivity");
    } else {
      log("yellow", "  • Check MongoDB logs for more details");
      log("yellow", "  • Verify MongoDB configuration");
      log("yellow", "  • Ensure sufficient disk space and memory");
    }

    console.log("");
    log("blue", "📖 Additional resources:");
    log(
      "cyan",
      "  • MongoDB Installation: https://docs.mongodb.com/manual/installation/",
    );
    log(
      "cyan",
      "  • Connection Troubleshooting: https://docs.mongodb.com/manual/reference/connection-string/",
    );

    return false;
  } finally {
    // Close the connection
    if (client) {
      try {
        await client.close();
        log("blue", "🔌 Connection closed");
      } catch (closeError) {
        log(
          "yellow",
          `Warning: Failed to close connection: ${closeError.message}`,
        );
      }
    }
  }
}

// Handle script execution
async function main() {
  console.log("");
  log("cyan", "🍃 MongoDB Health Checker");
  log("cyan", "========================");
  console.log("");

  const isHealthy = await checkMongoDB();

  // Exit with appropriate code
  process.exit(isHealthy ? 0 : 1);
}

// Handle unhandled errors
process.on("unhandledRejection", (error) => {
  log("red", `Unhandled rejection: ${error.message}`);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  log("red", `Uncaught exception: ${error.message}`);
  process.exit(1);
});

// Run the health check if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { checkMongoDB };
