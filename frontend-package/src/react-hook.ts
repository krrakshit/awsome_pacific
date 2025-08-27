import { useState, useEffect, useCallback, useRef } from 'react';
import { NotificationClient } from './index';
import type { NotificationClientConfig, NotificationMessage, OrganizationInfo, VerificationResponse } from './types';

export interface UseNotificationClientOptions extends NotificationClientConfig {
  autoConnect?: boolean;
}

export interface UseNotificationClientReturn {
  client: NotificationClient | null;
  isConnected: boolean;
  isVerifying: boolean;
  currentOrg: OrganizationInfo | null;
  messages: NotificationMessage[];
  verifyOrganization: (orgName: string, vkey: string) => Promise<VerificationResponse>;
  connect: (orgName: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  clearMessages: () => void;
  error: string | null;
}

export function useNotificationClient(options: UseNotificationClientOptions): UseNotificationClientReturn {
  const [client, setClient] = useState<NotificationClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentOrg, setCurrentOrg] = useState<OrganizationInfo | null>(null);
  const [messages, setMessages] = useState<NotificationMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const clientRef = useRef<NotificationClient | null>(null);

  // Initialize client
  useEffect(() => {
    const notificationClient = new NotificationClient({
      ...options,
      onMessage: (message: NotificationMessage) => {
        setMessages(prev => [message, ...prev]);
        options.onMessage?.(message);
      },
      onError: (err: Error) => {
        setError(err.message);
        setIsConnected(false);
        options.onError?.(err);
      },
      onConnect: () => {
        setIsConnected(true);
        setError(null);
        options.onConnect?.();
      },
      onDisconnect: () => {
        setIsConnected(false);
        options.onDisconnect?.();
      },
    });

    setClient(notificationClient);
    clientRef.current = notificationClient;

    return () => {
      notificationClient.disconnect();
    };
  }, [options.backendUrl, options.redisUrl]);

  // Auto-connect if enabled
  useEffect(() => {
    if (options.autoConnect && client && currentOrg) {
      connect(currentOrg.name);
    }
  }, [client, currentOrg, options.autoConnect]);

  const verifyOrganization = useCallback(async (orgName: string, vkey: string): Promise<VerificationResponse> => {
    if (!client) {
      return { success: false, error: "Client not initialized" };
    }

    setIsVerifying(true);
    setError(null);

    try {
      const result = await client.verifyOrganization(orgName, vkey);
      
      if (result.success && result.organization) {
        setCurrentOrg(result.organization);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Verification failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsVerifying(false);
    }
  }, [client]);

  const connect = useCallback(async (orgName: string): Promise<boolean> => {
    if (!client) {
      setError("Client not initialized");
      return false;
    }

    try {
      setError(null);
      const success = await client.connect(orgName);
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Connection failed";
      setError(errorMessage);
      return false;
    }
  }, [client]);

  const disconnect = useCallback(async (): Promise<void> => {
    if (client) {
      await client.disconnect();
    }
  }, [client]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    client,
    isConnected,
    isVerifying,
    currentOrg,
    messages,
    verifyOrganization,
    connect,
    disconnect,
    clearMessages,
    error,
  };
}
