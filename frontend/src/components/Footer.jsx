import React from 'react'
import { Heart, Palette, Zap, Shield } from 'lucide-react'

export default function Footer() {
  return (
    <div className="footer h-12 flex items-center justify-between px-6 text-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-500">
          <span>Made with</span>
          <Heart size={14} className="text-red-500 fill-current animate-pulse" />
          <span>by DrawPad Pro</span>
        </div>
        
        <div className="h-4 w-px bg-gray-300"></div>
        
        <div className="flex items-center gap-4 text-gray-400">
          <div className="flex items-center gap-1">
            <Palette size={14} />
            <span>Advanced Drawing</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={14} />
            <span>Auto-Save</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield size={14} />
            <span>Secure</span>
          </div>
        </div>
      </div>
      
      <div className="text-gray-400">
        <span>v1.0.0 • Ready to create amazing drawings!</span>
      </div>
    </div>
  )
}
