"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Check,
  Bell,
  Users,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Star,
  Globe,
  Clock,
  Smartphone,
  Code,
  MessageSquare,
  ChevronRight,
} from "lucide-react"

// Dynamically import the World component to avoid SSR issues
const World = dynamic(() => import("@/components/ui/globe").then(mod => ({ default: mod.World })), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
    </div>
  )
});

// Globe configuration matching our theme
const globeConfig = {
  pointSize: 4,
  globeColor: "#0d0d0d", // Dark background
  showAtmosphere: true,
  atmosphereColor: "#10b981", // Emerald color
  atmosphereAltitude: 0.1,
  emissive: "#064e3b", // Dark emerald
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(16, 185, 129, 0.7)", // Emerald with transparency
  ambientLight: "#38a169",
  directionalLeftLight: "#10b981",
  directionalTopLight: "#10b981",
  pointLight: "#10b981",
  arcTime: 1500,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  initialPosition: { lat: 22.3193, lng: 114.1694 },
  autoRotate: true,
  autoRotateSpeed: 0.8,
};

// Sample arc data representing notification connections around the world
const sampleArcs = [
  {
    order: 1,
    startLat: -33.8688,
    startLng: 151.2093, // Sydney
    endLat: 40.7128,
    endLng: -74.0060, // New York
    arcAlt: 0.3,
    color: "#10b981",
  },
  {
    order: 2,
    startLat: 51.5074,
    startLng: -0.1278, // London
    endLat: 35.6762,
    endLng: 139.6503, // Tokyo
    arcAlt: 0.3,
    color: "#0d9488",
  },
  {
    order: 3,
    startLat: 37.7749,
    startLng: -122.4194, // San Francisco
    endLat: 52.5200,
    endLng: 13.4050, // Berlin
    arcAlt: 0.3,
    color: "#14b8a6",
  },
  {
    order: 4,
    startLat: 19.0760,
    startLng: 72.8777, // Mumbai
    endLat: -23.5505,
    endLng: -46.6333, // São Paulo
    arcAlt: 0.4,
    color: "#10b981",
  },
  {
    order: 5,
    startLat: 1.3521,
    startLng: 103.8198, // Singapore
    endLat: 55.7558,
    endLng: 37.6173, // Moscow
    arcAlt: 0.5,
    color: "#0d9488",
  },
  {
    order: 6,
    startLat: 25.2048,
    startLng: 55.2708, // Dubai
    endLat: -1.2921,
    endLng: 36.8219, // Nairobi
    arcAlt: 0.3,
    color: "#14b8a6",
  },
  {
    order: 7,
    startLat: 41.9028,
    startLng: 12.4964, // Rome
    endLat: 31.2304,
    endLng: 121.4737, // Shanghai
    arcAlt: 0.4,
    color: "#10b981",
  },
  {
    order: 8,
    startLat: 55.6761,
    startLng: 12.5683, // Copenhagen
    endLat: -37.8136,
    endLng: 144.9631, // Melbourne
    arcAlt: 0.5,
    color: "#0d9488",
  },
  {
    order: 9,
    startLat: 45.4215,
    startLng: -75.6972, // Ottawa
    endLat: -34.6118,
    endLng: -58.3960, // Buenos Aires
    arcAlt: 0.3,
    color: "#14b8a6",
  },
  {
    order: 10,
    startLat: 39.9042,
    startLng: 116.4074, // Beijing
    endLat: 48.8566,
    endLng: 2.3522, // Paris
    arcAlt: 0.4,
    color: "#10b981",
  },
  {
    order: 11,
    startLat: -26.2041,
    startLng: 28.0473, // Johannesburg
    endLat: 59.3293,
    endLng: 18.0686, // Stockholm
    arcAlt: 0.5,
    color: "#0d9488",
  },
  {
    order: 12,
    startLat: 13.7563,
    startLng: 100.5018, // Bangkok
    endLat: 50.1109,
    endLng: 8.6821, // Frankfurt
    arcAlt: 0.4,
    color: "#14b8a6",
  },
  {
    order: 13,
    startLat: -22.9068,
    startLng: -43.1729, // Rio de Janeiro
    endLat: 64.1466,
    endLng: -21.9426, // Reykjavik
    arcAlt: 0.3,
    color: "#10b981",
  },
  {
    order: 14,
    startLat: 28.6139,
    startLng: 77.2090, // New Delhi
    endLat: -35.2809,
    endLng: 149.1300, // Canberra
    arcAlt: 0.5,
    color: "#0d9488",
  },
  {
    order: 15,
    startLat: 6.5244,
    startLng: 3.3792, // Lagos
    endLat: 49.2827,
    endLng: -123.1207, // Vancouver
    arcAlt: 0.4,
    color: "#14b8a6",
  },
];

