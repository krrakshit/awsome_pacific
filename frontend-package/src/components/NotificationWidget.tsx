import React, { useState, useEffect } from 'react';
import { useNotificationClient } from '../react-hook';
import type { NotificationMessage } from '../types';

export interface NotificationWidgetProps {
  backendUrl?: string; // Made optional since it can come from env vars
  redisUrl?: string;
  orgName?: string;
  vkey?: string;
  autoConnect?: boolean;
  theme?: 'light' | 'dark';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxMessages?: number;
  showConnectionStatus?: boolean;
  onMessage?: (message: NotificationMessage) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function NotificationWidget({
  backendUrl,
  redisUrl,
  orgName: initialOrgName,
  vkey: initialVkey,
  autoConnect = false,
  theme = 'light',
  position = 'bottom-right',
  maxMessages = 10,
  showConnectionStatus = true,
  onMessage,
  onError,
  onConnect,
  onDisconnect,
  className = '',
  style = {},
}: NotificationWidgetProps) {
  const [orgName, setOrgName] = useState(initialOrgName || '');
  const [vkey, setVkey] = useState(initialVkey || '');
  const [showForm, setShowForm] = useState(!initialOrgName || !initialVkey);
  const [isExpanded, setIsExpanded] = useState(false);

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
    backendUrl: backendUrl || process.env.NOTIFICATION_BACKEND_URL || process.env.REACT_APP_NOTIFICATION_BACKEND_URL || process.env.NEXT_PUBLIC_NOTIFICATION_BACKEND_URL,
    redisUrl: redisUrl || process.env.NOTIFICATION_REDIS_URL || process.env.REACT_APP_NOTIFICATION_REDIS_URL || process.env.NEXT_PUBLIC_NOTIFICATION_REDIS_URL,
    autoConnect,
    onMessage,
    onError,
    onConnect: () => {
      setShowForm(false);
      onConnect?.();
    },
    onDisconnect,
  });

  // Auto-connect if credentials are provided
  useEffect(() => {
    if (autoConnect && initialOrgName && initialVkey && !isConnected) {
      handleVerifyAndConnect(initialOrgName, initialVkey);
    }
  }, [autoConnect, initialOrgName, initialVkey, isConnected]);

  const handleVerifyAndConnect = async (name: string, key: string) => {
    if (!name || !key) {
      return;
    }

    const result = await verifyOrganization(name, key);
    if (result.success) {
      await connect(name);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setShowForm(true);
    setOrgName('');
    setVkey('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyAndConnect(orgName, vkey);
  };

  // Theme styles
  const themeStyles = {
    light: {
      background: '#ffffff',
      text: '#333333',
      border: '#e0e0e0',
      primary: '#007bff',
      success: '#28a745',
      error: '#dc3545',
      secondary: '#6c757d',
    },
    dark: {
      background: '#2d3748',
      text: '#ffffff',
      border: '#4a5568',
      primary: '#4299e1',
      success: '#48bb78',
      error: '#f56565',
      secondary: '#a0aec0',
    },
  };

  const currentTheme = themeStyles[theme];

  // Position styles
  const positionStyles = {
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
  };

  const widgetStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '14px',
    lineHeight: '1.4',
    ...positionStyles[position],
    ...style,
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: currentTheme.background,
    border: `1px solid ${currentTheme.border}`,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    minWidth: '300px',
    maxWidth: '400px',
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: currentTheme.primary,
    color: '#ffffff',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  };

  const contentStyle: React.CSSProperties = {
    padding: '16px',
    maxHeight: isExpanded ? '400px' : '0',
    overflow: 'hidden',
    transition: 'max-height 0.3s ease',
  };

  const formStyle: React.CSSProperties = {
    marginBottom: '16px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${currentTheme.border}`,
    borderRadius: '4px',
    backgroundColor: currentTheme.background,
    color: currentTheme.text,
    marginBottom: '8px',
    fontSize: '14px',
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: currentTheme.primary,
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '8px',
  };

  const messageStyle: React.CSSProperties = {
    border: `1px solid ${currentTheme.border}`,
    borderRadius: '4px',
    padding: '12px',
    marginBottom: '8px',
    backgroundColor: currentTheme.background,
  };

  const statusStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: currentTheme.secondary,
  };

  return (
    <div style={widgetStyle} className={`notification-widget ${className}`}>
      <div style={containerStyle}>
        <div 
          style={headerStyle}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔔 Notifications</span>
            {showConnectionStatus && (
              <div style={statusStyle}>
                <span style={{ 
                  color: isConnected ? currentTheme.success : currentTheme.error 
                }}>
                  ●
                </span>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            )}
          </div>
          <span>{isExpanded ? '−' : '+'}</span>
        </div>

        <div style={contentStyle}>
          {error && (
            <div style={{
              backgroundColor: `${currentTheme.error}20`,
              color: currentTheme.error,
              padding: '8px 12px',
              borderRadius: '4px',
              marginBottom: '12px',
              fontSize: '12px',
            }}>
              {error}
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} style={formStyle}>
              <input
                type="text"
                placeholder="Organization Name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                style={inputStyle}
                required
              />
              <input
                type="password"
                placeholder="Verification Key"
                value={vkey}
                onChange={(e) => setVkey(e.target.value)}
                style={inputStyle}
                required
              />
              <button
                type="submit"
                disabled={isVerifying}
                style={{
                  ...buttonStyle,
                  opacity: isVerifying ? 0.6 : 1,
                  cursor: isVerifying ? 'not-allowed' : 'pointer',
                }}
              >
                {isVerifying ? 'Verifying...' : 'Connect'}
              </button>
            </form>
          )}

          {isConnected && currentOrg && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                backgroundColor: `${currentTheme.success}20`,
                color: currentTheme.success,
                padding: '8px 12px',
                borderRadius: '4px',
                marginBottom: '8px',
                fontSize: '12px',
              }}>
                Connected to: {currentOrg.name}
              </div>
              <button
                onClick={handleDisconnect}
                style={{
                  ...buttonStyle,
                  backgroundColor: currentTheme.error,
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                Disconnect
              </button>
              <button
                onClick={clearMessages}
                style={{
                  ...buttonStyle,
                  backgroundColor: currentTheme.secondary,
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                Clear
              </button>
            </div>
          )}

          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}>
              <strong style={{ color: currentTheme.text }}>
                Messages ({messages.slice(0, maxMessages).length})
              </strong>
            </div>
            
            {messages.length === 0 ? (
              <div style={{
                color: currentTheme.secondary,
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '20px',
              }}>
                No messages yet
              </div>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {messages.slice(0, maxMessages).map((message) => (
                  <div key={message.id} style={messageStyle}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}>
                      <strong style={{ color: currentTheme.primary, fontSize: '12px' }}>
                        {message.senderName}
                      </strong>
                      <small style={{ color: currentTheme.secondary, fontSize: '10px' }}>
                        {new Date(message.sentTime).toLocaleTimeString()}
                      </small>
                    </div>
                    <div style={{ fontSize: '13px', color: currentTheme.text }}>
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
