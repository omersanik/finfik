"use client";

import { useState, useEffect, useRef } from "react";
import type { Quill } from "quill"; // For quillRef type

interface RichTextEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditorWrapper({
  value,
  onChange,
  placeholder = "Start typing...",
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

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["clean"],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "align",
    "color",
    "background",
    "script",
    "code-block",
  ];

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
