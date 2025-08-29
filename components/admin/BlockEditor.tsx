"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { Editor } from "@tiptap/react";

export default function BlockEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Heading,
      BulletList,
      OrderedList,
      ListItem,
      Link,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Image,
      CodeBlock,
      Blockquote,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Image upload handler (base64 preview for now)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      editor
        ?.chain()
        .focus()
        .setImage({ src: reader.result as string })
        .run();
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        Content Editor (WordPress/Notion style)
      </h2>
      <TiptapToolbar
        editor={editor}
        onImageUploadClick={() => fileInputRef.current?.click()}
        uploading={uploading}
      />
      <div className="prose prose-neutral max-w-none bg-white border rounded min-h-[300px] p-2 focus:outline-none rich-text-tiptap">
        <EditorContent editor={editor} />
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleImageUpload}
        disabled={uploading}
      />
      <style jsx global>{`
        .rich-text-tiptap ul {
          list-style-type: disc;
          margin-left: 1.5em;
        }
        .rich-text-tiptap ol {
          list-style-type: decimal;
          margin-left: 1.5em;
        }
        .rich-text-tiptap blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          color: #6b7280;
          background: #f9fafb;
          margin: 1em 0;
        }
        .rich-text-tiptap pre {
          background: #f3f4f6;
          color: #111827;
          border-radius: 0.5em;
          padding: 1em;
          overflow-x: auto;
        }
        .rich-text-tiptap table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        .rich-text-tiptap th,
        .rich-text-tiptap td {
          border: 1px solid #e5e7eb;
          padding: 0.5em 1em;
        }
        .rich-text-tiptap th {
          background: #f3f4f6;
          font-weight: 600;
        }
        .rich-text-tiptap img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5em;
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
}

function TiptapToolbar({
  editor,
  onImageUploadClick,
  uploading,
}: {
  editor: Editor | null;
  onImageUploadClick: () => void;
  uploading: boolean;
}) {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <Button
        type="button"
        size="icon"
        variant={editor.isActive("bold") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <b>B</b>
      </Button>
      <Button
        type="button"
        size="icon"
        variant={editor.isActive("italic") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i>I</i>
      </Button>
      <Button
        type="button"
        size="icon"
        variant={editor.isActive("underline") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <u>U</u>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant={
              editor.isActive("heading", { level: 1 }) ||
              editor.isActive("heading", { level: 2 })
                ? "secondary"
                : "ghost"
            }
          >
            H
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            H1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            H2
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        type="button"
        size="icon"
        variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        •
      </Button>
      <Button
        type="button"
        size="icon"
        variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1.
      </Button>
      <Button
        type="button"
        size="icon"
        variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        &ldquo;
      </Button>
      <Button
        type="button"
        size="icon"
        variant={editor.isActive("codeBlock") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        {"</>"}
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        ―
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={onImageUploadClick}
        disabled={uploading}
      >
        🖼️
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant={editor.isActive("table") ? "secondary" : "ghost"}
          >
            Table
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            Insert Table
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          >
            Add Column Before
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            Add Column After
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            Delete Column
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addRowBefore().run()}
          >
            Add Row Before
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            Add Row After
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            Delete Row
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            Delete Table
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().undo().run()}
      >
        ↺
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().redo().run()}
      >
        ↻
      </Button>
    </div>
  );
}
