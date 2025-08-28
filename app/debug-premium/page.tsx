"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { usePremiumStatus } from "@/lib/hooks/useApi";

// Define types for API responses
interface PremiumStatusResponse {
  is_premium: boolean;
  user_id?: string;
  message?: string;
}

interface ApiErrorResponse {
  error: string;
  message?: string;
}

type ManualResult = PremiumStatusResponse | ApiErrorResponse | null;

export default function DebugPremiumPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [manualResult, setManualResult] = useState<ManualResult>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      if (user) {
        try {
          const userToken = await getToken();
          setToken(userToken);
        } catch (error) {
          console.error("Failed to get token:", error);
        }
      }
    };
    fetchToken();
  }, [user, getToken]);

  const {
    data: premiumData,
    isLoading: premiumLoading,
    error: premiumError,
  } = usePremiumStatus(user?.id, token || undefined);

  const testManualAPI = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch("/api/users/premium-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data: PremiumStatusResponse = await response.json();
      setManualResult(data);
    } catch (error) {
      console.error("Manual API test failed:", error);
      setManualResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const testChangePremiumStatus = async (newStatus: boolean) => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch("/api/users/premium-users", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_premium: newStatus }),
      });
      const data: PremiumStatusResponse = await response.json();
      setManualResult(data);

      // Refresh premium status after change
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Premium status change failed:", error);
      setManualResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Premium Status Debug</h1>

      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">User Info</h2>
          <p>
            <strong>User ID:</strong> {user?.id || "Not loaded"}
          </p>
          <p>
            <strong>Email:</strong>{" "}
            {user?.emailAddresses?.[0]?.emailAddress || "Not loaded"}
          </p>
          <p>
            <strong>Token:</strong> {token ? "Exists" : "Missing"}
          </p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">React Query Hook</h2>
          <p>
            <strong>Loading:</strong> {premiumLoading ? "Yes" : "No"}
          </p>
          <p>
            <strong>Error:</strong>{" "}
            {premiumError ? premiumError.message : "None"}
          </p>
          <p>
            <strong>Data:</strong> {JSON.stringify(premiumData, null, 2)}
          </p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Premium Status Testing</h2>
          <p className="mb-4 text-sm text-gray-600">
            <strong>Revoke Premium:</strong> This will remove premium access,
            delete all premium course enrollments, progress, and redirect you
            away from premium courses. Use this to test the security.
          </p>
          <p className="mb-4 text-sm text-gray-600">
            <strong>Grant Premium:</strong> This will restore premium access.
          </p>

          <button
            onClick={() => testChangePremiumStatus(false)}
            disabled={!token || loading}
            className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50 mr-2"
          >
            {loading ? "Testing..." : "Revoke Premium"}
          </button>

          <button
            onClick={() => testChangePremiumStatus(true)}
            disabled={!token || loading}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Testing..." : "Grant Premium"}
          </button>

          {manualResult && (
            <div className="mt-4">
              <p>
                <strong>Result:</strong>
              </p>
              <pre className="bg-white p-2 rounded text-sm overflow-auto">
                {JSON.stringify(manualResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Manual API Test</h2>
          <button
            onClick={testManualAPI}
            disabled={!token || loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test API Manually"}
          </button>

          {manualResult && (
            <div className="mt-4">
              <p>
                <strong>Result:</strong>
              </p>
              <pre className="bg-white p-2 rounded text-sm overflow-auto">
                {JSON.stringify(manualResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Browser Console</h2>
          <p>
            Check the browser console for detailed debug logs from the Navbar
            component.
          </p>
        </div>
      </div>
    </div>
  );
}
