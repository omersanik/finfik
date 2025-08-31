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

async function testFullAPI() {
  console.log("Testing the full API flow...");

  // Test the content blocks query like the API does
  const courseSlug = "financial-literacy-101";

  // First get the course
  const { data: course, error: courseError } = await supabase
    .from("course")
    .select("id")
    .eq("slug", courseSlug)
    .single();

  if (courseError || !course) {
    console.error("Course error:", courseError);
    return;
  }

  console.log("Course ID:", course.id);

  // Get sections for this course
  const { data: sections, error: sectionsError } = await supabase
    .from("section")
    .select("id")
    .eq("course_id", course.id)
    .order("order_index", { ascending: true });

  if (sectionsError || !sections) {
    console.error("Sections error:", sectionsError);
    return;
  }

  console.log(`Found ${sections.length} sections`);

  // Get blocks for all sections
  const sectionIds = sections.map((s) => s.id);
  const { data: blocks, error: blocksError } = await supabase
    .from("content-block")
    .select("id, section_id, title, order_index, created_at")
    .in("section_id", sectionIds)
    .order("order_index", { ascending: true });

  if (blocksError || !blocks) {
    console.error("Blocks error:", blocksError);
    return;
  }

  console.log(`Found ${blocks.length} blocks`);

  // Get content items for all blocks (this is the critical query)
  const blockIds = blocks.map((b) => b.id);
  const { data: items, error: itemsError } = await supabase
    .from("content_item")
    .select(
      "id, block_id, type, content_text, image_url, quiz_data, component_key, order_index, created_at, content_type, styling_data, math_formula, interactive_data, media_files, font_settings, layout_config, animation_settings, drag_drop_title, drag_drop_instructions, drag_drop_categories, drag_drop_items"
    )
    .in("block_id", blockIds);

  if (itemsError) {
    console.error("Items error:", itemsError);
    return;
  }

  console.log(`Found ${items.length} content items`);

  // Find our specific drag-drop item
  const dragDropItem = items.find(
    (item) => item.id === "e026f3ed-ee99-42a1-93c5-542516b022fa"
  );

  if (dragDropItem) {
    console.log("\n=== Drag-Drop Item Details ===");
    console.log("ID:", dragDropItem.id);
    console.log("Block ID:", dragDropItem.block_id);
    console.log("Type:", dragDropItem.type);
    console.log("drag_drop_categories:", dragDropItem.drag_drop_categories);
    console.log("drag_drop_items:", dragDropItem.drag_drop_items);
    console.log("drag_drop_title:", dragDropItem.drag_drop_title);
    console.log("drag_drop_instructions:", dragDropItem.drag_drop_instructions);

    // Check validation
    const hasValidCategories =
      dragDropItem.drag_drop_categories &&
      String(dragDropItem.drag_drop_categories).trim().length > 0 &&
      !String(dragDropItem.drag_drop_categories).includes("undefined") &&
      String(dragDropItem.drag_drop_categories) !== "null";

    const hasValidItems =
      dragDropItem.drag_drop_items &&
      String(dragDropItem.drag_drop_items).trim().length > 0 &&
      !String(dragDropItem.drag_drop_items).includes("undefined") &&
      String(dragDropItem.drag_drop_items) !== "null";

    console.log("Has valid categories:", hasValidCategories);
    console.log("Has valid items:", hasValidItems);

    if (hasValidCategories && hasValidItems) {
      console.log("✅ Item should work correctly!");
    } else {
      console.log("❌ Item validation failed");
    }
  } else {
    console.log("❌ Drag-drop item not found");
  }
}

testFullAPI().catch(console.error);
