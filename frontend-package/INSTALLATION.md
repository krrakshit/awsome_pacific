# Installation Guide

## Quick Start

### 1. Install the Package

```bash
npm install awesome-pacific-notification-client
```

### 2. Basic Usage

```jsx
import { NotificationWidget } from 'awesome-pacific-notification-client';

function App() {
  return (
    <div>
      <h1>My Application</h1>
      
      <NotificationWidget 
        orgName="your-organization"
        vkey="your-verification-key"
        autoConnect={true}
      />
    </div>
  );
}
```

## Prerequisites

Before using this package, ensure you have:

1. **Backend Server Running**: Your Awesome Pacific backend server should be running and accessible
2. **Redis Server**: Redis should be running and accessible for real-time notifications
3. **Organization Credentials**: You need a valid organization name and verification key

## Environment Variables (Recommended)

For production use, it's recommended to use environment variables:

### Next.js (.env.local)
```
NEXT_PUBLIC_NOTIFICATION_BACKEND_URL=http://your-backend-url.com
NEXT_PUBLIC_NOTIFICATION_REDIS_URL=redis://your-redis-url.com:6379
NEXT_PUBLIC_ORG_NAME=your-organization
NEXT_PUBLIC_ORG_VKEY=your-verification-key
```

### React App (.env)
```
REACT_APP_NOTIFICATION_BACKEND_URL=http://your-backend-url.com
REACT_APP_NOTIFICATION_REDIS_URL=redis://your-redis-url.com:6379
REACT_APP_ORG_NAME=your-organization
REACT_APP_ORG_VKEY=your-verification-key
```

### Universal Environment Variables
```
NOTIFICATION_BACKEND_URL=http://your-backend-url.com
NOTIFICATION_REDIS_URL=redis://your-redis-url.com:6379
```

### Usage with Environment Variables

```jsx
<NotificationWidget 
  orgName={process.env.NEXT_PUBLIC_ORG_NAME}
  vkey={process.env.NEXT_PUBLIC_ORG_VKEY}
  autoConnect={true}
/>
```

## Getting Your Organization Credentials

1. **Create an Organization**: Use your Awesome Pacific dashboard to create an organization
2. **Get the VKey**: The verification key (vkey) is generated when you create the organization
3. **Test Connection**: Use the widget to test the connection with your credentials

## Troubleshooting

### Common Issues

1. **"Backend not reachable"**
   - Ensure your backend server is running
   - Check the backend URL is correct
   - Verify network connectivity

2. **"Redis connection failed"**
   - Ensure Redis is running
   - Check Redis URL configuration
   - Verify Redis is accessible from your application

3. **"Invalid organization credentials"**
   - Double-check organization name and vkey
   - Ensure the organization exists in your backend
   - Verify the credentials are correct

### Testing the Connection

You can test the connection by:

1. Opening your browser's developer console
2. Looking for connection status messages
3. Checking for any error messages
4. Verifying the widget shows "Connected" status

## Support

If you encounter any issues:

1. Check the [README.md](./README.md) for detailed documentation
2. Review the [examples](./src/example.tsx) for usage patterns
3. Ensure all prerequisites are met
4. Contact support if issues persist
