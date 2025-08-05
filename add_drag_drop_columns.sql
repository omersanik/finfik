-- Add drag-drop columns to content_item table
ALTER TABLE content_item 
ADD COLUMN IF NOT EXISTS drag_drop_title TEXT,
ADD COLUMN IF NOT EXISTS drag_drop_instructions TEXT,
ADD COLUMN IF NOT EXISTS drag_drop_items TEXT,
ADD COLUMN IF NOT EXISTS drag_drop_categories TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN content_item.drag_drop_title IS 'Title for drag and drop interactive elements';
COMMENT ON COLUMN content_item.drag_drop_instructions IS 'Instructions for drag and drop interactive elements';
COMMENT ON COLUMN content_item.drag_drop_items IS 'Items to be dragged in format: Item → Category (one per line)';
COMMENT ON COLUMN content_item.drag_drop_categories IS 'Categories for drop zones (one per line)'; 