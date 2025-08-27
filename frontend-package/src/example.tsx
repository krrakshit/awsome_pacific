import React from 'react';
import { NotificationWidget } from './components/NotificationWidget';

// Example 1: Basic usage with auto-connect
export function BasicExample() {
  return (
    <div>
      <h1>My Application</h1>
      <p>This is a basic example of the notification widget.</p>
      
      <NotificationWidget 
        orgName="my-organization"
        vkey="your-verification-key"
        autoConnect={true}
        theme="light"
        position="bottom-right"
      />
    </div>
  );
}

// Example 2: Manual connection with callbacks
export function AdvancedExample() {
  return (
    <div>
      <h1>Advanced Example</h1>
      <p>This example shows manual connection with custom callbacks.</p>
      
      <NotificationWidget 
        autoConnect={false}
        theme="dark"
        position="top-left"
        maxMessages={5}
        onMessage={(message) => {
          console.log('New notification received:', message);
          // You could show a toast notification here
          // toast.info(`New message from ${message.senderName}: ${message.content}`);
        }}
        onConnect={() => {
          console.log('Successfully connected to notification service');
        }}
        onError={(error) => {
          console.error('Notification error:', error);
        }}
        onDisconnect={() => {
          console.log('Disconnected from notification service');
        }}
      />
    </div>
  );
}

// Example 3: Custom styling
export function CustomStylingExample() {
  return (
    <div>
      <h1>Custom Styling Example</h1>
      <p>This example shows custom styling and positioning.</p>
      
      <NotificationWidget 
        orgName="my-org"
        vkey="my-vkey"
        autoConnect={true}
        theme="light"
        position="bottom-left"
        className="my-custom-notification-widget"
        style={{
          zIndex: 10000,
          transform: 'scale(0.9)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
        showConnectionStatus={false}
        maxMessages={15}
      />
    </div>
  );
}

// Example 4: Next.js App integration
export function NextJSExample() {
  return (
    <>
      {/* Your Next.js app content */}
      <div>
        <h1>Next.js Application</h1>
        <p>This is how you would integrate the widget in a Next.js app.</p>
      </div>
      
      {/* Notification widget */}
      <NotificationWidget 
        orgName={process.env.NEXT_PUBLIC_ORG_NAME}
        vkey={process.env.NEXT_PUBLIC_ORG_VKEY}
        autoConnect={true}
        theme="dark"
        position="bottom-right"
        onMessage={(message) => {
          // In Next.js, you might want to use a toast library
          // or update some global state
          console.log('New notification:', message);
        }}
      />
    </>
  );
}

// Example 5: React App with environment variables
export function ReactAppExample() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>React Application</h1>
        <p>This is how you would integrate the widget in a React app.</p>
      </header>
      
      <NotificationWidget 
        orgName={process.env.REACT_APP_ORG_NAME}
        vkey={process.env.REACT_APP_ORG_VKEY}
        autoConnect={true}
        theme="light"
        position="top-right"
        maxMessages={10}
        onMessage={(message) => {
          // You could integrate with a toast notification library
          // or update your app's state
          console.log('New message:', message);
        }}
      />
    </div>
  );
}
