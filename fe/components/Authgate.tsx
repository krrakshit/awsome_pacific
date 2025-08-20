"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function AuthGate({ 
  children, 
  fallback, 
  requireAuth = true 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (requireAuth && !session) {
      router.push("/login");
    } else if (!requireAuth && session) {
      router.push("/dashboard");
    }
  }, [session, status, router, requireAuth]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-emerald-100">Loading...</div>
      </div>
    );
  }

  if (requireAuth && !session) {
    return <>{fallback}</>;
  }

  if (!requireAuth && session) {
    return null; // Will redirect to dashboard
  }

  return <>{children}</>;
}