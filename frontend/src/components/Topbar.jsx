import React from 'react'
import { Plus, Save, Sun, Moon, Palette, Download, Share } from 'lucide-react'

export default function Topbar({ selectedNote, onCreateNote, onSave, theme, setTheme }) {
  const handleSave = () => {
    if (selectedNote) {
      // Canvas save will be handled by Canvas component
      const canvas = document.querySelector('canvas')
      if (canvas) {
        const dataURL = canvas.toDataURL()
        onSave(dataURL)
      }
    }
  }

  return (
    <div className="topbar h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold gradient-text">DrawPad Pro</h1>
        </div>
        
        <div className="h-6 w-px bg-gray-300"></div>
        
        <button
          onClick={onCreateNote}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          New Drawing
        </button>
      </div>

      <div className="flex items-center gap-3">
        {selectedNote && (
          <>
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={16} />
              Save
            </button>
            
            <button className="btn-secondary flex items-center gap-2">
              <Download size={16} />
              Export
            </button>
            
            <button className="btn-secondary flex items-center gap-2">
              <Share size={16} />
              Share
            </button>
            
            <div className="h-6 w-px bg-gray-300"></div>
          </>
        )}
        
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="tool-btn"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </div>
  )
}
