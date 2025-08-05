'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough
} from 'lucide-react';

interface RichTextCellEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
}

const RichTextCellEditor = ({ 
  value, 
  onChange, 
  onBlur, 
  onKeyDown, 
  autoFocus = false 
}: RichTextCellEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

  const formatText = (format: string) => {
    if (!editorRef.current) return;
    
    // Store current selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    // Create a new range to work with
    const newRange = range.cloneRange();
    
    if (selectedText) {
      // If text is selected, wrap it with formatting
      const formattedText = getFormattedText(selectedText, format);
      newRange.deleteContents();
      const textNode = document.createTextNode(formattedText);
      newRange.insertNode(textNode);
    } else {
      // If no text selected, insert formatted text at cursor
      const formattedText = getFormattedText('Sample Text', format);
      const textNode = document.createTextNode(formattedText);
      newRange.insertNode(textNode);
    }
    
    // Update the parent component
    onChange(editorRef.current.textContent || '');
    
    // Restore focus and selection
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
        // Restore the selection
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }, 0);
  };

  const getFormattedText = (text: string, format: string): string => {
    switch (format) {
      case 'bold':
        return `**${text}**`;
      case 'italic':
        return `*${text}*`;
      case 'underline':
        return `__${text}__`;
      case 'strikethrough':
        return `~~${text}~~`;
      default:
        return text;
    }
  };

  const formatMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/~~(.*?)~~/g, '<s>$1</s>');
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.textContent || '');
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    onBlur();
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        onKeyDown={onKeyDown}
        className="min-h-[24px] px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        style={{ 
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        suppressContentEditableWarning
      >
        {value}
      </div>
      
      {/* Preview of formatted text */}
      {value && (
        <div className="mt-1 p-1 bg-gray-50 rounded text-xs">
          <div className="text-gray-500 mb-1">Preview:</div>
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(value) }}
          />
        </div>
      )}
      
      {isEditing && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-1 flex gap-1 z-50"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div 
            className="h-6 w-6 p-0 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              formatText('bold');
            }}
            title="Bold"
          >
            <Bold className="h-3 w-3" />
          </div>
          <div 
            className="h-6 w-6 p-0 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              formatText('italic');
            }}
            title="Italic"
          >
            <Italic className="h-3 w-3" />
          </div>
          <div 
            className="h-6 w-6 p-0 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              formatText('underline');
            }}
            title="Underline"
          >
            <Underline className="h-3 w-3" />
          </div>
          <div 
            className="h-6 w-6 p-0 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              formatText('strikethrough');
            }}
            title="Strikethrough"
          >
            <Strikethrough className="h-3 w-3" />
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextCellEditor; 