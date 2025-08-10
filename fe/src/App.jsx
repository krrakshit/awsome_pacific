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
    <div className="max-w-6xl mx-auto p-5 min-h-screen bg-space-950">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 p-6 bg-gradient-primary text-white rounded-2xl shadow-2xl shadow-black/50 border border-white/10 backdrop-blur-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-4 md:mb-0">
          Organization Notification System
        </h1>
        <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
          <span className="text-sm font-semibold">
            Status: <span className={isConnected ? 'status-connected' : 'status-disconnected'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </span>
        </div>
      </header>

      {/* Status Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Create Organization Section */}
        <section className="card relative">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-2xl"></div>
          <h2 className="text-xl font-bold text-gradient mb-6 pb-3 border-b border-space-700">
            Create New Organization
          </h2>
          <div className="space-y-5">
            <input
              type="text"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              onKeyDown={handleOrgNameKeyPress}
              placeholder="Enter organization name"
              disabled={!isConnected || isCreatingOrg}
              className="input-field"
            />
            <button
              onClick={createOrganization}
              disabled={!isConnected || isCreatingOrg || !newOrgName.trim()}
              className={`btn-primary w-full ${isCreatingOrg ? 'btn-loading' : ''}`}
            >
              {isCreatingOrg ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </section>

        {/* Send Notification Section */}
        <section className="card relative">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-t-2xl"></div>
          <h2 className="text-xl font-bold text-gradient mb-6 pb-3 border-b border-space-700">
            Send Notification
          </h2>
          <div className="space-y-5">
            <div>
              <label htmlFor="org-select" className="block text-sm font-semibold text-slate-300 mb-2">
                Select Organization:
              </label>
              <select
                id="org-select"
                value={selectedOrg}
                onChange={(e) => handleOrgChange(e.target.value)}
                disabled={!isConnected || organizations.length === 0}
                className="input-field"
              >
                <option value="">-- Select Organization --</option>
                {organizations.map((org) => (
                  <option key={org} value={org} className="bg-space-800 text-slate-200">
                    {org}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message-input" className="block text-sm font-semibold text-slate-300 mb-2">
                Notification Message:
              </label>
              <textarea
                id="message-input"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                onKeyDown={handleMessageKeyPress}
                placeholder="Enter your notification message (Ctrl+Enter to send)"
                rows="4"
                disabled={!isConnected || !selectedOrg}
                className="input-field resize-none"
              />
            </div>

            <button
              onClick={sendNotification}
              disabled={!isConnected || !selectedOrg || !notificationMessage.trim()}
              className="btn-success w-full"
            >
              Send Notification
            </button>
          </div>
        </section>
      </div>

      {/* Messages Section */}
      <section className="card">
        <h2 className="text-xl font-bold text-gradient mb-6 pb-3 border-b border-space-700">
          Notifications {selectedOrg && <span className="text-primary-400">({selectedOrg})</span>}
        </h2>
        <div className="max-h-96 overflow-y-auto scrollbar-thin bg-space-800/30 rounded-xl p-5 border border-space-700">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 opacity-20">📢</div>
              <p className="text-slate-400 text-lg font-medium">
                No notifications yet. Select an organization and send a message!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages
                .filter(msg => !selectedOrg || msg.orgid === selectedOrg)
                .map((msg) => (
                  <div key={msg.id} className="message-card">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
                      <span className="inline-flex items-center px-3 py-1 bg-gradient-primary text-white text-sm font-semibold rounded-full shadow-lg">
                        {msg.orgid}
                      </span>
                      <span className="text-slate-400 text-sm font-medium">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-slate-200 leading-relaxed">
                      {typeof msg.content === 'object' ? msg.content.message : msg.content}
                    </div>
                  </div>
                ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </section>
    </div>
  )
}

export default App
