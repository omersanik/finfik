import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Base API configuration - use relative URLs for client-side requests
const API_BASE =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Generic fetch function with proper caching
const apiFetch = async (
  endpoint: string,
  options?: RequestInit,
  token?: string
) => {
  const url = `${API_BASE}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  console.log("apiFetch called:", { endpoint, url, hasToken: !!token });

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log("apiFetch response:", {
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  // Check if response is JSON or text
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    const result = await response.json();
    console.log("apiFetch JSON result:", result);
    return result;
  } else {
    // For text responses, try to parse as JSON first
    const textResult = await response.text();
    console.log("apiFetch text result:", textResult);

    try {
      // Try to parse as JSON
      const jsonResult = JSON.parse(textResult);
      console.log("apiFetch parsed JSON result:", jsonResult);
      return jsonResult;
    } catch (e) {
      // If parsing fails, return as text
      console.log(`apiFetch returning as text (not JSON) ${e}:`, textResult);
      return textResult;
    }
  }
};

// Custom hook for courses data
export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => apiFetch("/api/courses"),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Custom hook for user premium status
export const usePremiumStatus = (userId?: string, token?: string) => {
  console.log("usePremiumStatus hook initialized with:", {
    userId,
    hasToken: !!token,
  });

  return useQuery({
    queryKey: ["premium-status", userId, token], // Include token in query key for better cache invalidation
    queryFn: async () => {
      console.log("usePremiumStatus hook called with:", {
        userId,
        hasToken: !!token,
      });
      if (!userId) {
        console.log("No userId provided, returning default");
        return { is_premium: false };
      }
      const result = await apiFetch(
        "/api/users/premium-users",
        undefined,
        token
      );
      console.log("usePremiumStatus API result:", result);
      return result;
    },
    enabled: !!userId && !!token,
    staleTime: 0, // 🔥 DISABLE CACHE - Always fetch fresh data
    gcTime: 0, // 🔥 DISABLE CACHE - Don't keep in memory
    retry: 1,
    refetchOnWindowFocus: true, // 🔥 REFRESH on focus to get latest data
  });
};

// Custom hook for user streak
export const useStreak = (userId?: string, token?: string) => {
  return useQuery({
    queryKey: ["streak", userId],
    queryFn: async () => {
      if (!userId) return { current_streak: 0, longest_streak: 0 };
      return apiFetch("/api/streak", undefined, token);
    },
    enabled: !!userId && !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Custom hook for course enrollment status
export const useEnrollmentStatus = (slug: string, token?: string) => {
  return useQuery({
    queryKey: ["enrollment", slug],
    queryFn: () =>
      apiFetch(`/api/progress/check-enrollment?slug=${slug}`, undefined, token),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Custom hook for course progress
export const useCourseProgress = (
  courseId: string,
  enabled: boolean = true,
  token?: string
) => {
  return useQuery({
    queryKey: ["course-progress", courseId],
    queryFn: () =>
      apiFetch(
        "/api/progress/course-progress",
        {
          method: "POST",
          body: JSON.stringify({ courseId }),
        },
        token
      ),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Custom hook for enrolled courses
export const useEnrolledCourses = (userId?: string, token?: string) => {
  return useQuery({
    queryKey: ["enrolled-courses", userId],
    queryFn: async () => {
      if (!userId) return [];
      return apiFetch(
        "/api/progress/enrolled-courses",
        {
          method: "POST",
        },
        token
      );
    },
    enabled: !!userId && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Custom hook for recent course
export const useRecentCourse = (userId?: string, token?: string) => {
  return useQuery({
    queryKey: ["recent-course", userId],
    queryFn: async () => {
      if (!userId) return null;
      return apiFetch(
        "/api/progress/recent-course",
        {
          method: "POST",
        },
        token
      );
    },
    enabled: !!userId && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Mutation hooks
export const useStartCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, token }: { courseId: string; token: string }) =>
      apiFetch(
        "/api/progress/start-course",
        {
          method: "POST",
          body: JSON.stringify({ course_id: courseId }),
        },
        token
      ),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["enrolled-courses"] });
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
    },
  });
};

export const useUpdateLastAccessed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, token }: { courseId: string; token: string }) =>
      apiFetch(
        "/api/progress/update-last-accessed",
        {
          method: "POST",
          body: JSON.stringify({ course_id: courseId }),
        },
        token
      ),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["recent-course"] });
      queryClient.invalidateQueries({ queryKey: ["course-progress"] });
    },
  });
};
