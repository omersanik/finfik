import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

interface HeavyContentData {
  id: string;
  created_at: string;
  quiz_data?: unknown;
  drag_drop_title?: string;
  drag_drop_instructions?: string;
  drag_drop_categories?: string;
  drag_drop_items?: string;
  math_formula?: string;
  interactive_data?: unknown;
  styling_data?: unknown;
}

export function useHeavyContent(
  itemId: string,
  itemType: string,
  shouldLoad: boolean = false
) {
  const [heavyData, setHeavyData] = useState<HeavyContentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    // Only load heavy content when:
    // 1. shouldLoad is true (user interacts with the component)
    // 2. Item type needs heavy data (quiz, drag-drop, etc.)
    // 3. We haven't already loaded it
    if (!shouldLoad || !needsHeavyData(itemType) || heavyData || loading) {
      return;
    }

    const loadHeavyContent = async () => {
      try {
        setLoading(true);
        setError(null);

        console.time(`Heavy Content Load - ${itemId}`);

        const token = await getToken();
        const response = await fetch(
          `/api/content-items/${itemId}/heavy-data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.timeEnd(`Heavy Content Load - ${itemId}`);

        if (!response.ok) {
          throw new Error(
            `Failed to load heavy content: ${response.statusText}`
          );
        }

        const data = await response.json();
        setHeavyData(data);
      } catch (err) {
        console.error("Error loading heavy content:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadHeavyContent();
  }, [itemId, itemType, shouldLoad, heavyData, loading, getToken]);

  return { heavyData, loading, error };
}

// Helper function to determine if content type needs heavy data
function needsHeavyData(itemType: string): boolean {
  return [
    "quiz",
    "drag-drop",
    "math",
    "animation",
    "calculator",
    "chart",
  ].includes(itemType);
}

// Hook for triggering lazy load on interaction
export function useLazyLoadTrigger() {
  const [shouldLoad, setShouldLoad] = useState(false);

  const triggerLoad = () => {
    if (!shouldLoad) {
      setShouldLoad(true);
    }
  };

  return { shouldLoad, triggerLoad };
}
