markdown# Awesome Pacific

A real-time notification system built with React, enabling organizations to send and receive notifications through WebSockets and Redis pub/sub channels.

![GitHub](https://img.shields.io/github/license/krrakshit/awsome_pacific)

## 🚀 Overview

Awesome Pacific is a comprehensive notification system that allows organizations to:
- Create and manage unique organization profiles
- Send real-time notifications to organization members
- Display notifications in a customizable widget that can be integrated into any React/Next.js application
- Securely verify organization credentials

## ✨ Key Features

- **Organization Management**: Create and manage unique organizations with Redis-based validation
- **Real-time Communication**: Instant message delivery using WebSockets and Redis pub/sub
- **Flexible Integration**: Notification widget that can be dropped into any React/Next.js app
- **Customizable UI**: Light/dark themes, flexible positioning, and responsive design
- **Secure Authentication**: Organization verification before connection is established
- **Developer-friendly**: Simple API with hooks for custom integration

## 🏗️ Architecture

The project consists of three main components:

### 1. Backend (WebSocket Server)
- Node.js WebSocket server with TypeScript
- Redis integration for pub/sub messaging
- Organization verification endpoint

### 2. Frontend Client
- React/Next.js notification widget
- Real-time WebSocket connection
- Customizable UI components

### 3. Redis Database
- Organization storage
- Pub/sub messaging system
- Real-time data synchronization

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- Redis server
- npm or yarn package manager

### Backend Setup

1. Navigate to the WebSocket server directory:
   ```bash
   cd ws
   ```

2. Install dependencies:
   ```bash
   npm install
   npm install -D typescript
   ```

3. Build the TypeScript code:
   ```bash
   npm run build
   ```

4. Start the WebSocket server:
   ```bash
   npm start
   ```

   Or for development with auto-rebuild:
   ```bash
   npm run dev
   ```

The WebSocket server will start on `ws://localhost:8080`

### Frontend Setup

For the example React app:

1. Navigate to the frontend directory:
   ```bash
   cd fe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The example app will be available at `http://localhost:5173`

## 📦 Using the Notification Widget in Your Project

### Installation

Install the notification widget package:
```bash
npm install awesome-pacific-notification-client
```

### Basic Implementation

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

## 🔧 Configuration

The notification widget can be configured through props or environment variables:

### Widget Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backendUrl` | string | From env vars | URL of your Awesome Pacific backend server |
| `redisUrl` | string | From env vars | Redis connection URL |
| `orgName` | string | - | Organization name (for auto-connect) |
| `vkey` | string | - | Organization verification key (for auto-connect) |
| `autoConnect` | boolean | false | Automatically connect if orgName and vkey are provided |
| `theme` | 'light' \| 'dark' | 'light' | Widget theme |
| `position` | 'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left' | 'bottom-right' | Widget position on screen |
| `maxMessages` | number | 10 | Maximum number of messages to display |
| `showConnectionStatus` | boolean | true | Show connection status indicator |
| `onMessage` | (message: NotificationMessage) => void | - | Callback when new message is received |
| `onError` | (error: Error) => void | - | Callback when error occurs |
| `onConnect` | () => void | - | Callback when successfully connected |
| `onDisconnect` | () => void | - | Callback when disconnected |

### Environment Variables

```bash
# Next.js
NEXT_PUBLIC_NOTIFICATION_BACKEND_URL=http://your-backend-url.com
NEXT_PUBLIC_NOTIFICATION_REDIS_URL=redis://your-redis-url.com:6379
NEXT_PUBLIC_ORG_NAME=your-organization
NEXT_PUBLIC_ORG_VKEY=your-verification-key

# React
REACT_APP_NOTIFICATION_BACKEND_URL=http://your-backend-url.com
REACT_APP_NOTIFICATION_REDIS_URL=redis://your-redis-url.com:6379
REACT_APP_ORG_NAME=your-organization
REACT_APP_ORG_VKEY=your-verification-key
```

## 🚦 API Reference

### WebSocket Message Types

#### Create Organization
```json
{
  "type": "create_org",
  "orgName": "MyOrganization"
}
```

#### List Organizations
```json
{
  "type": "list_orgs"
}
```

#### Subscribe to Organization
```json
{
  "type": "subscribe",
  "orgid": "MyOrganization"
}
```

#### Publish Message
```json
{
  "type": "publish",
  "orgid": "MyOrganization",
  "content": {
    "message": "Hello World!",
    "sender": "User"
  }
}
```

### Message Format

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

## 🧩 Advanced Usage

### Using the Hook

For more control over the notification system, use the provided hook:

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

## 🔗 Integration Examples

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

## 🔍 Troubleshooting

### Common Issues

**Backend not reachable**
- Ensure your backend server is running
- Check the backend URL is correct
- Verify network connectivity

**Redis connection failed**
- Ensure Redis is running
- Check Redis URL configuration
- Verify Redis is accessible from your application

**Invalid organization credentials**
- Double-check organization name and vkey
- Ensure the organization exists in your backend

### Error Messages

- `"Organization not verified"`: Call `verifyOrganization()` before `connect()`
- `"Network error"`: Check your backend URL and network connectivity
- `"Failed to connect to Redis"`: Verify Redis is running and accessible

## 📊 Performance Considerations

- **Message Throttling**: For high-traffic applications, consider implementing throttling mechanisms
- **Redis Optimization**: Use Redis connection pooling for better performance
- **WebSocket Connection**: Implement reconnection strategies for reliable connections
- **Message Caching**: Cache recent messages to reduce load on Redis

## 📁 Project Structure

```
awsome_pacific/
├── fe/                 # Example React frontend
│   ├── src/
│   │   └── ...
│   └── package.json
├── ws/                 # WebSocket server
│   ├── src/
│   │   └── index.ts   # WebSocket server with Redis
│   ├── dist/          # Compiled JavaScript
│   └── package.json
├── frontend-package/   # Notification widget package
│   ├── src/
│   │   └── ...
│   └── package.json
└── README.md
```

## 🧪 Testing

Run the test suite:

```bash
# WebSocket server tests
cd ws
npm test

# Frontend package tests
cd frontend-package
npm test
```

## 🔄 Deployment

### WebSocket Server

We recommend deploying the WebSocket server using Docker:

```bash
# Build the Docker image
docker build -t awesome-pacific-ws ./ws

# Run the Docker container
docker run -p 8080:8080 -e REDIS_URL=redis://your-redis-url:6379 awesome-pacific-ws
```

### Redis Setup

For production, we recommend using a managed Redis service like Redis Labs, AWS ElastiCache, or similar offerings.

## 🛣️ Roadmap

- [ ] Mobile app integration (React Native)
- [ ] End-to-end encryption for messages
- [ ] Message persistence with MongoDB
- [ ] User authentication and profiles
- [ ] Rich media messages (images, files)
- [ ] Message reactions and threads
- [ ] Notification sound customization
- [ ] Advanced filtering options

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## 🙏 Acknowledgments

- Socket.IO for WebSocket inspiration
- Redis for the pub/sub messaging system
- React for the frontend library
- All the contributors who have helped shape this project

## 📄 License

MIT License - see LICENSE file for details.

## 📞 Contact & Support

For issues and questions, please open an issue in this repository or contact the maintainer at your-email@example.com.

---

Made with ❤️ by the Awesome Pacific team
