# Organization Notification System

A real-time notification system built with React frontend and WebSocket backend using Redis pub/sub.

## Features

- **Create Organizations**: Create unique organizations with Redis-based name validation
- **Real-time Notifications**: Send and receive notifications in real-time using WebSockets
- **Organization Selection**: Dropdown to select which organization to send notifications to
- **Message History**: View all notifications with timestamps and organization badges
- **Connection Status**: Visual indicator of WebSocket connection status

## Architecture

- **Frontend**: React with WebSocket client
- **Backend**: Node.js WebSocket server with TypeScript
- **Database**: Redis for organization storage and pub/sub messaging

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Redis server running on localhost:6379
- npm or yarn package manager

### Backend Setup (WebSocket Server)

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

### Frontend Setup (React App)

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

The React app will be available at `http://localhost:5173`

### Redis Setup

Make sure Redis is running on your local machine:

```bash
# On Windows (if using Redis for Windows)
redis-server

# On macOS (using Homebrew)
brew services start redis

# On Linux
sudo systemctl start redis
```

## Usage

1. **Start Redis server** (must be running first)
2. **Start the WebSocket server** (`cd ws && npm start`)
3. **Start the React frontend** (`cd fe && npm run dev`)
4. **Open your browser** to `http://localhost:5173`

### Creating Organizations

1. Enter an organization name in the "Create New Organization" section
2. Click "Create Organization"
3. The system will check Redis to ensure the name is unique
4. If successful, the organization will be added to the dropdown

### Sending Notifications

1. Select an organization from the dropdown
2. Enter your notification message
3. Click "Send Notification"
4. The message will be published to the Redis pub/sub channel for that organization

### Receiving Notifications

- Once you select an organization, you'll automatically subscribe to its notifications
- All messages sent to that organization will appear in the messages section
- Messages show the organization name, timestamp, and content

## WebSocket API

### Message Types

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

### Response Types

#### Success Response
```json
{
  "type": "success",
  "message": "Organization created successfully"
}
```

#### Error Response
```json
{
  "type": "error",
  "message": "Organization already exists"
}
```

#### Message Response
```json
{
  "type": "message",
  "orgid": "MyOrganization",
  "content": {...},
  "timestamp": "2025-01-10T..."
}
```

#### Organization List Response
```json
{
  "type": "org_list",
  "organizations": ["org1", "org2", "org3"]
}
```

## Technologies Used

- **Frontend**: React 19, Vite, CSS3
- **Backend**: Node.js, TypeScript, WebSocket (ws library)
- **Database**: Redis (for organization storage and pub/sub)
- **Real-time Communication**: WebSockets with Redis pub/sub

## File Structure

```
notification/
├── fe/                 # React frontend
│   ├── src/
│   │   ├── App.jsx    # Main React component
│   │   ├── App.css    # Styles
│   │   └── main.jsx   # React entry point
│   └── package.json
├── ws/                 # WebSocket server
│   ├── src/
│   │   └── index.ts   # WebSocket server with Redis
│   ├── dist/          # Compiled JavaScript
│   └── package.json
└── README.md
```
