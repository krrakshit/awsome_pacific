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
  backendUrl?: string; // Made optional since it can come from env vars
  redisUrl?: string;
  onMessage?: (message: NotificationMessage) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}
