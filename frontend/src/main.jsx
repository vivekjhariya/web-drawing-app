import React, { useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function DrawingCanvas({ tool, color, textStyle, onSave, selectedNote, canvasHeight }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [isTyping, setIsTyping] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [textPos, setTextPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Load existing drawing if available
    if (selectedNote && selectedNote.content && selectedNote.content.startsWith('data:image')) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
      }
      img.src = selectedNote.content
    }
  }, [selectedNote])

  const getMousePos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    const pos = getMousePos(e)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (tool === 'text') {
      setTextPos(pos)
      setIsTyping(true)
      setTextInput('')
      return
    }
    
    setIsDrawing(true)
    setStartPos(pos)
    
    ctx.strokeStyle = color
    ctx.fillStyle = color
    
    if (tool === 'pen') {
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    } else if (tool === 'pencil') {
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    } else if (tool === 'eraser') {
      ctx.lineWidth = 20
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }
  }

  const draw = (e) => {
    if (!isDrawing) return
    
    const pos = getMousePos(e)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (tool === 'pen' || tool === 'pencil' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }
  }

  const stopDrawing = (e) => {
    if (!isDrawing) return
    
    const pos = getMousePos(e)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (tool === 'line') {
      ctx.lineWidth = 2
      ctx.strokeStyle = color
      ctx.beginPath()
      ctx.moveTo(startPos.x, startPos.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2))
      ctx.lineWidth = 2
      ctx.strokeStyle = color
      ctx.beginPath()
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI)
      ctx.stroke()
    } else if (tool === 'rectangle') {
      const width = pos.x - startPos.x
      const height = pos.y - startPos.y
      ctx.lineWidth = 2
      ctx.strokeStyle = color
      ctx.strokeRect(startPos.x, startPos.y, width, height)
    } else if (tool === 'triangle') {
      ctx.lineWidth = 2
      ctx.strokeStyle = color
      ctx.beginPath()
      ctx.moveTo(startPos.x, startPos.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.lineTo(startPos.x - (pos.x - startPos.x), pos.y)
      ctx.closePath()
      ctx.stroke()
    }
    
    setIsDrawing(false)
    ctx.globalCompositeOperation = 'source-over'
    
    setTimeout(() => {
      const imageData = canvas.toDataURL()
      onSave(imageData)
    }, 100)
  }

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      setIsTyping(false)
      return
    }
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    let fontWeight = textStyle.bold ? 'bold' : 'normal'
    let fontStyle = textStyle.italic ? 'italic' : 'normal'
    ctx.font = `${fontStyle} ${fontWeight} 18px Poppins`
    ctx.fillStyle = color
    ctx.fillText(textInput, textPos.x, textPos.y)
    
    setIsTyping(false)
    setTextInput('')
    
    setTimeout(() => {
      const imageData = canvas.toDataURL()
      onSave(imageData)
    }, 100)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    onSave(canvas.toDataURL())
  }

  return (
    <div className="canvas-wrapper">
      <div className="canvas-controls mb-4 flex gap-2">
        <button onClick={clearCanvas} className="btn-secondary text-sm">
          🗑️ Clear
        </button>
        <span className="text-sm text-gray-500 flex items-center">
          Tool: {tool} | Color: {color}
        </span>
      </div>
      
      <div className="canvas-area" style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={canvasHeight}
          className="drawing-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        
        {isTyping && (
          <div 
            className="text-input-overlay"
            style={{ 
              position: 'absolute',
              left: textPos.x + 'px', 
              top: textPos.y + 'px',
              zIndex: 10
            }}
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTextSubmit()
                }
                if (e.key === 'Escape') {
                  setIsTyping(false)
                  setTextInput('')
                }
              }}
              onBlur={handleTextSubmit}
              className="text-input"
              placeholder="Type text..."
              autoFocus
              style={{
                position: 'absolute',
                background: 'white',
                border: '2px solid #667eea',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '16px',
                fontFamily: 'Poppins',
                outline: 'none',
                minWidth: '100px'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [currentTool, setCurrentTool] = useState('pen')
  const [currentColor, setCurrentColor] = useState('#000000')
  const [theme, setTheme] = useState('light')
  const [canvasHeight, setCanvasHeight] = useState(600)
  const [textStyle, setTextStyle] = useState({ bold: false, italic: false })
  const [showAbout, setShowAbout] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      const response = await fetch('/api/notes/')
      const data = await response.json()
      setNotes(data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
      setNotes([])
    }
  }

  const createNote = async () => {
    try {
      const response = await fetch('/api/notes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Drawing',
          content: '',
          folder: 'General'
        })
      })
      const newNote = await response.json()
      setNotes([newNote, ...notes])
      setSelectedNote(newNote)
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  const saveDrawing = async (imageData) => {
    if (!selectedNote || !imageData) return
    
    try {
      const response = await fetch(`/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedNote,
          content: imageData
        })
      })
      
      if (response.ok) {
        // Update the note in the list
        setNotes(notes.map(note => 
          note.id === selectedNote.id 
            ? { ...note, content: imageData, updated_at: new Date().toISOString() }
            : note
        ))
        // Update selected note
        setSelectedNote({ ...selectedNote, content: imageData, updated_at: new Date().toISOString() })
        console.log('Drawing saved successfully!')
      }
    } catch (error) {
      console.error('Error saving drawing:', error)
    }
  }

  const tools = [
    { id: 'pen', label: 'Pen', emoji: '🖊️' },
    { id: 'pencil', label: 'Pencil', emoji: '✏️' },
    { id: 'line', label: 'Line', emoji: '📏' },
    { id: 'circle', label: 'Circle', emoji: '⭕' },
    { id: 'rectangle', label: 'Rectangle', emoji: '⬜' },
    { id: 'triangle', label: 'Triangle', emoji: '🔺' },
    { id: 'text', label: 'Text', emoji: '📝' },
    { id: 'eraser', label: 'Eraser', emoji: '🧽' }
  ]

  const colors = [
    '#000000', '#667eea', '#f093fb', '#43e97b', 
    '#ff6b6b', '#4facfe', '#feca57', '#ff9ff3',
    '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
    '#10ac84', '#ee5a24', '#0abde3', '#3742fa'
  ]

  return (
    <div className="flex flex-col h-screen">
      {/* Topbar */}
      <div className="topbar h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🎨</span>
            </div>
            <h1 className="text-xl font-bold gradient-text">DrawPad Pro</h1>
          </div>
          <button onClick={createNote} className="btn-primary flex items-center gap-2">
            ➕ New Drawing
          </button>
        </div>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="btn-secondary"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button
          onClick={() => setShowAbout(true)}
          className="btn-secondary"
          title="About"
        >
          ℹ️
        </button>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="sidebar w-80 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold mb-3">DRAWING TOOLS</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setCurrentTool(tool.id)}
                  className={`tool-btn ${currentTool === tool.id ? 'active' : ''}`}
                  title={tool.label}
                >
                  {tool.emoji}
                </button>
              ))}
            </div>
            
            <div className="mb-4">
              <label className="text-xs font-medium block mb-2">COLORS</label>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={`color-picker ${currentColor === color ? 'ring-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            
            {currentTool === 'text' && (
              <div className="mb-4">
                <label className="text-xs font-medium block mb-2">TEXT STYLE</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTextStyle({...textStyle, bold: !textStyle.bold})}
                    className={`text-style-btn ${textStyle.bold ? 'active' : ''}`}
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    onClick={() => setTextStyle({...textStyle, italic: !textStyle.italic})}
                    className={`text-style-btn ${textStyle.italic ? 'active' : ''}`}
                  >
                    <em>I</em>
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="text-xs font-medium block mb-2">CANVAS HEIGHT</label>
              <input
                type="range"
                min="400"
                max="1000"
                value={canvasHeight}
                onChange={(e) => setCanvasHeight(parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{canvasHeight}px</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold mb-3">
              MY DRAWINGS ({notes.length})
            </h3>
            
            <div className="space-y-2">
              {notes.map(note => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`card p-3 cursor-pointer ${
                    selectedNote?.id === note.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <h4 className="font-medium text-sm">
                    {note.title || 'Untitled Drawing'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              
              {notes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-3">🎨</div>
                  <p className="text-sm">No drawings yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Canvas Area */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="canvas-container">
            {selectedNote ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {selectedNote.title || 'Untitled Drawing'}
                  </h3>
                  <button 
                    onClick={() => {
                      const canvas = document.querySelector('.drawing-canvas')
                      if (canvas) saveDrawing(canvas.toDataURL())
                    }}
                    className="btn-primary text-sm"
                  >
                    💾 Save
                  </button>
                </div>
                <DrawingCanvas 
                  tool={currentTool}
                  color={currentColor}
                  textStyle={textStyle}
                  canvasHeight={canvasHeight}
                  selectedNote={selectedNote}
                  onSave={saveDrawing}
                />
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-lg font-semibold mb-2">Welcome to DrawPad Pro</h3>
                <p className="text-gray-500 mb-4">Create a new drawing to get started</p>
                <button onClick={createNote} className="btn-primary">
                  Create Your First Drawing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="footer h-12 flex items-center justify-center px-6 text-sm">
        <div className="flex items-center gap-2">
          <span>Made with</span>
          <span className="text-red-500 animate-pulse">❤️</span>
          <span className="font-bold">VJ</span>
        </div>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold gradient-text">About DrawPad Pro</h2>
              <button onClick={() => setShowAbout(false)} className="text-2xl">×</button>
            </div>
            
            <div className="space-y-3">
              <div className="text-center mb-4">
                <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-2xl">🎨</span>
                </div>
                <h3 className="font-bold text-lg">DrawPad Pro v1.0</h3>
                <p className="text-sm text-gray-500">Advanced Drawing Application</p>
              </div>
              
              <div className="border-t pt-3">
                <h4 className="font-semibold mb-2">👨‍💻 Developer</h4>
                <p><strong>Name:</strong> Vivek Jhariya</p>
                <p><strong>Mobile:</strong> +91 6261964512</p>
                <p><strong>Email:</strong> vivekjhariya241@gmail.com</p>
              </div>
              
              <div className="border-t pt-3">
                <h4 className="font-semibold mb-2">📅 Project Info</h4>
                <p><strong>Created:</strong> January 2026</p>
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Technology:</strong> React + FastAPI + MySQL</p>
              </div>
              
              <div className="border-t pt-3">
                <h4 className="font-semibold mb-2">✨ Features</h4>
                <ul className="text-sm space-y-1">
                  <li>• 8 Drawing Tools (Pen, Pencil, Shapes, Text, Eraser)</li>
                  <li>• 16 Color Palette</li>
                  <li>• Bold & Italic Text Support</li>
                  <li>• Adjustable Canvas Size</li>
                  <li>• Dark/Light Theme</li>
                  <li>• Auto-save Functionality</li>
                  <li>• Responsive Design</li>
                </ul>
              </div>
              
              <div className="text-center pt-3 border-t">
                <p className="text-sm text-gray-500">
                  Made with ❤️ by <strong>VJ</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
