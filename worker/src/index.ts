import { createClient } from "redis";
import type { RedisClientType } from "redis"
import { PrismaClient } from "../../backend/prisma/generated/prisma/index.js";
import * as readline from "readline";

const prisma = new PrismaClient();

// Redis client for subscribing
let subscriber: RedisClientType | null = null;

// Interface for organization validation
interface OrgCredentials {
  orgName: string;
  vkey: string;
}

// Function to initialize Redis connection
async function initializeRedis(): Promise<void> {
  try {
    subscriber = createClient({
      url: "redis://localhost:6379",
    });

    subscriber.on("error", (err: Error) => {
      console.error("Redis Subscriber Error:", err);
    });

    subscriber.on("connect", () => {
      console.log("✅ Connected to Redis server");
    });

    subscriber.on("ready", () => {
      console.log("✅ Redis subscriber is ready");
    });

    await subscriber.connect();
  } catch (error) {
    console.error("❌ Failed to initialize Redis:", error);
    process.exit(1);
  }
}

// Function to validate organization credentials
async function validateOrganization(
  orgName: string,
  vkey: string
): Promise<boolean> {
  try {
    const org = await prisma.org.findFirst({
      where: {
        name: orgName,
        vkey: vkey,
      },
    });

    return !!org; // Return true if organization exists with matching credentials
  } catch (error) {
    console.error("❌ Database error during validation:", error);
    return false;
  }
}

// Function to subscribe to organization channel
async function subscribeToOrganization(orgName: string): Promise<void> {
  if (!subscriber) {
    console.error("❌ Redis subscriber not initialized");
    return;
  }

  try {
    console.log(`🔔 Subscribing to organization: ${orgName}`);
    console.log("📢 Listening for notifications...\n");

    // Subscribe to the Redis channel (using orgName as channel name)
    await subscriber.subscribe(orgName, (message: string, channel: string) => {
      console.log("📨 NEW NOTIFICATION RECEIVED:");
      console.log(
        "┌─────────────────────────────────────────────────────────────┐"
      );
      console.log(`│ Channel: ${channel.padEnd(49)} │`);
      console.log(`│ Timestamp: ${new Date().toISOString().padEnd(45)} │`);
      console.log(
        "├─────────────────────────────────────────────────────────────┤"
      );

      try {
        // Try to parse message as JSON
        const parsedMessage = JSON.parse(message);
        console.log(
          `│ Content: ${JSON.stringify(parsedMessage, null, 2)
            .split("\n")
            .join("\n│          ")}`
        );
      } catch {
        // If not JSON, display as plain text
        console.log(`│ Content: ${message.padEnd(49)} │`);
      }

      console.log(
        "└─────────────────────────────────────────────────────────────┘\n"
      );
    });

    console.log(`✅ Successfully subscribed to channel: ${orgName}`);
    console.log("Press Ctrl+C to disconnect and exit\n");
  } catch (error) {
    console.error("❌ Failed to subscribe to organization channel:", error);
  }
}

// Function to get user input
function getUserInput(): Promise<OrgCredentials> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("🏢 Enter Organization Name: ", (orgName: string) => {
      rl.question("🔑 Enter Organization vKey: ", (vkey: string) => {
        rl.close();
        resolve({ orgName: orgName.trim(), vkey: vkey.trim() });
      });
    });
  });
}

// Main function
async function main(): Promise<void> {
  console.log("🚀 Notification Worker Service Starting...\n");

  try {
    // Initialize connections
    console.log("⏳ Connecting to services...");
    await initializeRedis();
    console.log("✅ All services connected\n");

    console.log("🔐 Authentication Required");
    console.log("Please provide your organization credentials:\n");

    // Get credentials from user
    const credentials = await getUserInput();

    if (!credentials.orgName || !credentials.vkey) {
      console.error("❌ Organization name and vKey are required");
      process.exit(1);
    }

    console.log("\n⏳ Validating credentials...");

    // Validate credentials
    const isValid = await validateOrganization(
      credentials.orgName,
      credentials.vkey
    );

    if (!isValid) {
      console.error("❌ Invalid organization credentials");
      console.error("Please check your organization name and vKey");
      process.exit(1);
    }

    console.log("✅ Credentials validated successfully\n");

    // Subscribe to organization channel
    await subscribeToOrganization(credentials.orgName);

    // Keep the process running
    process.on("SIGINT", async () => {
      console.log("\n\n🛑 Shutting down worker service...");

      if (subscriber) {
        await subscriber.unsubscribe();
        await subscriber.quit();
      }

      await prisma.$disconnect();
      console.log("✅ Worker service shut down gracefully");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Start the worker service
main().catch((error) => {
  console.error("❌ Failed to start worker service:", error);
  process.exit(1);
});
