# Awesome Pacific Notification Client

A real-time notification client for React/Next.js applications that connects to the Awesome Pacific notification system.

## Features

- 🔐 Organization verification with backend
- 🔄 Real-time Redis connection for notifications
- ⚛️ React hooks for easy integration
- 📱 TypeScript support
- 🎯 Simple and intuitive API

## Installation

```bash
npm install @awesome-pacific/notification-client
```

## Quick Start

### Basic Usage

```typescript
import { createNotificationClient } from '@awesome-pacific/notification-client';

const client = createNotificationClient({
  backendUrl: 'http://localhost:5000',
  redisUrl: 'redis://localhost:6379', // optional, defaults to localhost
  onMessage: (message) => {
    console.log('New notification:', message);
  },
  onError: (error) => {
    console.error('Connection error:', error);
  },
  onConnect: () => {
    console.log('Connected to notification service');
  },
  onDisconnect: () => {
    console.log('Disconnected from notification service');
  },
});

// Verify organization credentials
const verification = await client.verifyOrganization('your-org-name', 'your-vkey');

if (verification.success) {
  // Connect to receive notifications
  await client.connect('your-org-name');
}
```

### React Hook Usage

```typescript
import { useNotificationClient } from '@awesome-pacific/notification-client';

function NotificationComponent() {
  const {
    isConnected,
    isVerifying,
    currentOrg,
    messages,
    verifyOrganization,
    connect,
    disconnect,
    clearMessages,
    error,
  } = useNotificationClient({
    backendUrl: 'http://localhost:5000',
    redisUrl: 'redis://localhost:6379',
    onMessage: (message) => {
      console.log('New notification:', message);
    },
  });

  const handleVerify = async () => {
    const result = await verifyOrganization('your-org-name', 'your-vkey');
    if (result.success) {
      await connect('your-org-name');
    }
  };

  return (
    <div>
      <h2>Notifications</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {isVerifying && <p>Verifying...</p>}
      {isConnected && <p style={{ color: 'green' }}>Connected!</p>}
      
      <button onClick={handleVerify}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
      <button onClick={clearMessages}>Clear Messages</button>
      
      <div>
        <h3>Messages ({messages.length})</h3>
        {messages.map((message) => (
          <div key={message.id}>
            <strong>{message.senderName}:</strong> {message.content}
            <small>{new Date(message.sentTime).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## API Reference

### NotificationClient

#### Constructor

```typescript
new NotificationClient(config: NotificationClientConfig)
```

#### Configuration Options

```typescript
interface NotificationClientConfig {
  backendUrl: string;           // Backend API URL
  redisUrl?: string;           // Redis connection URL (optional)
  onMessage?: (message: NotificationMessage) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}
```

#### Methods

- `verifyOrganization(orgName: string, vkey: string): Promise<VerificationResponse>`
- `connect(orgName: string): Promise<boolean>`
- `disconnect(): Promise<void>`
- `getConnectionStatus(): boolean`
- `getCurrentOrganization(): OrganizationInfo | null`

### React Hook

#### useNotificationClient

```typescript
function useNotificationClient(options: UseNotificationClientOptions): UseNotificationClientReturn
```

#### Hook Options

```typescript
interface UseNotificationClientOptions extends NotificationClientConfig {
  autoConnect?: boolean;  // Automatically connect after verification
}
```

#### Hook Return Value

```typescript
interface UseNotificationClientReturn {
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
```

### Types

#### NotificationMessage

```typescript
interface NotificationMessage {
  id: string;
  content: string;
  orgName: string;
  senderName: string;
  senderId: string;
  sentTime: string;
}
```

#### OrganizationInfo

```typescript
interface OrganizationInfo {
  id: string;
  name: string;
  vkey: string;
  createdAt: string;
}
```

#### VerificationResponse

```typescript
interface VerificationResponse {
  success: boolean;
  organization?: OrganizationInfo;
  error?: string;
}
```

## Setup Requirements

1. **Backend Server**: Ensure your Awesome Pacific backend is running on the specified URL
2. **Redis Server**: Make sure Redis is running and accessible
3. **Organization Credentials**: You need valid organization name and vkey from your backend

## Error Handling

The client provides comprehensive error handling:

- Network errors during verification
- Redis connection failures
- Invalid organization credentials
- Message parsing errors

All errors are passed to the `onError` callback and can be accessed via the React hook's `error` state.

## Examples

### Next.js Integration

```typescript
// pages/notifications.tsx
import { useNotificationClient } from '@awesome-pacific/notification-client';
import { useEffect } from 'react';

export default function NotificationsPage() {
  const {
    isConnected,
    messages,
    verifyOrganization,
    connect,
    error,
  } = useNotificationClient({
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
    autoConnect: true,
  });

  useEffect(() => {
    // Auto-verify and connect on component mount
    const initNotifications = async () => {
      const result = await verifyOrganization('your-org', 'your-vkey');
      if (result.success) {
        await connect('your-org');
      }
    };
    
    initNotifications();
  }, []);

  return (
    <div>
      <h1>Real-time Notifications</h1>
      {error && <p>Error: {error}</p>}
      {isConnected && <p>✅ Connected</p>}
      
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.senderName}</strong>: {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Custom Notification Component

```typescript
// components/NotificationWidget.tsx
import { useNotificationClient } from '@awesome-pacific/notification-client';
import { useState } from 'react';

export function NotificationWidget() {
  const [orgName, setOrgName] = useState('');
  const [vkey, setVkey] = useState('');
  
  const {
    isConnected,
    messages,
    verifyOrganization,
    connect,
    disconnect,
    error,
  } = useNotificationClient({
    backendUrl: 'http://localhost:5000',
  });

  const handleConnect = async () => {
    const result = await verifyOrganization(orgName, vkey);
    if (result.success) {
      await connect(orgName);
    }
  };

  return (
    <div className="notification-widget">
      <div className="connection-form">
        <input
          type="text"
          placeholder="Organization Name"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
        />
        <input
          type="password"
          placeholder="Verification Key"
          value={vkey}
          onChange={(e) => setVkey(e.target.value)}
        />
        <button onClick={handleConnect} disabled={isConnected}>
          {isConnected ? 'Connected' : 'Connect'}
        </button>
        {isConnected && (
          <button onClick={disconnect}>Disconnect</button>
        )}
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <div className="sender">{msg.senderName}</div>
            <div className="content">{msg.content}</div>
            <div className="time">
              {new Date(msg.sentTime).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## License

MIT
