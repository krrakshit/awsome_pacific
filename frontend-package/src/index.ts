import { createClient, RedisClientType } from "redis";

export interface NotificationMessage {
  id: string;
  content: string;
  orgName: string;
  senderName: string;
  senderId: string;
  sentTime: string;
}

export interface OrganizationInfo {
  id: string;
  name: string;
  vkey: string;
  createdAt: string;
}

export interface VerificationResponse {
  success: boolean;
  organization?: OrganizationInfo;
  error?: string;
}

export interface NotificationClientConfig {
  backendUrl: string;
  redisUrl?: string;
  onMessage?: (message: NotificationMessage) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class NotificationClient {
  private config: NotificationClientConfig;
  private redisClient: RedisClientType | null = null;
  private isConnected = false;
  private currentOrg: OrganizationInfo | null = null;

  constructor(config: NotificationClientConfig) {
    this.config = {
      redisUrl: "redis://localhost:6379",
      ...config,
    };
  }

  /**
   * Verify organization credentials with the backend
   * @param orgName - Organization name
   * @param vkey - Organization verification key
   * @returns Promise<VerificationResponse>
   */
  async verifyOrganization(orgName: string, vkey: string): Promise<VerificationResponse> {
    try {
      const response = await fetch(`${this.config.backendUrl}/verify-org`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orgName, vkey }),
      });

      const data = await response.json();

      if (data.success) {
        this.currentOrg = data.organization;
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  /**
   * Connect to Redis and start listening for notifications
   * @param orgName - Organization name to subscribe to
   * @returns Promise<boolean>
   */
  async connect(orgName: string): Promise<boolean> {
    if (!this.currentOrg) {
      throw new Error("Organization not verified. Call verifyOrganization() first.");
    }

    if (this.isConnected) {
      throw new Error("Already connected to Redis");
    }

    try {
      // Create Redis client
      this.redisClient = createClient({
        url: this.config.redisUrl,
      });

      // Set up event handlers
      this.redisClient.on("error", (err: Error) => {
        this.isConnected = false;
        this.config.onError?.(err);
      });

      this.redisClient.on("connect", () => {
        this.isConnected = true;
        this.config.onConnect?.();
      });

      this.redisClient.on("ready", () => {
        this.subscribeToOrganization(orgName);
      });

      this.redisClient.on("end", () => {
        this.isConnected = false;
        this.config.onDisconnect?.();
      });

      // Connect to Redis
      await this.redisClient.connect();

      return true;
    } catch (error) {
      this.isConnected = false;
      throw error instanceof Error ? error : new Error("Failed to connect to Redis");
    }
  }

  /**
   * Subscribe to organization notifications
   * @param orgName - Organization name to subscribe to
   */
  private async subscribeToOrganization(orgName: string): Promise<void> {
    if (!this.redisClient) {
      throw new Error("Redis client not initialized");
    }

    try {
      await this.redisClient.subscribe(orgName, (message: string, channel: string) => {
        try {
          // Try to parse message as JSON
          const parsedMessage: NotificationMessage = JSON.parse(message);
          this.config.onMessage?.(parsedMessage);
        } catch {
          // If not JSON, create a simple message object
          const simpleMessage: NotificationMessage = {
            id: Date.now().toString(),
            content: message,
            orgName: channel,
            senderName: "Unknown",
            senderId: "unknown",
            sentTime: new Date().toISOString(),
          };
          this.config.onMessage?.(simpleMessage);
        }
      });
    } catch (error) {
      throw error instanceof Error ? error : new Error("Failed to subscribe to organization");
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.redisClient && this.isConnected) {
      try {
        await this.redisClient.unsubscribe();
        await this.redisClient.quit();
      } catch (error) {
        // Ignore errors during disconnect
      } finally {
        this.redisClient = null;
        this.isConnected = false;
      }
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get current organization info
   */
  getCurrentOrganization(): OrganizationInfo | null {
    return this.currentOrg;
  }
}

// Export default instance creator
export function createNotificationClient(config: NotificationClientConfig): NotificationClient {
  return new NotificationClient(config);
}

// Export types
export type { NotificationMessage, OrganizationInfo, VerificationResponse, NotificationClientConfig };
