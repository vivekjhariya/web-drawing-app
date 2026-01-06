import React, { useState, useEffect, useRef } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean']
  ]
}

const formats = [
  'header', 'bold', 'italic', 'underline',
  'color', 'background', 'list', 'bullet',
  'blockquote', 'code-block', 'link'
]

export default function Editor({ note, onUpdateNote }) {
  const [content, setContent] = useState('')
  const saveTimeoutRef = useRef(null)

  useEffect(() => {
    if (note) {
      setContent(note.content || '')
    }
  }, [note])

  const handleContentChange = (value) => {
    setContent(value)
    
    // Auto-save after 1 second of inactivity
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (note && value !== note.content) {
        onUpdateNote(note.id, { content: value })
      }
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  if (!note) {
    return null
  }

  return (
    <div className="h-full">
      <ReactQuill
        theme="snow"
        value={content}
        onChange={handleContentChange}
        modules={modules}
        formats={formats}
        placeholder="Start writing..."
        style={{ height: '100%' }}
      />
    </div>
  )
}
