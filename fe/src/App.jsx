import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [organizations, setOrganizations] = useState([])
  const [selectedOrg, setSelectedOrg] = useState('')
  const [newOrgName, setNewOrgName] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isCreatingOrg, setIsCreatingOrg] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const messagesEndRef = useRef(null)

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080')

    ws.onopen = () => {
      console.log('Connected to WebSocket server')
      setIsConnected(true)
      setSocket(ws)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('Received message:', data)

        if (data.type === 'error') {
          setError(data.message)
          setTimeout(() => setError(''), 5000)
        } else if (data.type === 'success') {
          setSuccess(data.message)
          setTimeout(() => setSuccess(''), 3000)

          // If organization was created successfully, add it to the list
          if (data.message.includes('created successfully')) {
            const orgName = data.message.match(/"([^"]+)"/)?.[1]
            if (orgName && !organizations.includes(orgName)) {
              setOrganizations(prev => [...prev, orgName])
              setSelectedOrg(orgName)
            }
          }
        } else if (data.type === 'message') {
          setMessages(prev => [...prev, {
            id: Date.now(),
            orgid: data.orgid,
            content: data.content,
            timestamp: data.timestamp || new Date().toISOString()
          }])
        } else if (data.type === 'org_list') {
          setOrganizations(data.organizations || [])
        }
      } catch (err) {
        console.error('Error parsing message:', err)
      }
    }

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server')
      setIsConnected(false)
      setSocket(null)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setError('WebSocket connection error')
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load organizations on connection
  useEffect(() => {
    if (socket && isConnected) {
      // Request list of organizations
      const message = {
        type: 'list_orgs'
      }
      socket.send(JSON.stringify(message))
    }
  }, [socket, isConnected])

  // Create new organization
  const createOrganization = async () => {
    if (!socket || !newOrgName.trim()) {
      setError('Please enter an organization name')
      return
    }

    setIsCreatingOrg(true)
    setError('')

    try {
      const message = {
        type: 'create_org',
        orgName: newOrgName.trim()
      }

      socket.send(JSON.stringify(message))
      setNewOrgName('')

      // Reset creating state after a delay
      setTimeout(() => {
        setIsCreatingOrg(false)
      }, 2000)

    } catch (err) {
      console.error('Error creating organization:', err)
      setError('Failed to create organization')
      setIsCreatingOrg(false)
    }
  }

  // Subscribe to organization
  const subscribeToOrg = (orgid) => {
    if (!socket || !orgid) return

    const message = {
      orgid: orgid,
      type: 'subscribe'
    }

    socket.send(JSON.stringify(message))
  }

  // Send notification
  const sendNotification = () => {
    if (!socket || !selectedOrg || !notificationMessage.trim()) {
      setError('Please select an organization and enter a message')
      return
    }

    const message = {
      orgid: selectedOrg,
      type: 'publish',
      content: {
        message: notificationMessage.trim(),
        sender: 'User',
        timestamp: new Date().toISOString()
      }
    }

    socket.send(JSON.stringify(message))
    setNotificationMessage('')
  }

  // Handle organization selection change
  const handleOrgChange = (orgid) => {
    setSelectedOrg(orgid)
    if (orgid) {
      subscribeToOrg(orgid)
      // Clear messages when switching organizations
      setMessages([])
    }
  }

  // Handle Enter key press for creating organization
  const handleOrgNameKeyPress = (e) => {
    if (e.key === 'Enter' && !isCreatingOrg && newOrgName.trim()) {
      createOrganization()
    }
  }

  // Handle Enter key press for sending notification
  const handleMessageKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey && selectedOrg && notificationMessage.trim()) {
      sendNotification()
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Organization Notification System</h1>
        <div className="connection-status">
          Status: <span className={isConnected ? 'connected' : 'disconnected'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="main-content">
        {/* Create Organization Section */}
        <section className="create-org-section">
          <h2>Create New Organization</h2>
          <div className="create-org-form">
            <input
              type="text"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              onKeyDown={handleOrgNameKeyPress}
              placeholder="Enter organization name"
              disabled={!isConnected || isCreatingOrg}
            />
            <button
              onClick={createOrganization}
              disabled={!isConnected || isCreatingOrg || !newOrgName.trim()}
              className={isCreatingOrg ? 'loading' : ''}
            >
              {isCreatingOrg ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </section>

        {/* Send Notification Section */}
        <section className="notification-section">
          <h2>Send Notification</h2>
          <div className="notification-form">
            <div className="form-group">
              <label htmlFor="org-select">Select Organization:</label>
              <select
                id="org-select"
                value={selectedOrg}
                onChange={(e) => handleOrgChange(e.target.value)}
                disabled={!isConnected || organizations.length === 0}
              >
                <option value="">-- Select Organization --</option>
                {organizations.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message-input">Notification Message:</label>
              <textarea
                id="message-input"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                onKeyDown={handleMessageKeyPress}
                placeholder="Enter your notification message (Ctrl+Enter to send)"
                rows="3"
                disabled={!isConnected || !selectedOrg}
              />
            </div>

            <button
              onClick={sendNotification}
              disabled={!isConnected || !selectedOrg || !notificationMessage.trim()}
              className="send-button"
            >
              Send Notification
            </button>
          </div>
        </section>

        {/* Messages Section */}
        <section className="messages-section">
          <h2>Notifications ({selectedOrg || 'No organization selected'})</h2>
          <div className="messages-container">
            {messages.length === 0 ? (
              <p className="no-messages">No notifications yet. Select an organization and send a message!</p>
            ) : (
              messages
                .filter(msg => !selectedOrg || msg.orgid === selectedOrg)
                .map((msg) => (
                  <div key={msg.id} className="message">
                    <div className="message-header">
                      <span className="org-badge">{msg.orgid}</span>
                      <span className="timestamp">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="message-content">
                      {typeof msg.content === 'object' ? msg.content.message : msg.content}
                    </div>
                  </div>
                ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
