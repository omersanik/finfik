import { useEffect } from "react";

interface DragDropDebuggerProps {
  item: any;
  enabled?: boolean;
}

export const DragDropDebugger = ({
  item,
  enabled = false,
}: DragDropDebuggerProps) => {
  useEffect(() => {
    if (!enabled) return;

    console.log("=== DragDrop Debugger ===");
    console.log("Item ID:", item?.id);
    console.log("Item Type:", item?.type);
    console.log("Drag Drop Categories:", item?.drag_drop_categories);
    console.log("Drag Drop Items:", item?.drag_drop_items);
    console.log("Interactive Data:", item?.interactive_data);
    console.log("Full Item:", item);
    console.log("========================");
  }, [item, enabled]);

  if (!enabled) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-2 text-xs rounded mb-2">
      <strong>Debug Info:</strong>
      <pre className="overflow-auto">
        {JSON.stringify(
          {
            id: item?.id,
            type: item?.type,
            drag_drop_categories: item?.drag_drop_categories,
            drag_drop_items: item?.drag_drop_items,
            interactive_data: item?.interactive_data,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
};
