const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAllDragDropItems() {
  console.log("Checking all drag-drop items...");

  // Fetch all drag-drop items
  const { data, error } = await supabase
    .from("content_item")
    .select("*")
    .eq("type", "drag-drop");

  if (error) {
    console.error("Error fetching items:", error);
    return;
  }

  console.log(`Found ${data.length} drag-drop items`);

  data.forEach((item, index) => {
    console.log(`\n--- Item ${index + 1} ---`);
    console.log("ID:", item.id);
    console.log("drag_drop_categories:", item.drag_drop_categories);
    console.log("drag_drop_items:", item.drag_drop_items);

    const hasValidCategories =
      item.drag_drop_categories &&
      item.drag_drop_categories.trim().length > 0 &&
      !item.drag_drop_categories.includes("undefined");

    const hasValidItems =
      item.drag_drop_items &&
      item.drag_drop_items.trim().length > 0 &&
      !item.drag_drop_items.includes("undefined");

    console.log("Has valid categories:", hasValidCategories);
    console.log("Has valid items:", hasValidItems);

    if (!hasValidCategories || !hasValidItems) {
      console.log("⚠️  This item needs fixing!");
    } else {
      console.log("✅ This item looks good");
    }
  });
}

debugAllDragDropItems().catch(console.error);
