import React, { useState } from 'react';
import { useNotificationClient } from './react-hook';

export function NotificationExample() {
  const [orgName, setOrgName] = useState('');
  const [vkey, setVkey] = useState('');
  const [showForm, setShowForm] = useState(true);

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
    onMessage: (message) => {
      console.log('New notification received:', message);
    },
    onError: (error) => {
      console.error('Notification error:', error);
    },
    onConnect: () => {
      console.log('Connected to notification service');
      setShowForm(false);
    },
    onDisconnect: () => {
      console.log('Disconnected from notification service');
      setShowForm(true);
    },
  });

  const handleVerifyAndConnect = async () => {
    if (!orgName || !vkey) {
      alert('Please enter both organization name and vkey');
      return;
    }

    const result = await verifyOrganization(orgName, vkey);
    if (result.success) {
      await connect(orgName);
    } else {
      alert(`Verification failed: ${result.error}`);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setOrgName('');
    setVkey('');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Awesome Pacific Notifications</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#fee', 
          color: '#c33', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          Error: {error}
        </div>
      )}

      {showForm && (
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <h3>Connect to Organization</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Organization Name:
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
              placeholder="Enter organization name"
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Verification Key:
            </label>
            <input
              type="password"
              value={vkey}
              onChange={(e) => setVkey(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
              placeholder="Enter verification key"
            />
          </div>
          <button
            onClick={handleVerifyAndConnect}
            disabled={isVerifying}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: isVerifying ? 'not-allowed' : 'pointer',
              opacity: isVerifying ? 0.6 : 1,
            }}
          >
            {isVerifying ? 'Verifying...' : 'Connect'}
          </button>
        </div>
      )}

      {isConnected && currentOrg && (
        <div style={{ 
          backgroundColor: '#e8f5e8', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <h3>✅ Connected Successfully</h3>
          <p><strong>Organization:</strong> {currentOrg.name}</p>
          <p><strong>Connected since:</strong> {new Date().toLocaleTimeString()}</p>
          <button
            onClick={handleDisconnect}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            Disconnect
          </button>
          <button
            onClick={clearMessages}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear Messages
          </button>
        </div>
      )}

      <div>
        <h3>Real-time Messages ({messages.length})</h3>
        {messages.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No messages received yet. Send a notification from your backend to see it here.
          </p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  border: '1px solid #ddd',
                  padding: '15px',
                  marginBottom: '10px',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '8px' 
                }}>
                  <strong style={{ color: '#007bff' }}>{message.senderName}</strong>
                  <small style={{ color: '#666' }}>
                    {new Date(message.sentTime).toLocaleString()}
                  </small>
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                  {message.content}
                </div>
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '12px', 
                  color: '#666' 
                }}>
                  Organization: {message.orgName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
