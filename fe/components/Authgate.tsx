"use client";
import { useSession } from "next-auth/react";
import Dashboard from "./dashboard";
import React from "react";

export default function AuthGate({ fallback }: { fallback: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") return null; // or a spinner

  if (session) {
    return <Dashboard />;
  }
  return <>{fallback}</>;
} 