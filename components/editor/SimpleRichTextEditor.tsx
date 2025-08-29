// components/ui/SimpleRichTextEditor.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface SimpleRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function SimpleRichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  minHeight = 200,
}: SimpleRichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPreview, setIsPreview] = useState(false);

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);
    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertHTML = (htmlTag: string, closeTag?: string) => {
    const close = closeTag || htmlTag.replace("<", "</");
    insertText(htmlTag, close);
  };

  const formatButtons = [
    {
      label: "𝐁",
      action: () => insertHTML("<strong>", "</strong>"),
      title: "Bold",
    },
    { label: "𝐼", action: () => insertHTML("<em>", "</em>"), title: "Italic" },
    { label: "𝐔", action: () => insertHTML("<u>", "</u>"), title: "Underline" },
    {
      label: "H1",
      action: () => insertHTML("<h1>", "</h1>"),
      title: "Header 1",
    },
    {
      label: "H2",
      action: () => insertHTML("<h2>", "</h2>"),
      title: "Header 2",
    },
    {
      label: "H3",
      action: () => insertHTML("<h3>", "</h3>"),
      title: "Header 3",
    },
    {
      label: "•",
      action: () => insertHTML("<ul><li>", "</li></ul>"),
      title: "Bullet List",
    },
    {
      label: "1.",
      action: () => insertHTML("<ol><li>", "</li></ol>"),
      title: "Numbered List",
    },
    {
      label: "🔗",
      action: () => insertHTML('<a href="URL">', "</a>"),
      title: "Link",
    },
    {
      label: "</>",
      action: () => insertHTML("<code>", "</code>"),
      title: "Inline Code",
    },
    {
      label: "❝",
      action: () => insertHTML("<blockquote>", "</blockquote>"),
      title: "Blockquote",
    },
    { label: "↵", action: () => insertText("<br>"), title: "Line Break" },
  ];

  const renderPreview = (text: string) => {
    // Basic HTML sanitization - in production, use a proper sanitization library
    return text
      .replace(/\n/g, "<br>")
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
      .replace(/javascript:/gi, ""); // Remove javascript: links
  };

  return (
    <div className="border rounded-md overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1 items-center">
        <div className="flex flex-wrap gap-1">
          {formatButtons.map((btn, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={btn.action}
              title={btn.title}
              className="h-8 px-2 text-xs font-medium hover:bg-gray-200"
              type="button"
            >
              {btn.label}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="h-8 px-3 text-xs font-medium"
            type="button"
          >
            {isPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div style={{ minHeight: `${minHeight}px` }} className="relative">
        {isPreview ? (
          <div
            className="p-4 prose max-w-none min-h-full"
            style={{ minHeight: `${minHeight}px` }}
            dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 resize-none border-none outline-none text-sm leading-relaxed"
            style={{ minHeight: `${minHeight}px` }}
            spellCheck={true}
          />
        )}
      </div>

      {/* Help text */}
      <div className="border-t bg-gray-50 px-4 py-2 text-xs text-gray-600">
        Use HTML tags: &lt;strong&gt;bold&lt;/strong&gt;,
        &lt;em&gt;italic&lt;/em&gt;, &lt;h1&gt;headers&lt;/h1&gt;,
        &lt;ul&gt;&lt;li&gt;lists&lt;/li&gt;&lt;/ul&gt;, &lt;a
        href=&quot;url&quot;&gt;links&lt;/a&gt;
      </div>
    </div>
  );
}
