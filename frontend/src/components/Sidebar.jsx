import React from 'react'
import { 
  Pen, 
  Pencil, 
  Minus, 
  Circle, 
  Square, 
  Triangle, 
  Eraser,
  Type,
  Trash2,
  Star
} from 'lucide-react'

export default function Sidebar({ 
  notes, 
  selectedNote, 
  onSelectNote, 
  onDeleteNote,
  currentTool,
  setCurrentTool,
  currentColor,
  setCurrentColor,
  brushSize,
  setBrushSize
}) {
  const tools = [
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'pencil', icon: Pencil, label: 'Pencil' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'triangle', icon: Triangle, label: 'Triangle' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' }
  ]

  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe',
    '#43e97b', '#38ef7d', '#fa709a', '#fee140',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd',
    '#000000', '#ffffff', '#95a5a6', '#34495e'
  ]

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="sidebar w-80 flex flex-col">
      {/* Drawing Tools */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">DRAWING TOOLS</h3>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {tools.map(tool => {
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                onClick={() => setCurrentTool(tool.id)}
                className={`tool-btn ${currentTool === tool.id ? 'active' : ''}`}
                title={tool.label}
              >
                <Icon size={18} />
              </button>
            )
          })}
        </div>
        
        {/* Brush Size */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-600 block mb-2">
            Brush Size: {brushSize}px
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        {/* Color Palette */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-2">COLORS</label>
          <div className="grid grid-cols-5 gap-2">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`color-picker ${currentColor === color ? 'ring-2 ring-blue-500' : ''}`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">
            MY DRAWINGS ({notes.length})
          </h3>
          
          <div className="space-y-2">
            {notes.map(note => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className={`card p-3 cursor-pointer transition-all hover:shadow-lg ${
                  selectedNote?.id === note.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm truncate flex-1">
                    {note.title || 'Untitled Drawing'}
                  </h4>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button className="p-1 rounded hover:bg-gray-100">
                      <Star size={12} className={note.is_favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteNote(note.id)
                      }}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <Trash2 size={12} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 flex items-center justify-between">
                  <span>{formatDate(note.updated_at || note.created_at)}</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    {note.folder}
                  </span>
                </div>
              </div>
            ))}
            
            {notes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Palette size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No drawings yet</p>
                <p className="text-xs mt-1">Create your first drawing to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
