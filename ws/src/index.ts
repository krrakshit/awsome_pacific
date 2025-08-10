import { WebSocketServer, WebSocket } from "ws";
import { createClient, RedisClientType } from "redis";

// Type definitions
interface ParsedMessage {
  orgid?: string;
  type?: string;
  content?: any;
  orgName?: string;
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
  orgid: string;
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
const subscriber: RedisClientType = createClient();

// Store active publishers and subscribers by orgid
const activePublishers: Map<string, boolean> = new Map();
const orgSubscribers: Map<string, Set<WebSocket>> = new Map(); // Map of orgid -> Set of WebSocket connections

const wss: WebSocketServer = new WebSocketServer({ port: 8080 });
let totaluser: number = 0;

// Initialize Redis connections
async function initializeRedis(): Promise<void> {
  try {
    await publisher.connect();
    await subscriber.connect();
    console.log("Redis clients connected successfully");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
}

// Check if organization exists in Redis
async function organizationExists(orgName: string): Promise<boolean> {
  try {
    const exists = await publisher.exists(`org:${orgName}`);
    return exists === 1;
  } catch (error) {
    console.error("Error checking organization existence:", error);
    return false;
  }
}

// Create organization in Redis
async function createOrganization(orgName: string): Promise<boolean> {
  try {
    const exists = await organizationExists(orgName);
    if (exists) {
      return false; // Organization already exists
    }

    // Store organization info in Redis
    await publisher.set(
      `org:${orgName}`,
      JSON.stringify({
        name: orgName,
        created: new Date().toISOString(),
        active: true,
      })
    );

    console.log(`Organization "${orgName}" created successfully`);
    return true;
  } catch (error) {
    console.error("Error creating organization:", error);
    return false;
  }
}

// Get all organizations
async function getAllOrganizations(): Promise<string[]> {
  try {
    const keys = await publisher.keys("org:*");
    return keys.map((key) => key.replace("org:", ""));
  } catch (error) {
    console.error("Error getting organizations:", error);
    return [];
  }
}

// Create or get publisher for an orgid
async function createOrGetPublisher(orgid: string): Promise<boolean> {
  if (!activePublishers.has(orgid)) {
    console.log(`Creating new publisher for orgid: ${orgid}`);
    activePublishers.set(orgid, true);

    await subscriber.subscribe(orgid, (message: string, channel: string) => {
      console.log(`Received message on channel ${channel}:`, message);

      const subscribers: Set<WebSocket> | undefined =
        orgSubscribers.get(channel);
      if (subscribers) {
        const messageData: PublishedMessage = JSON.parse(message);
        const response: MessageResponse = {
          type: "message",
          orgid: channel,
          content: messageData.content,
          timestamp: new Date().toISOString(),
        };

        subscribers.forEach((socket: WebSocket) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(response));
          }
        });
      }
    });
  }
  return true;
}
function addSubscriber(orgid: string, socket: WebSocket): void {
  if (!orgSubscribers.has(orgid)) {
    orgSubscribers.set(orgid, new Set<WebSocket>());
  }
  orgSubscribers.get(orgid)!.add(socket);
  console.log(`Added subscriber to orgid: ${orgid}`);
}

// Remove WebSocket connection from orgid subscribers
function removeSubscriber(orgid: string, socket: WebSocket): void {
  const subscribers: Set<WebSocket> | undefined = orgSubscribers.get(orgid);
  if (subscribers) {
    subscribers.delete(socket);
    if (subscribers.size === 0) {
      orgSubscribers.delete(orgid);
      console.log(`No more subscribers for orgid: ${orgid}`);
    }
  }
}

// Initialize Redis when server starts
initializeRedis();

wss.on("connection", async (socket: WebSocket) => {
  totaluser = totaluser + 1;
  console.log("User joined, total users:", totaluser);

  let userOrgid: string | null = null; // Track which orgid this socket is subscribed to

  socket.on("message", async (message: Buffer) => {
    try {
      const parsedMessage: ParsedMessage = JSON.parse(message.toString());
      console.log("Received message:", parsedMessage);

      const { orgid, type, content, orgName } = parsedMessage;

      // Handle different message types
      if (type === "create_org") {
        // User wants to create a new organization
        if (!orgName) {
          const errorResponse: ErrorResponse = {
            type: "error",
            message: "orgName is required for creating organization",
          };
          socket.send(JSON.stringify(errorResponse));
          return;
        }

        try {
          const created = await createOrganization(orgName);
          if (created) {
            const successResponse: SuccessResponse = {
              type: "success",
              message: `Organization "${orgName}" created successfully`,
            };
            socket.send(JSON.stringify(successResponse));
          } else {
            const errorResponse: ErrorResponse = {
              type: "error",
              message: `Organization "${orgName}" already exists. Please choose a different name.`,
            };
            socket.send(JSON.stringify(errorResponse));
          }
        } catch (error) {
          console.error("Error creating organization:", error);
          const errorResponse: ErrorResponse = {
            type: "error",
            message: "Failed to create organization",
          };
          socket.send(JSON.stringify(errorResponse));
        }
        return;
      }

      if (type === "list_orgs") {
        // User wants to get list of all organizations
        try {
          const orgs = await getAllOrganizations();
          const response = {
            type: "org_list",
            organizations: orgs,
          };
          socket.send(JSON.stringify(response));
        } catch (error) {
          console.error("Error getting organizations:", error);
          const errorResponse: ErrorResponse = {
            type: "error",
            message: "Failed to get organizations list",
          };
          socket.send(JSON.stringify(errorResponse));
        }
        return;
      }

      // Check if orgid is provided for subscribe/publish operations
      if (!orgid) {
        const errorResponse: ErrorResponse = {
          type: "error",
          message: "orgid is required for subscribe/publish operations",
        };
        socket.send(JSON.stringify(errorResponse));
        return;
      }

      // Handle different message types
      if (type === "subscribe") {
        // User wants to subscribe to an orgid
        try {
          await createOrGetPublisher(orgid);
          addSubscriber(orgid, socket);
          userOrgid = orgid;

          const successResponse: SuccessResponse = {
            type: "success",
            message: `Successfully subscribed to orgid: ${orgid}`,
          };
          socket.send(JSON.stringify(successResponse));
        } catch (error) {
          console.error("Error subscribing to orgid:", error);
          const errorResponse: ErrorResponse = {
            type: "error",
            message: "Failed to subscribe to orgid",
          };
          socket.send(JSON.stringify(errorResponse));
        }
      } else if (type === "publish" && content !== undefined) {
        // User wants to publish content to an orgid
        try {
          await createOrGetPublisher(orgid);

          // Publish the content to Redis
          const messageToPublish: PublishedMessage = {
            content: content,
            timestamp: new Date().toISOString(),
            sender: "anonymous", // You can enhance this with actual user identification
          };

          await publisher.publish(orgid, JSON.stringify(messageToPublish));
          console.log(`Published message to orgid ${orgid}:`, content);

          const successResponse: SuccessResponse = {
            type: "success",
            message: `Message published to orgid: ${orgid}`,
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
            "Invalid message format. Expected 'type' to be 'subscribe' or 'publish', and 'content' for publish messages",
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

    // Remove from subscribers if they were subscribed
    if (userOrgid) {
      removeSubscriber(userOrgid, socket);
    }
  });

  socket.on("error", (error: Error) => {
    console.error("WebSocket error:", error);
  });
});

console.log("WebSocket server started on port 8080");
