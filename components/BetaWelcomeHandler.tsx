"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { usePremiumStatus } from "@/lib/hooks/useApi";
import BetaWelcomeModal from "./BetaWelcomeModal";

export default function BetaWelcomeHandler() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Get auth token
  useEffect(() => {
    const fetchToken = async () => {
      if (user) {
        try {
          const userToken = await getToken();
          setToken(userToken);
        } catch (error) {
          console.error('Failed to get token:', error);
        }
      }
    };
    fetchToken();
  }, [user, getToken]);

  // Check premium status
  const { data: premiumData, isLoading } = usePremiumStatus(user?.id, token || undefined);

  useEffect(() => {
    console.log("BetaWelcomeHandler Debug:", {
      isLoading,
      premiumData,
      userId: user?.id,
      isBetaUser: premiumData?.role === 'beta',
      hasSeenModal: localStorage.getItem("beta-welcome-seen"),
      shouldShowModal: !isLoading && premiumData && user && premiumData.role === 'beta' && !localStorage.getItem("beta-welcome-seen")
    });

    if (!isLoading && premiumData && user) {
      const isBetaUser = premiumData.role === 'beta';
      const hasSeenModal = localStorage.getItem("beta-welcome-seen");
      
      // Show modal if user is beta and hasn't seen it before
      if (isBetaUser && !hasSeenModal) {
        console.log("Setting modal to show for beta user!");
        setShowModal(true);
      }
    }
  }, [premiumData, isLoading, user]);

  if (!user || isLoading) {
    return null;
  }

  return (
    <BetaWelcomeModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      userName={user.firstName || user.username || undefined}
    />
  );
}
