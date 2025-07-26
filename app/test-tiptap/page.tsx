"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function TestTiptap() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello world!</p>",
    immediatelyRender: false,
  });

  return (
    <div>
      <h1>Test Tiptap</h1>
      <EditorContent editor={editor} />
    </div>
  );
} 