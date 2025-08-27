# Awesome Pacific Notification Widget

A React/Next.js component for displaying real-time notifications from the Awesome Pacific notification system. This widget connects to Redis pub/sub channels and displays notifications in a beautiful, customizable interface.

## Features

- 🔐 **Secure Organization Verification**: Verifies organization credentials before connecting
- 🔄 **Real-time Notifications**: Connects to Redis pub/sub for instant message delivery
- 🎨 **Customizable Themes**: Light and dark theme support
- 📍 **Flexible Positioning**: Choose from 4 corner positions
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Easy Integration**: Simple React component that can be dropped into any app
- 🔧 **Configurable**: Multiple props for customization

## Installation

```bash
npm install awesome-pacific-notification-client
```

## Quick Start

### Basic Usage

```jsx
import { NotificationWidget } from 'awesome-pacific-notification-client';

function App() {
  return (
    <div>
      <h1>My App</h1>
      <NotificationWidget 
        orgName="my-organization"
        vkey="your-verification-key"
        autoConnect={true}
      />
    </div>
  );
}
```

### Manual Connection

```jsx
import { NotificationWidget } from 'awesome-pacific-notification-client';

function App() {
  return (
    <div>
      <h1>My App</h1>
      <NotificationWidget 
        autoConnect={false}
        onMessage={(message) => {
          console.log('New notification:', message);
        }}
        onConnect={() => {
          console.log('Connected to notification service');
        }}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backendUrl` | `string` | From env vars | URL of your Awesome Pacific backend server |
| `redisUrl` | `string` | From env vars | Redis connection URL |
| `orgName` | `string` | - | Organization name (for auto-connect) |
| `vkey` | `string` | - | Organization verification key (for auto-connect) |
| `autoConnect` | `boolean` | `false` | Automatically connect if orgName and vkey are provided |
| `theme` | `'light' \| 'dark'` | `'light'` | Widget theme |
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'bottom-right'` | Widget position on screen |
| `maxMessages` | `number` | `10` | Maximum number of messages to display |
| `showConnectionStatus` | `boolean` | `true` | Show connection status indicator |
| `onMessage` | `(message: NotificationMessage) => void` | - | Callback when new message is received |
| `onError` | `(error: Error) => void` | - | Callback when error occurs |
| `onConnect` | `() => void` | - | Callback when successfully connected |
| `onDisconnect` | `() => void` | - | Callback when disconnected |
| `className` | `string` | - | Additional CSS class name |
| `style` | `React.CSSProperties` | - | Additional inline styles |

## Message Format

The widget receives messages in the following format:

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

## Advanced Usage

### Using the Hook

For more control, you can use the `useNotificationClient` hook:

```jsx
import { useNotificationClient } from 'awesome-pacific-notification-client';

function MyComponent() {
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
    onMessage: (message) => {
      console.log('New message:', message);
    },
  });

  const handleConnect = async () => {
    const result = await verifyOrganization('my-org', 'my-vkey');
    if (result.success) {
      await connect('my-org');
    }
  };

  return (
    <div>
      <button onClick={handleConnect} disabled={isVerifying}>
        {isVerifying ? 'Verifying...' : 'Connect'}
      </button>
      {isConnected && <p>Connected to {currentOrg?.name}</p>}
      {error && <p>Error: {error}</p>}
      <div>
        {messages.map(message => (
          <div key={message.id}>
            <strong>{message.senderName}</strong>: {message.content}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Custom Styling

```jsx
<NotificationWidget 
  theme="dark"
  position="top-left"
  className="my-custom-widget"
  style={{
    zIndex: 10000,
    transform: 'scale(0.9)',
  }}
/>
```

## Environment Variables

The widget can be configured using environment variables. This is the recommended approach for production deployments.

### Supported Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NOTIFICATION_BACKEND_URL` | Backend server URL | `http://your-backend.com` |
| `NOTIFICATION_REDIS_URL` | Redis server URL | `redis://your-redis.com:6379` |
| `REACT_APP_NOTIFICATION_BACKEND_URL` | React app backend URL | `http://your-backend.com` |
| `REACT_APP_NOTIFICATION_REDIS_URL` | React app Redis URL | `redis://your-redis.com:6379` |
| `NEXT_PUBLIC_NOTIFICATION_BACKEND_URL` | Next.js backend URL | `http://your-backend.com` |
| `NEXT_PUBLIC_NOTIFICATION_REDIS_URL` | Next.js Redis URL | `redis://your-redis.com:6379` |

### Environment Variable Priority

The widget will use environment variables in this order:
1. Props passed to the component
2. Framework-specific environment variables (e.g., `REACT_APP_*`, `NEXT_PUBLIC_*`)
3. Universal environment variables (e.g., `NOTIFICATION_*`)
4. Default values

### Example Environment Files

#### Next.js (.env.local)
```
NEXT_PUBLIC_NOTIFICATION_BACKEND_URL=http://your-backend-url.com
NEXT_PUBLIC_NOTIFICATION_REDIS_URL=redis://your-redis-url.com:6379
NEXT_PUBLIC_ORG_NAME=your-organization
NEXT_PUBLIC_ORG_VKEY=your-verification-key
```

#### React App (.env)
```
REACT_APP_NOTIFICATION_BACKEND_URL=http://your-backend-url.com
REACT_APP_NOTIFICATION_REDIS_URL=redis://your-redis-url.com:6379
REACT_APP_ORG_NAME=your-organization
REACT_APP_ORG_VKEY=your-verification-key
```

#### Universal Environment Variables
```
NOTIFICATION_BACKEND_URL=http://your-backend-url.com
NOTIFICATION_REDIS_URL=redis://your-redis-url.com:6379
```

## Setup Requirements

### Backend Server

Make sure your Awesome Pacific backend server is running and has the following endpoint:

- `POST /verify-org` - Verifies organization credentials

### Redis Server

Ensure Redis is running and accessible. The widget will connect to Redis to subscribe to organization-specific channels.

## Examples

### Next.js App

```jsx
// pages/_app.js
import { NotificationWidget } from 'awesome-pacific-notification-client';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <NotificationWidget 
        orgName={process.env.NEXT_PUBLIC_ORG_NAME}
        vkey={process.env.NEXT_PUBLIC_ORG_VKEY}
        autoConnect={true}
        theme="dark"
      />
    </>
  );
}

export default MyApp;
```

### React App with Environment Variables

```jsx
// App.js
import { NotificationWidget } from 'awesome-pacific-notification-client';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>My Application</h1>
      </header>
      
      <NotificationWidget 
        orgName={process.env.REACT_APP_ORG_NAME}
        vkey={process.env.REACT_APP_ORG_VKEY}
        autoConnect={true}
        onMessage={(message) => {
          // Show toast notification
          toast.info(`New message from ${message.senderName}: ${message.content}`);
        }}
      />
    </div>
  );
}
```

## Troubleshooting

### Connection Issues

1. **Backend not reachable**: Ensure your backend server is running and the URL is correct
2. **Redis connection failed**: Check if Redis is running and the URL is accessible
3. **Invalid credentials**: Verify your organization name and verification key

### Common Errors

- `"Organization not verified"`: Call `verifyOrganization()` before `connect()`
- `"Network error"`: Check your backend URL and network connectivity
- `"Failed to connect to Redis"`: Verify Redis is running and accessible

## Development

To build the package locally:

```bash
cd frontend-package
npm install
npm run build
```

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please visit our [GitHub repository](https://github.com/awesome-pacific/notification-client).
