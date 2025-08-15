import { getSession } from "next-auth/react";
import { useState, useEffect } from "react";

// API utility function that automatically includes user ID in requests
export async function apiCall(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth: boolean = true
) {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    let body = options.body;

    // If authentication is required, get session and include user ID
    if (requiresAuth) {
      const session = await getSession();

      if (!session?.user) {
        throw new Error("Authentication required");
      }

      const userWithId = session.user as { id?: string };
      if (!userWithId.id) {
        throw new Error("User ID not found in session");
      }

      // If it's a POST/PUT request with JSON body, add user ID to the body
      if (
        options.method &&
        ["POST", "PUT", "PATCH"].includes(options.method.toUpperCase())
      ) {
        const bodyData = body ? JSON.parse(body as string) : {};
        bodyData.id = userWithId.id; // Add user ID to request body
        body = JSON.stringify(bodyData);
      }

      // For GET requests, you might want to add user ID as a query parameter
      if (!options.method || options.method.toUpperCase() === "GET") {
        const separator = endpoint.includes("?") ? "&" : "?";
        endpoint = `${endpoint}${separator}userId=${userWithId.id}`;
      }
    }

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      }${endpoint}`,
      {
        ...options,
        headers,
        body,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
}

// Convenience functions for different HTTP methods
export const api = {
  get: (endpoint: string, requiresAuth = true) =>
    apiCall(endpoint, { method: "GET" }, requiresAuth),

  post: (
    endpoint: string,
    data: Record<string, unknown>,
    requiresAuth = true
  ) =>
    apiCall(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      requiresAuth
    ),

  put: (endpoint: string, data: Record<string, unknown>, requiresAuth = true) =>
    apiCall(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      requiresAuth
    ),

  delete: (endpoint: string, requiresAuth = true) =>
    apiCall(endpoint, { method: "DELETE" }, requiresAuth),
};

// Hook to get current user ID from session
export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const session = await getSession();
      const userWithId = session?.user as { id?: string };
      setUserId(userWithId?.id || null);
    };

    fetchUserId();
  }, []);

  return userId;
}
