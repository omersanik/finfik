"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { usePremiumStatus } from "@/lib/hooks/useApi";
import BetaWelcomeModal from "./BetaWelcomeModal";

export default function BetaWelcomeHandler() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});

  // Get auth token
  useEffect(() => {
    const fetchToken = async () => {
      if (user && userLoaded) {
        try {
          const userToken = await getToken();
          console.log(
            "BetaWelcomeHandler: Token fetched successfully",
            !!userToken
          );
          setToken(userToken);
        } catch (error) {
          console.error("BetaWelcomeHandler: Failed to get token:", error);
        }
      }
    };
    fetchToken();
  }, [user, userLoaded, getToken]);

  // Check premium status
  const {
    data: premiumData,
    isLoading,
    error: premiumError,
  } = usePremiumStatus(user?.id, token || undefined);

  useEffect(() => {
    const hasSeenModal =
      typeof window !== "undefined"
        ? localStorage.getItem("beta-welcome-seen")
        : null;
    const debug = {
      userLoaded,
      hasUser: !!user,
      userId: user?.id,
      hasToken: !!token,
      isLoading,
      premiumData,
      premiumError: premiumError?.message,
      isBetaUser: premiumData?.role === "beta",
      hasSeenModal,
      shouldShowModal:
        !isLoading &&
        premiumData &&
        user &&
        premiumData.role === "beta" &&
        !hasSeenModal,
    };

    setDebugInfo(debug);
    console.log("BetaWelcomeHandler Debug:", debug);

    // Only proceed if everything is loaded and we have data
    if (userLoaded && !isLoading && premiumData && user && token) {
      const isBetaUser = premiumData.role === "beta";

      // Show modal if user is beta and hasn't seen it before
      if (isBetaUser && !hasSeenModal) {
        console.log(
          "🎉 BetaWelcomeHandler: Setting modal to show for new beta user!"
        );
        setShowModal(true);
      }
    }
  }, [userLoaded, premiumData, isLoading, user, token, premiumError]);

  // Add a delayed fallback check for new users
  useEffect(() => {
    if (
      userLoaded &&
      user &&
      token &&
      !isLoading &&
      !premiumData &&
      !premiumError
    ) {
      console.log(
        "BetaWelcomeHandler: Potential timing issue, will retry in 2 seconds"
      );
      const timer = setTimeout(() => {
        console.log("BetaWelcomeHandler: Retrying after delay...");
        // This will trigger a re-render and re-fetch
        setDebugInfo((prev) => ({ ...prev, retryAttempted: true }));
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [userLoaded, user, token, isLoading, premiumData, premiumError]);

  if (!userLoaded || !user) {
    return null;
  }

  return (
    <>
      {/* Add debug info in development */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "10px",
            fontSize: "12px",
            zIndex: 9999,
            maxWidth: "300px",
            borderRadius: "4px",
          }}
        >
          <div>BetaWelcomeHandler Debug:</div>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}

      <BetaWelcomeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userName={user.firstName || user.username || undefined}
      />
    </>
  );
}