export default function HomePage() {
  const [arcs, setArcs] = useState(sampleArcs);
  const [clickCount, setClickCount] = useState(0);

  // Function to generate random coordinates
  const getRandomCoordinate = () => ({
    lat: (Math.random() - 0.5) * 180, // -90 to 90
    lng: (Math.random() - 0.5) * 360, // -180 to 180
  });

  // Function to handle globe click with coordinates
  const handleGlobeClickWithCoords = (clickLat: number, clickLng: number) => {
    const colors = ["#10b981", "#0d9488", "#14b8a6", "#059669", "#047857"];
    
    // Generate a random destination
    const dest = getRandomCoordinate();
    
    const newArc = {
      order: arcs.length + 1,
      startLat: clickLat,
      startLng: clickLng,
      endLat: dest.lat,
      endLng: dest.lng,
      arcAlt: Math.random() * 0.4 + 0.2, // Random altitude between 0.2 and 0.6
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setArcs(prevArcs => [...prevArcs, newArc]);
    setClickCount(prev => prev + 1);
    
    // Remove the arc after 5 seconds to prevent too many arcs
    setTimeout(() => {
      setArcs(prevArcs => prevArcs.filter(arc => arc.order !== newArc.order));
    }, 5000);
  };

  // Function to handle globe click and add new arc
  const handleGlobeClick = () => {
    const colors = ["#10b981", "#0d9488", "#14b8a6", "#059669", "#047857"];
    const start = getRandomCoordinate();
    const end = getRandomCoordinate();
    
    const newArc = {
      order: arcs.length + 1,
      startLat: start.lat,
      startLng: start.lng,
      endLat: end.lat,
      endLng: end.lng,
      arcAlt: Math.random() * 0.4 + 0.2, // Random altitude between 0.2 and 0.6
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setArcs(prevArcs => [...prevArcs, newArc]);
    setClickCount(prev => prev + 1);
    
    // Remove the arc after 5 seconds to prevent too many arcs
    setTimeout(() => {
      setArcs(prevArcs => prevArcs.filter(arc => arc.order !== newArc.order));
    }, 5000);
  };

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
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-emerald-300 hover:text-emerald-100 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-emerald-300 hover:text-emerald-100 transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-emerald-300 hover:text-emerald-100 transition-colors">
                Testimonials
              </a>
              <a href="#about" className="text-emerald-300 hover:text-emerald-100 transition-colors">
                About
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-emerald-300 hover:text-emerald-100 hover:bg-black/50">
                Sign In
              </Button>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-black">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-5xl md:text-7xl font-bold text-emerald-100 mb-6 leading-tight">
            Instant Notifications
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              That Actually Work
            </span>
          </h1>
          <p className="text-xl text-emerald-200 mb-8 leading-relaxed max-w-3xl mx-auto">
            Build, send, and track notifications across multiple organizations with our powerful WebSocket-driven
            platform. Scale from 5 to 50,000 notifications per day with enterprise-grade reliability.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-black text-lg px-8 py-6"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-emerald-600 text-emerald-300 hover:bg-black hover:text-emerald-300 bg-transparent"
            >
              View Demo
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm">
            <div className="flex items-center justify-center space-x-2 text-sm text-emerald-300">
              <Check className="w-4 h-4 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-emerald-300">
              <Check className="w-4 h-4 text-green-400" />
              <span>Setup in 2 minutes</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-emerald-300">
              <Check className="w-4 h-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Interactive Globe */}
          <div className="mt-20 mb-16 w-full">
            <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px]">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-900/10 to-teal-900/10 backdrop-blur-sm border border-emerald-800/20" />
              <div className="w-full h-full cursor-pointer">
                <World data={arcs} globeConfig={globeConfig} onGlobeClick={handleGlobeClickWithCoords} />
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-xs text-emerald-300/80 backdrop-blur-sm bg-black/40 rounded-lg px-3 py-2 border border-emerald-800/20">
                  Real-time notifications connecting organizations worldwide • Click anywhere on the globe to send a notification from that location
                </p>
              </div>
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse">
                  {arcs.length} Active Connections
                </Badge>
                <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">
                  {clickCount} Notifications Sent
                </Badge>
                <Button 
                  size="sm" 
                  onClick={handleGlobeClick}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1"
                  variant="outline"
                >
                  Random Notification
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 bg-black/50 rounded-2xl p-8 backdrop-blur-sm border border-emerald-800/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-emerald-100 mb-2">10M+</div>
                <div className="text-emerald-300">Notifications Sent</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-100 mb-2">5K+</div>
                <div className="text-emerald-300">Active Organizations</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-100 mb-2">99.9%</div>
                <div className="text-emerald-300">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-100 mb-2">50ms</div>
                <div className="text-emerald-300">Avg Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-emerald-100 mb-4">Everything you need to manage notifications</h2>
            <p className="text-xl text-emerald-200 max-w-2xl mx-auto">
              From real-time delivery to advanced analytics, we`&apos`ve got your notification needs covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-black/70 border-emerald-700/30 hover:bg-black/90 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/30">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-emerald-100">Multi-Organization Support</CardTitle>
                <CardDescription className="text-emerald-200">
                  Create and manage multiple organizations with dedicated notification channels and team management
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-black/70 border-emerald-700/30 hover:bg-black/90 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500/20 to-teal-600/20 rounded-lg flex items-center justify-center mb-4 border border-teal-500/30">
                  <Zap className="w-6 h-6 text-teal-400" />
                </div>
                <CardTitle className="text-emerald-100">Real-time Delivery</CardTitle>
                <CardDescription className="text-emerald-200">
                  WebSocket-powered notifications ensure instant delivery with Redis caching for optimal performance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-black/70 border-emerald-700/30 hover:bg-black/90 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/30">
                  <BarChart3 className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-emerald-100">Analytics & Insights</CardTitle>
                <CardDescription className="text-emerald-200">
                  Track delivery rates, engagement metrics, and notification performance with detailed analytics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-black/70 border-emerald-700/30 hover:bg-black/90 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500/20 to-teal-600/20 rounded-lg flex items-center justify-center mb-4 border border-teal-500/30">
                  <Shield className="w-6 h-6 text-teal-400" />
                </div>
                <CardTitle className="text-emerald-100">Enterprise Security</CardTitle>
                <CardDescription className="text-emerald-200">
                  Bank-level security with PostgreSQL reliability, encryption, and compliance standards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-black/70 border-emerald-700/30 hover:bg-black/90 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500/20 to-teal-600/20 rounded-lg flex items-center justify-center mb-4 border border-teal-500/30">
                  <Bell className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-emerald-100">Smart Notifications</CardTitle>
                <CardDescription className="text-emerald-200">
                  Intelligent routing, delivery optimization, and customizable templates for maximum engagement
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-black/70 border-emerald-700/30 hover:bg-black/90 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500/20 to-teal-600/20 rounded-lg flex items-center justify-center mb-4 border border-teal-500/30">
                  <Code className="w-6 h-6 text-teal-400" />
                </div>
                <CardTitle className="text-emerald-100">Developer Friendly</CardTitle>
                <CardDescription className="text-emerald-200">
                  RESTful APIs, WebSocket connections, and comprehensive documentation for seamless integration
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-950/20 to-teal-950/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-emerald-100 mb-6">Built for Scale & Performance</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Globe className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-emerald-100 mb-2">Global Infrastructure</h4>
                    <p className="text-emerald-200">
                      Distributed across multiple regions for low-latency delivery worldwide
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Clock className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-emerald-100 mb-2">Smart Scheduling</h4>
                    <p className="text-emerald-200">Time-zone aware delivery and optimal send-time algorithms</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Smartphone className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-emerald-100 mb-2">Multi-Channel Support</h4>
                    <p className="text-emerald-200">
                      Push notifications, email, SMS, and in-app messaging from a single platform
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gradient-to-r from-emerald-950/30 to-teal-950/30 rounded-2xl p-8 border border-emerald-600/30">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-200">Notification Delivery</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Live</Badge>
                  </div>
                  <Separator className="bg-emerald-600/30" />
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-emerald-200">User authentication successful</span>
                      <span className="text-xs text-emerald-300 ml-auto">2ms</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-emerald-200">Notification queued</span>
                      <span className="text-xs text-emerald-300 ml-auto">5ms</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-emerald-200">Message delivered</span>
                      <span className="text-xs text-emerald-300 ml-auto">12ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-emerald-100 mb-4">Trusted by thousands of businesses</h2>
            <p className="text-xl text-emerald-200">See what our customers are saying about NotifyHub</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="bg-black/70 border-emerald-700/30 p-6">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback className="bg-emerald-500">SJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-emerald-100">Sarah Johnson</div>
                      <div className="text-sm text-emerald-300">CTO, TechCorp</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-emerald-200">
                    `&apos`NotifyHub transformed our user engagement. The real-time delivery and multi-org support made it
                    perfect for our enterprise needs. Setup was incredibly simple.`&apos`
                  </p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-r from-emerald-950/20 to-teal-950/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-emerald-100 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-emerald-200">Start free, scale as you grow. No hidden fees, no surprises.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="bg-black/70 border-emerald-700/30">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl text-emerald-100">Free Plan</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-emerald-100">$0</span>
                  <span className="text-emerald-300">/month</span>
                </div>
                <CardDescription className="mt-2 text-emerald-200">Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-emerald-200">1 Organization</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-emerald-200">5 Notifications per day</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-emerald-200">Basic Analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-emerald-200">Email Support</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-emerald-200">Community Access</span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-transparent border-emerald-600 text-emerald-300 hover:bg-black hover:text-emerald-100"
                  variant="outline"
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-gradient-to-b from-emerald-950/30 to-teal-950/30 border-emerald-500/50 relative overflow-hidden">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-black px-4 py-1 border-0">
                  Most Popular
                </Badge>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-600/5"></div>
              <CardHeader className="text-center pb-8 relative">
                <CardTitle className="text-2xl text-emerald-100">Premium Plan</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-emerald-100">$10</span>
                  <span className="text-emerald-200">/month</span>
                </div>
                <CardDescription className="mt-2 text-emerald-200">For growing businesses</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-emerald-100">5 Organizations</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-emerald-100">50 Notifications per day per org</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-emerald-100">Advanced Analytics & Reports</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-emerald-100">Priority Support</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-emerald-100">Custom Integrations</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-emerald-100">Multi-channel Delivery</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-black">
                  Start Premium Trial
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-emerald-200 mb-4">Need more? Looking for enterprise features?</p>
            <Button
              variant="outline"
              className="border-emerald-600 text-emerald-300 hover:bg-black hover:text-emerald-400 bg-transparent"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-emerald-100 mb-6">Ready to transform your notifications?</h2>
          <p className="text-xl text-emerald-200 mb-8">
            Join thousands of businesses already using NotifyHub to engage their users
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-6 bg-black text-emerald-400 hover:bg-emerald-950 border border-emerald-500/30"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-emerald-800/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold text-emerald-100">NotifyHub</span>
              </div>
              <p className="text-emerald-300 mb-4">The modern notification platform for growing businesses.</p>
              <div className="flex space-x-4">
                <Button size="sm" variant="ghost" className="text-emerald-300 hover:text-emerald-100 p-2">
                  <Globe className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-emerald-300 hover:text-emerald-100 p-2">
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-emerald-300 hover:text-emerald-100 p-2">
                  <Code className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-emerald-100 mb-4">Product</h3>
              <ul className="space-y-2 text-emerald-300">
                <li>
                  <a href="#" className="hover:text-emerald-100 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-100 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-100 transition-colors">
                    API Docs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-100 transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-emerald-100 mb-4">Company</h3>
              <ul className="space-y-2 text-emerald-300">
                <li>
                  <a href="#" className="hover:text-emerald-100 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-100 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-100 transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-100 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-emerald-100 mb-4">Support</h3>
              <ul className="space-y-2 text-emerald-300">
                <li>
                  <a href="#" className="hover:text-emerald-100 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-100 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-100 transition-colors">
                    Status
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-100 transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-emerald-800/30 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-emerald-300 text-sm">© 2024 NotifyHub. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-emerald-300 hover:text-emerald-100 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-emerald-300 hover:text-emerald-100 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-emerald-300 hover:text-emerald-100 text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
