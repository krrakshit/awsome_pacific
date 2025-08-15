import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "NotifyHub - Powerful Notifications Made Simple",
  description:
    "Create organizations, manage teams, and send real-time notifications with ease. Built for modern businesses that need reliable communication.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style></style>
      </head>
      <body>
        <Providers>
         {children} </Providers></body>
    </html>
  )
}
