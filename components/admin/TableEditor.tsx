'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Trash2
} from 'lucide-react';
import RichTextCellEditor from './RichTextCellEditor';

interface TableEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface Cell {
  value: string;
  isHeader: boolean;
}

interface TableData {
  rows: Cell[][];
  headers: string[];
}

const TableEditor = ({ value, onChange, placeholder }: TableEditorProps) => {
  const [tableData, setTableData] = useState<TableData>({
    rows: [],
    headers: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Initialize table data from value prop
  useEffect(() => {
    setIsLoading(true);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        // Ensure we have valid data structure
        if (parsed && Array.isArray(parsed.headers) && Array.isArray(parsed.rows)) {
          setTableData(parsed);
        } else {
          throw new Error('Invalid table data structure');
        }
      } catch {
        // If parsing fails, create default table
        setTableData({
          rows: [['', '', ''], ['', '', ''], ['', '', '']].map(row => 
            row.map(cell => ({ value: cell, isHeader: false }))
          ),
          headers: ['', '', '']
        });
      }
    } else {
      // Default 3x3 table with empty headers
      setTableData({
        rows: [['', '', ''], ['', '', ''], ['', '', '']].map(row => 
          row.map(cell => ({ value: cell, isHeader: false }))
        ),
        headers: ['', '', '']
      });
    }
    setIsLoading(false);
  }, [value]);

  // Update parent component when table data changes (but only when user makes changes)
  const updateParent = (newTableData: TableData) => {
    const newValue = JSON.stringify(newTableData);
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const addRow = () => {
    const newRow = tableData.headers.map(() => ({ value: '', isHeader: false }));
    const newTableData = {
      ...tableData,
      rows: [...tableData.rows, newRow]
    };
    setTableData(newTableData);
    updateParent(newTableData);
  };

  const removeRow = (rowIndex: number) => {
    if (tableData.rows.length > 1) {
      const newTableData = {
        ...tableData,
        rows: tableData.rows.filter((_, index) => index !== rowIndex)
      };
      setTableData(newTableData);
      updateParent(newTableData);
    }
  };

  const addColumn = () => {
    const newTableData = {
      headers: [...tableData.headers, ''],
      rows: tableData.rows.map(row => [...row, { value: '', isHeader: false }])
    };
    setTableData(newTableData);
    updateParent(newTableData);
  };

  const removeColumn = (colIndex: number) => {
    if (tableData.headers.length > 1) {
      const newTableData = {
        headers: tableData.headers.filter((_, index) => index !== colIndex),
        rows: tableData.rows.map(row => row.filter((_, index) => index !== colIndex))
      };
      setTableData(newTableData);
      updateParent(newTableData);
    }
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newTableData = {
      ...tableData,
      rows: tableData.rows.map((row, rIndex) =>
        rIndex === rowIndex
          ? row.map((cell, cIndex) =>
              cIndex === colIndex ? { ...cell, value } : cell
            )
          : row
      )
    };
    setTableData(newTableData);
    updateParent(newTableData);
  };

  const updateHeader = (colIndex: number, value: string) => {
    const newTableData = {
      ...tableData,
      headers: tableData.headers.map((header, index) =>
        index === colIndex ? value : header
      )
    };
    setTableData(newTableData);
    updateParent(newTableData);
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex });
    setEditingCell({ row: rowIndex, col: colIndex });
    const cellValue = rowIndex === -1 
      ? tableData.headers[colIndex] 
      : tableData.rows[rowIndex][colIndex].value;
    setEditValue(cellValue);
  };

  const handleCellDoubleClick = (rowIndex: number, colIndex: number) => {
    handleCellClick(rowIndex, colIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (editingCell) {
          // Save current edit
          if (editingCell.row === -1) {
            updateHeader(editingCell.col, editValue);
          } else {
            updateCell(editingCell.row, editingCell.col, editValue);
          }
          setEditingCell(null);
          
          // Move to next row
          if (row < tableData.rows.length - 1) {
            setSelectedCell({ row: row + 1, col });
            setEditingCell({ row: row + 1, col });
            setEditValue(tableData.rows[row + 1][col].value);
          }
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (editingCell) {
          // Save current edit
          if (editingCell.row === -1) {
            updateHeader(editingCell.col, editValue);
          } else {
            updateCell(editingCell.row, editingCell.col, editValue);
          }
          setEditingCell(null);
          
          // Move to next column
          if (col < tableData.headers.length - 1) {
            const newRow = row === -1 ? 0 : row;
            setSelectedCell({ row: newRow, col: col + 1 });
            setEditingCell({ row: newRow, col: col + 1 });
            setEditValue(tableData.rows[newRow][col + 1].value);
          }
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (row > 0) {
          setSelectedCell({ row: row - 1, col });
          setEditValue(tableData.rows[row - 1][col].value);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (row < tableData.rows.length - 1) {
          setSelectedCell({ row: row + 1, col });
          setEditValue(tableData.rows[row + 1][col].value);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (col > 0) {
          const newRow = row === -1 ? 0 : row;
          setSelectedCell({ row: newRow, col: col - 1 });
          setEditValue(tableData.rows[newRow][col - 1].value);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (col < tableData.headers.length - 1) {
          const newRow = row === -1 ? 0 : row;
          setSelectedCell({ row: newRow, col: col + 1 });
          setEditValue(tableData.rows[newRow][col + 1].value);
        }
        break;
    }
  };

  const handleEditBlur = () => {
    if (editingCell) {
      if (editingCell.row === -1) {
        updateHeader(editingCell.col, editValue);
      } else {
        updateCell(editingCell.row, editingCell.col, editValue);
      }
      setEditingCell(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Row
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addColumn}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Column
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {(tableData.headers || []).map((header, colIndex) => (
                <TableHead
                  key={colIndex}
                  className={`relative min-w-[120px] ${
                    selectedCell?.row === -1 && selectedCell?.col === colIndex
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : ''
                  }`}
                  onClick={() => handleCellClick(-1, colIndex)}
                  onDoubleClick={() => handleCellDoubleClick(-1, colIndex)}
                >
                  {editingCell?.row === -1 && editingCell?.col === colIndex ? (
                    <RichTextCellEditor
                      value={editValue}
                      onChange={setEditValue}
                      onBlur={handleEditBlur}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="min-h-[24px] flex items-center"
                      dangerouslySetInnerHTML={{ __html: header || '' }}
                    />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-4 w-4 p-0 opacity-0 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeColumn(colIndex);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(tableData.rows || []).map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={`relative min-w-[120px] ${
                      selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : ''
                    }`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                  >
                                      {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                    <RichTextCellEditor
                      value={editValue}
                      onChange={setEditValue}
                      onBlur={handleEditBlur}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="min-h-[24px] flex items-center"
                      dangerouslySetInnerHTML={{ __html: cell.value || '' }}
                    />
                  )}
                  </TableCell>
                ))}
                <TableCell className="p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 hover:opacity-100"
                    onClick={() => removeRow(rowIndex)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-500">
        <p>💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Click any cell to select it</li>
          <li>Double-click to edit cell content</li>
          <li>Use Tab to move to next column</li>
          <li>Use Enter to move to next row</li>
          <li>Use arrow keys to navigate</li>
        </ul>
      </div>
    </div>
  );
};

export default TableEditor; 