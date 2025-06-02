import { supabase } from "@/supabase-client";

export const getAllCourses = async () => {
  const { data, error } = await supabase.from("courses").select("*");

  if (error) {
    console.error("Error fetching course:", error.message);
  }

  console.log("Fetched course:", data);

  return data;
};
