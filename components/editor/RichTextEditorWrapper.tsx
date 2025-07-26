// components/ui/RichTextEditorWrapper.tsx
"use client";

import { useState, useEffect, useRef } from "react";

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
  const [ReactQuill, setReactQuill] = useState<any>(null);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);

    // Import ReactQuill directly (newer version that's React 18 compatible)
    const loadEditor = async () => {
      try {
        // Import ReactQuill and CSS
        const ReactQuillModule = await import("react-quill");
        await import("react-quill/dist/quill.snow.css");

        setReactQuill(() => ReactQuillModule.default);
      } catch (error) {
        console.error("Failed to load ReactQuill:", error);
      }
    };

    loadEditor();
  }, []);

  // Show loading state while editor is loading
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
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{
          minHeight: `${minHeight}px`,
          backgroundColor: "white",
        }}
      />
      <style jsx global>{`
        .ql-editor {
          min-height: ${minHeight - 42}px;
          font-size: 14px;
          line-height: 1.6;
        }
        .ql-toolbar {
          border-top: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-bottom: none;
        }
        .ql-container {
          border-bottom: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-top: none;
        }
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
    </div>
  );
}
