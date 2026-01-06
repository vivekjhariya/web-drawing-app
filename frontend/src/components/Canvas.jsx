import React, { useRef, useEffect, useState } from 'react'
import { Palette } from 'lucide-react'

export default function Canvas({ selectedNote, currentTool, currentColor, brushSize, onSave }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [context, setContext] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      setContext(ctx)
      
      // Set canvas size
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      
      // Set default styles
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = currentColor
      ctx.lineWidth = brushSize
      
      // Load existing drawing if available
      if (selectedNote && selectedNote.content) {
        const img = new Image()
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
        }
        img.src = selectedNote.content
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [selectedNote])

  useEffect(() => {
    if (context) {
      context.strokeStyle = currentColor
      context.lineWidth = brushSize
      
      if (currentTool === 'eraser') {
        context.globalCompositeOperation = 'destination-out'
      } else {
        context.globalCompositeOperation = 'source-over'
      }
    }
  }, [currentColor, brushSize, currentTool, context])

  const getMousePos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    if (!context || !selectedNote) return
    
    setIsDrawing(true)
    const pos = getMousePos(e)
    setStartPos(pos)
    
    if (currentTool === 'pen' || currentTool === 'pencil' || currentTool === 'eraser') {
      context.beginPath()
      context.moveTo(pos.x, pos.y)
    }
  }

  const draw = (e) => {
    if (!isDrawing || !context || !selectedNote) return
    
    const pos = getMousePos(e)
    
    if (currentTool === 'pen' || currentTool === 'pencil' || currentTool === 'eraser') {
      context.lineTo(pos.x, pos.y)
      context.stroke()
    }
  }

  const stopDrawing = (e) => {
    if (!isDrawing || !context || !selectedNote) return
    
    setIsDrawing(false)
    const pos = getMousePos(e)
    
    // Draw shapes
    if (currentTool === 'line') {
      context.beginPath()
      context.moveTo(startPos.x, startPos.y)
      context.lineTo(pos.x, pos.y)
      context.stroke()
    } else if (currentTool === 'circle') {
      const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2))
      context.beginPath()
      context.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI)
      context.stroke()
    } else if (currentTool === 'rectangle') {
      context.beginPath()
      context.rect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y)
      context.stroke()
    } else if (currentTool === 'triangle') {
      context.beginPath()
      context.moveTo(startPos.x, startPos.y)
      context.lineTo(pos.x, pos.y)
      context.lineTo(startPos.x - (pos.x - startPos.x), pos.y)
      context.closePath()
      context.stroke()
    }
    
    // Auto-save after drawing
    setTimeout(() => {
      const canvas = canvasRef.current
      if (canvas) {
        const dataURL = canvas.toDataURL()
        onSave(dataURL)
      }
    }, 500)
  }

  const clearCanvas = () => {
    if (context && selectedNote) {
      const canvas = canvasRef.current
      context.clearRect(0, 0, canvas.width, canvas.height)
      onSave('')
    }
  }

  if (!selectedNote) {
    return (
      <div className="canvas-container h-full flex items-center justify-center">
        <div className="text-center">
          <Palette size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Welcome to DrawPad Pro</h3>
          <p className="text-gray-500 mb-4">Create a new drawing or select an existing one to start</p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Pen & Pencil Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Shape Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Color Palette</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="canvas-container h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="font-medium text-gray-700">
          {selectedNote.title || 'Untitled Drawing'}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div 
              className="w-4 h-4 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: currentColor }}
            ></div>
            <span>{currentTool}</span>
            <span>{brushSize}px</span>
          </div>
          <button
            onClick={clearCanvas}
            className="btn-secondary text-sm"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <canvas
          ref={canvasRef}
          className="w-full h-full border border-gray-200 rounded-lg cursor-crosshair bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  )
}
