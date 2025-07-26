"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { Button } from "@/components/ui/button";

export default function RichTextBlock({ value, onChange }: { value: string; onChange: (val: string) => void }) {
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
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Button type="button" size="icon" variant={editor?.isActive('bold') ? 'secondary' : 'ghost'} onClick={() => editor?.chain().focus().toggleBold().run()}><b>B</b></Button>
        <Button type="button" size="icon" variant={editor?.isActive('italic') ? 'secondary' : 'ghost'} onClick={() => editor?.chain().focus().toggleItalic().run()}><i>I</i></Button>
        <Button type="button" size="icon" variant={editor?.isActive('underline') ? 'secondary' : 'ghost'} onClick={() => editor?.chain().focus().toggleUnderline().run()}><u>U</u></Button>
        <Button type="button" size="icon" variant={editor?.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>H1</Button>
        <Button type="button" size="icon" variant={editor?.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
        <Button type="button" size="icon" variant={editor?.isActive('bulletList') ? 'secondary' : 'ghost'} onClick={() => editor?.chain().focus().toggleBulletList().run()}>•</Button>
        <Button type="button" size="icon" variant={editor?.isActive('orderedList') ? 'secondary' : 'ghost'} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1.</Button>
      </div>
      <EditorContent editor={editor} className="min-h-[80px] p-2 border rounded bg-background focus:outline-none" />
    </div>
  );
} 