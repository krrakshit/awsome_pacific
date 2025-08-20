"use client"
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Organization {
  id: string;
  name: string;
  vkey: string; // Add this field
  createdAt: string; // Add this field too
}

export default function Dashboard() {
  const [orgname, setOrgname] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // New states for organizations and notifications
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [notificationContent, setNotificationContent] = useState("");
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // WebSocket connection
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        wsRef.current = new WebSocket('ws://localhost:8080');
        
        wsRef.current.onopen = () => {
          console.log('Connected to WebSocket server');
          setWsConnected(true);
        };
        
        wsRef.current.onmessage = (event) => {
          const response = JSON.parse(event.data);
          console.log('WebSocket response:', response);
        };
        
        wsRef.current.onclose = () => {
          console.log('WebSocket connection closed');
          setWsConnected(false);
          // Reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
        
        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setWsConnected(false);
        };
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setWsConnected(false);
        // Retry connection after 3 seconds
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Fetch user's organizations on component mount
  useEffect(() => {
    fetchOrganizations();
  }, []);

  async function fetchOrganizations() {
    try {
      const result = await api.get("/user/organizations");
      setOrganizations(result);
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    }
  }

  async function addOrg(orgname: string) {
    if (!orgname.trim()) {
      setMessage("Please enter an organization name");
      return;
    }

    setLoading(true);
    setMessage("");
    
    try {
      const result = await api.post("/org", { name: orgname });
      
      // Create publisher via WebSocket for the new organization
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const publisherMessage = {
          orgName: orgname,
          type: "publish",
          content: { action: "create_publisher", orgName: orgname }
        };
        wsRef.current.send(JSON.stringify(publisherMessage));
        console.log('Publisher creation message sent for org:', orgname);
      } else {
        console.warn('WebSocket not connected, publisher not created');
      }
      
      setMessage(`Organization "${orgname}" created successfully!`);
      setOrgname(""); // Clear the input
      
      // Refresh organizations list
      await fetchOrganizations();
      
      console.log("Organization created:", result);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Failed to create organization'}`);
      console.error("Failed to create org:", error);
    } finally {
      setLoading(false);
    }
  }

  async function sendNotification() {
    if (!selectedOrg) {
      setNotificationMessage("Please select an organization");
      return;
    }

    if (!notificationContent.trim()) {
      setNotificationMessage("Please enter notification content");
      return;
    }

    setNotificationLoading(true);
    setNotificationMessage("");
    
    try {
      const result = await api.post("/notifications", { 
        orgId: selectedOrg,
        content: notificationContent 
      });

      // Find the selected organization name
      const selectedOrgData = organizations.find(org => org.id === selectedOrg);
      const orgName = selectedOrgData?.name;

      // Send notification via WebSocket
      if (orgName && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const notificationMessage = {
          orgName: orgName,
          type: "publish",
          content: {
            notification: notificationContent,
            timestamp: new Date().toISOString(),
            orgId: selectedOrg,
            notificationId: result.id
          }
        };
        wsRef.current.send(JSON.stringify(notificationMessage));
        console.log('Notification sent via WebSocket to org:', orgName);
      } else {
        console.warn('WebSocket not connected or org name not found');
      }

      setNotificationMessage("Notification sent successfully!");
      setNotificationContent(""); // Clear the input
      console.log("Notification sent:", result);
    } catch (error) {
      setNotificationMessage(`Error: ${error instanceof Error ? error.message : 'Failed to send notification'}`);
      console.error("Failed to send notification:", error);
    } finally {
      setNotificationLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-black text-emerald-100 p-6">
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-900/20 via-emerald-950/10 to-teal-900/20 pointer-events-none" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-emerald-100">Dashboard</h1>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-emerald-300">
                {wsConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
              </span>
            </div>
          </div>
          <p className="text-emerald-200">Manage your organizations and send notifications</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Organization Card */}
          <Card className="bg-black/70 border-emerald-700/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-emerald-100">Create Organization</CardTitle>
              <CardDescription className="text-emerald-200">
                Add a new organization to manage notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="Enter organization name"
                value={orgname}
                onChange={e => setOrgname(e.target.value)}
                className="bg-emerald-950/30 border-emerald-600 text-emerald-100 placeholder:text-emerald-400"
                disabled={loading}
              />
              <Button
                onClick={() => addOrg(orgname)}
                disabled={loading || !orgname.trim()}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-black"
              >
                {loading ? "Creating..." : "Create Organization"}
              </Button>
              
              {message && (
                <div className={`p-3 rounded-lg border ${
                  message.includes('Error') 
                    ? 'bg-red-950/30 border-red-600/30 text-red-400' 
                    : 'bg-green-950/30 border-green-600/30 text-green-400'
                }`}>
                  {message}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Send Notification Card */}
          <Card className="bg-black/70 border-emerald-700/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-emerald-100">Send Notification</CardTitle>
              <CardDescription className="text-emerald-200">
                Send notifications to your organization members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-emerald-300 mb-2 block">Select Organization</label>
                <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                  <SelectTrigger className="bg-emerald-950/30 border-emerald-600 text-emerald-100">
                    <SelectValue placeholder="Choose an organization" />
                  </SelectTrigger>
                  <SelectContent className="bg-emerald-950 border-emerald-600">
                    {organizations.map((org) => (
                      <SelectItem 
                        key={org.id} 
                        value={org.id}
                        className="text-emerald-100 focus:bg-emerald-800"
                      >
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-emerald-300 mb-2 block">Notification Content</label>
                <Textarea
                  placeholder="Enter your notification message..."
                  value={notificationContent}
                  onChange={e => setNotificationContent(e.target.value)}
                  className="bg-emerald-950/30 border-emerald-600 text-emerald-100 placeholder:text-emerald-400 min-h-[100px]"
                  disabled={notificationLoading}
                />
              </div>

              <Button
                onClick={sendNotification}
                disabled={notificationLoading || !selectedOrg || !notificationContent.trim()}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-black"
              >
                {notificationLoading ? "Sending..." : "Send Notification"}
              </Button>
              
              {notificationMessage && (
                <div className={`p-3 rounded-lg border ${
                  notificationMessage.includes('Error') 
                    ? 'bg-red-950/30 border-red-600/30 text-red-400' 
                    : 'bg-green-950/30 border-green-600/30 text-green-400'
                }`}>
                  {notificationMessage}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Organizations List */}
        {organizations.length > 0 && (
          <Card className="bg-black/70 border-emerald-700/30 backdrop-blur-sm mt-6">
            <CardHeader>
              <CardTitle className="text-emerald-100">Your Organizations</CardTitle>
              <CardDescription className="text-emerald-200">
                Organizations you have created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizations.map((org, index) => (
                  <div key={org.id}>
                    <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-600/20">
                      <h3 className="font-semibold text-emerald-100">{org.name}</h3>
                      <p className="text-sm text-emerald-300">ID: {org.id}</p>
                      <p className="text-sm text-emerald-300">
                        <span className="font-medium text-emerald-200">vKey:</span> 
                        <span className="font-mono bg-emerald-950/50 px-2 py-1 rounded ml-2">{org.vkey}</span>
                      </p>
                      <p className="text-xs text-emerald-400 mt-2">
                        Created: {new Date(org.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {index < organizations.length - 1 && (
                      <Separator className="bg-emerald-600/30 my-4 md:hidden" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}