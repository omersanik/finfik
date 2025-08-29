"use client";
import { useState, useRef } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
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
    <div>
      <TiptapToolbar
        editor={editor}
        onImageUploadClick={() => fileInputRef.current?.click()}
        uploading={uploading}
      />
      <div className="prose prose-neutral max-w-none bg-white border rounded min-h-[200px] p-2 focus:outline-none rich-text-tiptap">
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
    <TooltipProvider>
      <div className="flex flex-wrap gap-2 mb-2">
        <ToolbarButton
          tooltip="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <b>B</b>
        </ToolbarButton>
        <ToolbarButton
          tooltip="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </ToolbarButton>
        <ToolbarButton
          tooltip="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </ToolbarButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToolbarButton
              tooltip="Headings"
              active={
                editor.isActive("heading", { level: 1 }) ||
                editor.isActive("heading", { level: 2 })
              }
            >
              H
            </ToolbarButton>
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
        <ToolbarButton
          tooltip="Bullet List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </ToolbarButton>
        <ToolbarButton
          tooltip="Ordered List"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          tooltip="Indent"
          onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
        >
          &rarr;
        </ToolbarButton>
        <ToolbarButton
          tooltip="Outdent"
          onClick={() => editor.chain().focus().liftListItem("listItem").run()}
        >
          &larr;
        </ToolbarButton>
        <ToolbarButton
          tooltip="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          &ldquo;
        </ToolbarButton>
        <ToolbarButton
          tooltip="Code Block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          {"</>"}
        </ToolbarButton>
        <ToolbarButton
          tooltip="Horizontal Rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          ―
        </ToolbarButton>
        <ToolbarButton
          tooltip="Insert Image"
          onClick={onImageUploadClick}
          disabled={uploading}
        >
          🖼️
        </ToolbarButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToolbarButton tooltip="Table" active={editor.isActive("table")}>
              Table
            </ToolbarButton>
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
        <ToolbarButton
          tooltip="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↺
        </ToolbarButton>
        <ToolbarButton
          tooltip="Redo"
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↻
        </ToolbarButton>
      </div>
    </TooltipProvider>
  );
}

function ToolbarButton({
  tooltip,
  active,
  disabled,
  onClick,
  children,
}: {
  tooltip: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant={active ? "secondary" : "ghost"}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
