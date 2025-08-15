import  WebSocket from "ws";
import { createClient, RedisClientType } from "redis";

// Type definitions
interface ParsedMessage {
  orgName?: string;
  type?: string;
  content?: any;
}

interface ErrorResponse {
  type: "error";
  message: string;
}

interface SuccessResponse {
  type: "success";
  message: string;
}

interface MessageResponse {
  type: "message";
  orgName: string;
  content: any;
  timestamp: string;
}

type ServerResponse = ErrorResponse | SuccessResponse | MessageResponse;

interface PublishedMessage {
  content: any;
  timestamp: string;
  sender: string;
}

// Create Redis clients
const publisher: RedisClientType = createClient();

// Store active publishers by orgName
const activePublishers: Map<string, boolean> = new Map();

const allowedOrigins = [
  'http://localhost:3000' // for development
];

// const wss: WebSocketServer = new WebSocketServer({ port: 8080 });
const wss = new WebSocket.Server({
  port: 8080,
  // @ts-ignore
  verifyClient: (info : any) => {
    const origin = info.origin;
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return true;
    }
    
    console.log(`Rejected connection from origin: ${origin}`);
    return false;
  }
});
let totaluser: number = 0;

// Initialize Redis connections
async function initializeRedis(): Promise<void> {
  try {
    await publisher.connect();
    console.log("Redis publisher connected successfully");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
}

// Create or get publisher for an orgName
async function createOrGetPublisher(orgName: string): Promise<boolean> {
  if (!activePublishers.has(orgName)) {
    console.log(`Creating new publisher for orgName: ${orgName}`);
    activePublishers.set(orgName, true);
  }
  return true;
}

// Initialize Redis when server starts
initializeRedis();

wss.on("connection", async (socket: WebSocket) => {
  totaluser = totaluser + 1;
  console.log("User joined, total users:", totaluser);

  socket.on("message", async (message: Buffer) => {
    try {
      const parsedMessage: ParsedMessage = JSON.parse(message.toString());
      console.log("Received message:", parsedMessage);

      const { orgName, type, content } = parsedMessage;

      // Check if orgName is provided
      if (!orgName) {
        const errorResponse: ErrorResponse = {
          type: "error",
          message: "orgName is required",
        };
        socket.send(JSON.stringify(errorResponse));
        return;
      }

      // Handle only publish message type
      if (type === "publish" && content !== undefined) {
        // User wants to publish content to an orgName
        try {
          await createOrGetPublisher(orgName);

          // Publish the content to Redis
          const messageToPublish: PublishedMessage = {
            content: content,
            timestamp: new Date().toISOString(),
            sender: "anonymous", // You can enhance this with actual user identification
          };

          await publisher.publish(orgName, JSON.stringify(messageToPublish));
          console.log(`Published message to orgName ${orgName}:`, content);

          const successResponse: SuccessResponse = {
            type: "success",
            message: `Message published to orgName: ${orgName}`,
          };
          socket.send(JSON.stringify(successResponse));
        } catch (error) {
          console.error("Error publishing message:", error);
          const errorResponse: ErrorResponse = {
            type: "error",
            message: "Failed to publish message",
          };
          socket.send(JSON.stringify(errorResponse));
        }
      } else {
        const errorResponse: ErrorResponse = {
          type: "error",
          message:
            "Invalid message format. Expected 'type' to be 'publish' with 'content'",
        };
        socket.send(JSON.stringify(errorResponse));
      }
    } catch (error) {
      console.error("Error parsing message:", error);
      const errorResponse: ErrorResponse = {
        type: "error",
        message: "Invalid JSON format",
      };
      socket.send(JSON.stringify(errorResponse));
    }
  });

  socket.on("close", () => {
    totaluser = totaluser - 1;
    console.log("User disconnected, total users:", totaluser);
  });

  socket.on("error", (error: Error) => {
    console.error("WebSocket error:", error);
  });
});

console.log("WebSocket server started on port 8080");
