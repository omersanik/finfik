"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import "./EnhancedContentEditor.css";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import CodeBlock from "@tiptap/extension-code-block";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough as StrikeIcon,
  Type as TypeIcon,
  AlignLeft as AlignLeftIcon,
  AlignCenter as AlignCenterIcon,
  AlignRight as AlignRightIcon,
  AlignJustify as AlignJustifyIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Table as TableIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Code as CodeIcon,
  Highlighter as HighlighterIcon,
  Calculator as CalculatorIcon,
} from "lucide-react";
// import 'katex/dist/katex.min.css';

interface EnhancedContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function EnhancedContentEditor({
  value,
  onChange,
}: EnhancedContentEditorProps) {
  const [showMathDialog, setShowMathDialog] = useState(false);
  const [mathFormula, setMathFormula] = useState("");
  const [showInlineMathDialog, setShowInlineMathDialog] = useState(false);
  const [inlineMathFormula, setInlineMathFormula] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [selectedColor, setSelectedColor] = useState("#000000");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        heading: false,
        codeBlock: false,
        link: false,
      }),
      Bold,
      Italic,
      Underline,
      Strike,
      Subscript,
      Superscript,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      BulletList,
      OrderedList,
      ListItem,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlock,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Color,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: true,
    autofocus: false,
    immediatelyRender: false,
  });

  const insertMath = useCallback(() => {
    if (editor && mathFormula.trim()) {
      const mathHTML = `<span class="math-formula" data-formula="${mathFormula}"></span>`;
      editor.chain().focus().insertContent(mathHTML).run();
      setMathFormula("");
      setShowMathDialog(false);
    }
  }, [editor, mathFormula]);

  const insertInlineMath = useCallback(() => {
    if (editor && inlineMathFormula.trim()) {
      const mathHTML = `<span class="math-formula inline" data-formula="${inlineMathFormula}"></span>`;
      editor.chain().focus().insertContent(mathHTML).run();
      setInlineMathFormula("");
      setShowInlineMathDialog(false);
    }
  }, [editor, inlineMathFormula]);

  const insertImage = useCallback(() => {
    if (editor && imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run();
      setImageUrl("");
      setImageAlt("");
      setShowImageDialog(false);
    }
  }, [editor, imageUrl, imageAlt]);

  const insertLink = useCallback(() => {
    if (editor && linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkDialog(false);
    }
  }, [editor, linkUrl]);

  const setColor = useCallback(
    (color: string) => {
      if (editor) {
        editor.chain().focus().setColor(color).run();
        setSelectedColor(color);
      }
    },
    [editor]
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg bg-background">
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1 items-center">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("bold") ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <BoldIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("italic") ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("underline") ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("strike") ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <StrikeIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r pr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="sm" variant="ghost">
                <TypeIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
              >
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
              >
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
              >
                Heading 3
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setParagraph().run()}
              >
                Paragraph
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant={
              editor.isActive({ textAlign: "left" }) ? "secondary" : "ghost"
            }
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={
              editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"
            }
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenterIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={
              editor.isActive({ textAlign: "right" }) ? "secondary" : "ghost"
            }
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRightIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={
              editor.isActive({ textAlign: "justify" }) ? "secondary" : "ghost"
            }
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          >
            <AlignJustifyIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
            onClick={() => {
              console.log("Bullet list button clicked");
              editor.chain().focus().toggleBulletList().run();
            }}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
            onClick={() => {
              console.log("Ordered list button clicked");
              editor.chain().focus().toggleOrderedList().run();
            }}
          >
            <ListOrderedIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Table */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Highlight */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("highlight") ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <HighlighterIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Code Block */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("codeBlock") ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <CodeIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Math Formula */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Dialog open={showMathDialog} onOpenChange={setShowMathDialog}>
            <DialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                title="Insert block math formula"
              >
                <CalculatorIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Mathematical Formula</DialogTitle>
                <DialogDescription>
                  Enter a LaTeX mathematical formula (displayed as a block)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="math-formula">Formula</Label>
                  <Textarea
                    id="math-formula"
                    value={mathFormula}
                    onChange={(e) => setMathFormula(e.target.value)}
                    placeholder="Enter LaTeX formula..."
                    rows={6}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  <p>Examples for block math:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>
                      <code>{"\\textbf{Where:}"}</code> - for bold text
                    </li>
                    <li>
                      <code>{"\\begin{align*} ... \\end{align*}"}</code> - for
                      aligned equations
                    </li>
                    <li>
                      <code>{"\\text{Cash flow in year } t"}</code> - for text
                      within math
                    </li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowMathDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={insertMath}>Insert Formula</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={showInlineMathDialog}
            onOpenChange={setShowInlineMathDialog}
          >
            <DialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                title="Insert inline math formula"
              >
                <TypeIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Inline Mathematical Formula</DialogTitle>
                <DialogDescription>
                  Enter a LaTeX mathematical formula (displayed inline with
                  text)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="inline-math-formula">Formula</Label>
                  <Input
                    id="inline-math-formula"
                    value={inlineMathFormula}
                    onChange={(e) => setInlineMathFormula(e.target.value)}
                    placeholder="e.g., CF_t, r, n, \alpha, \beta..."
                  />
                </div>
                <div className="text-sm text-gray-500">
                  <p>Examples for inline math:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>
                      <code>CF_t</code> - for subscript
                    </li>
                    <li>
                      <code>r</code> - for italic variable
                    </li>
                    <li>
                      <code>n</code> - for italic variable
                    </li>
                    <li>
                      <code>\alpha</code> - for Greek letters
                    </li>
                    <li>
                      <code>\beta</code> - for Greek letters
                    </li>
                  </ul>
                  <p className="mt-2 text-xs text-gray-400">
                    <strong>Note:</strong> For complex formulas with multiple
                    lines, use the calculator button (block math) instead.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowInlineMathDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={insertInlineMath}>
                  Insert Inline Formula
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Image */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="ghost">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Image</DialogTitle>
                <DialogDescription>
                  Enter the URL and alt text for the image.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="image-alt">Alt Text</Label>
                  <Input
                    id="image-alt"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Description of the image"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowImageDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={insertImage}>Insert Image</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Link */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="ghost">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Link</DialogTitle>
                <DialogDescription>
                  Enter the URL for the link.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="link-url">URL</Label>
                  <Input
                    id="link-url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowLinkDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={insertLink}>Insert Link</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Color Picker */}
        <div className="flex items-center gap-1">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded border cursor-pointer"
          />
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4">
        <EditorContent
          editor={editor}
          className="min-h-[200px] prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none"
          style={
            {
              "--tw-prose-bullets": "currentColor",
              "--tw-prose-counters": "currentColor",
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}
