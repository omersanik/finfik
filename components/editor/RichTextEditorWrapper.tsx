"use client";

import { useState, useEffect, useRef } from "react";
import type { Quill } from "quill"; // For quillRef type

interface RichTextEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
}

export default function RichTextEditorWrapper({
  value,
  onChange,
  minHeight = 200,
}: RichTextEditorWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [ReactQuill, setReactQuill] =
    useState<React.ComponentType<unknown> | null>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    setIsMounted(true);

    const loadEditor = async () => {
      try {
        const MantineModule = await import("@mantine/rte");
        setReactQuill(() => MantineModule.RichTextEditor as unknown as React.ComponentType<unknown>);
      } catch (error) {
        console.error("Failed to load editor:", error);
      }
    };

    loadEditor();
  }, []);

  if (!isMounted || !ReactQuill) {
    return (
      <div
        className="border rounded-md bg-gray-50 flex items-center justify-center text-gray-500"
        style={{ minHeight: `${minHeight}px` }}
      >
        Loading editor...
      </div>
    );
  }

  // Removed Quill-specific toolbar/modules since we're using Mantine RTE

  return (
    <div className="rich-text-editor-wrapper">
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={onChange}
        style={{ minHeight: `${minHeight}px` }}
        // @ts-expect-error Mantine RTE uses different props; keep minimal
      />
      {/* Mantine RTE handles its own styles */}
    </div>
  );
}
