"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  Plus,
  Send,
  Users,
  Settings,
  Building2,
  MessageSquare,
  TrendingUp,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Eye,
} from "lucide-react"

export default function Dashboard() {
  const [organizations, setOrganizations] = useState([
    { id: 1, name: "TechCorp Inc", members: 45, notifications: 23, plan: "Premium" },
    { id: 2, name: "StartupXYZ", members: 12, notifications: 8, plan: "Free" },
  ])

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "System Maintenance",
      message: "Scheduled maintenance tonight",
      org: "TechCorp Inc",
      status: "sent",
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "New Feature Release",
      message: "Check out our latest updates",
      org: "StartupXYZ",
      status: "pending",
      time: "5 hours ago",
    },
    {
      id: 3,
      title: "Security Alert",
      message: "Please update your password",
      org: "TechCorp Inc",
      status: "delivered",
      time: "1 day ago",
    },
  ])

  const [newOrg, setNewOrg] = useState({ name: "", description: "" })
  const [newNotification, setNewNotification] = useState({ title: "", message: "", organization: "" })

  const addOrganization = () => {
    if (newOrg.name) {
      setOrganizations([
        ...organizations,
        {
          id: Date.now(),
          name: newOrg.name,
          members: 0,
          notifications: 0,
          plan: "Free",
        },
      ])
      setNewOrg({ name: "", description: "" })
    }
  }

  const sendNotification = () => {
    if (newNotification.title && newNotification.message && newNotification.organization) {
      setNotifications([
        {
          id: Date.now(),
          title: newNotification.title,
          message: newNotification.message,
          org: newNotification.organization,
          status: "sent",
          time: "Just now",
        },
        ...notifications,
      ])
      setNewNotification({ title: "", message: "", organization: "" })
    }
  }

  return (
    <div className="min-h-screen bg-black text-emerald-100">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-900/20 via-emerald-950/10 to-teal-900/20 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-emerald-800/30 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-emerald-100">NotifyHub</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 ml-2">Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-emerald-300 hover:text-emerald-100 hover:bg-black/50">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback className="bg-emerald-500 text-black">JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/70 border-emerald-700/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-200">Total Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-100">{organizations.length}</div>
              <p className="text-xs text-emerald-300">+1 from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-black/70 border-emerald-700/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-200">Notifications Sent</CardTitle>
              <MessageSquare className="h-4 w-4 text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-100">
                {organizations.reduce((sum, org) => sum + org.notifications, 0)}
              </div>
              <p className="text-xs text-emerald-300">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-black/70 border-emerald-700/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-200">Delivery Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-100">98.5%</div>
              <p className="text-xs text-emerald-300">+0.3% from last week</p>
            </CardContent>
          </Card>

          <Card className="bg-black/70 border-emerald-700/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-200">Active Members</CardTitle>
              <Users className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-100">
                {organizations.reduce((sum, org) => sum + org.members, 0)}
              </div>
              <p className="text-xs text-emerald-300">+5 new this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="organizations" className="space-y-6">
          <TabsList className="bg-black/50 border border-emerald-700/30">
            <TabsTrigger
              value="organizations"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-100"
            >
              Organizations
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-100"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-100"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-emerald-100">Your Organizations</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Organization
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-emerald-700/30">
                  <DialogHeader>
                    <DialogTitle className="text-emerald-100">Create New Organization</DialogTitle>
                    <DialogDescription className="text-emerald-200">
                      Add a new organization to manage notifications and team members.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="org-name" className="text-emerald-200">
                        Organization Name
                      </Label>
                      <Input
                        id="org-name"
                        value={newOrg.name}
                        onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                        className="bg-black/50 border-emerald-700/30 text-emerald-100"
                        placeholder="Enter organization name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="org-desc" className="text-emerald-200">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="org-desc"
                        value={newOrg.description}
                        onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                        className="bg-black/50 border-emerald-700/30 text-emerald-100"
                        placeholder="Brief description of your organization"
                      />
                    </div>
                    <Button
                      onClick={addOrganization}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-black"
                    >
                      Create Organization
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org) => (
                <Card
                  key={org.id}
                  className="bg-black/70 border-emerald-700/30 hover:bg-black/90 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-emerald-100">{org.name}</CardTitle>
                      <Badge
                        className={
                          org.plan === "Premium"
                            ? "bg-gradient-to-r from-emerald-500/20 to-teal-600/20 text-emerald-400 border-emerald-500/30"
                            : "bg-emerald-500/10 text-emerald-300 border-emerald-600/20"
                        }
                      >
                        {org.plan}
                      </Badge>
                    </div>
                    <CardDescription className="text-emerald-200">
                      Manage notifications and team members
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-emerald-300">Members</span>
                        <span className="text-emerald-100">{org.members}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-emerald-300">Notifications</span>
                        <span className="text-emerald-100">{org.notifications}</span>
                      </div>
                      <Separator className="bg-emerald-600/30" />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-emerald-600/30 text-emerald-300 hover:bg-black hover:text-emerald-100 bg-transparent"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-600/30 text-emerald-300 hover:bg-black hover:text-emerald-100 bg-transparent"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-600/30 text-emerald-300 hover:bg-black hover:text-emerald-100 bg-transparent"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-emerald-100">Send Notifications</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-black">
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-emerald-700/30">
                  <DialogHeader>
                    <DialogTitle className="text-emerald-100">Send New Notification</DialogTitle>
                    <DialogDescription className="text-emerald-200">
                      Create and send a notification to your organization members.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notif-org" className="text-emerald-200">
                        Organization
                      </Label>
                      <Select
                        value={newNotification.organization}
                        onValueChange={(value) => setNewNotification({ ...newNotification, organization: value })}
                      >
                        <SelectTrigger className="bg-black/50 border-emerald-700/30 text-emerald-100">
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-emerald-700/30">
                          {organizations.map((org) => (
                            <SelectItem
                              key={org.id}
                              value={org.name}
                              className="text-emerald-100 focus:bg-emerald-500/20"
                            >
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notif-title" className="text-emerald-200">
                        Title
                      </Label>
                      <Input
                        id="notif-title"
                        value={newNotification.title}
                        onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                        className="bg-black/50 border-emerald-700/30 text-emerald-100"
                        placeholder="Notification title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notif-message" className="text-emerald-200">
                        Message
                      </Label>
                      <Textarea
                        id="notif-message"
                        value={newNotification.message}
                        onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                        className="bg-black/50 border-emerald-700/30 text-emerald-100"
                        placeholder="Your notification message"
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={sendNotification}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-black"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Notification
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Recent Notifications */}
            <Card className="bg-black/70 border-emerald-700/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-emerald-100">Recent Notifications</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-600/30 text-emerald-300 hover:bg-black hover:text-emerald-100 bg-transparent"
                    >
                      <Filter className="w-3 h-3 mr-1" />
                      Filter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-600/30 text-emerald-300 hover:bg-black hover:text-emerald-100 bg-transparent"
                    >
                      <Search className="w-3 h-3 mr-1" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-emerald-700/20"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            notification.status === "sent"
                              ? "bg-blue-400"
                              : notification.status === "delivered"
                                ? "bg-green-400"
                                : "bg-yellow-400"
                          }`}
                        />
                        <div>
                          <h4 className="font-medium text-emerald-100">{notification.title}</h4>
                          <p className="text-sm text-emerald-200">{notification.message}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-600/20 text-xs">
                              {notification.org}
                            </Badge>
                            <span className="text-xs text-emerald-300">{notification.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={`${
                            notification.status === "sent"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : notification.status === "delivered"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}
                        >
                          {notification.status}
                        </Badge>
                        <Button size="sm" variant="ghost" className="text-emerald-300 hover:text-emerald-100">
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-100">Analytics & Insights</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/70 border-emerald-700/30">
                <CardHeader>
                  <CardTitle className="text-emerald-100">Delivery Performance</CardTitle>
                  <CardDescription className="text-emerald-200">Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-200">Delivered</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-emerald-700/30 rounded-full overflow-hidden">
                          <div className="w-4/5 h-full bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                        </div>
                        <span className="text-emerald-100">85%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-200">Opened</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-emerald-700/30 rounded-full overflow-hidden">
                          <div className="w-3/5 h-full bg-gradient-to-r from-teal-500 to-emerald-600"></div>
                        </div>
                        <span className="text-emerald-100">62%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-200">Clicked</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-emerald-700/30 rounded-full overflow-hidden">
                          <div className="w-2/5 h-full bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                        </div>
                        <span className="text-emerald-100">38%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/70 border-emerald-700/30">
                <CardHeader>
                  <CardTitle className="text-emerald-100">Usage Statistics</CardTitle>
                  <CardDescription className="text-emerald-200">Current billing period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-200">Notifications Used</span>
                      <span className="text-emerald-100">31 / 250</span>
                    </div>
                    <div className="w-full h-2 bg-emerald-700/30 rounded-full overflow-hidden">
                      <div className="w-1/8 h-full bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-300">12% used</span>
                      <span className="text-emerald-300">219 remaining</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
