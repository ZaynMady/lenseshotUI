// src/components/desktop/Window.jsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Draggable from 'react-draggable';
import { Resizable } from 're-resizable';
import { X, Minus, Square, Maximize2 } from 'lucide-react';

export default function Window({ title, onClose, onMinimize, children }) {
  const [isMaximized, setIsMaximized] = useState(false);
  const nodeRef = useRef(null); // Ref for the draggable element

  const toggleMaximize = () => setIsMaximized(!isMaximized);

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".window-handle" // Drag only from title bar
      disabled={isMaximized}  // Disable drag when full screen
      position={isMaximized ? { x: 0, y: 0 } : undefined} // Force top-left when maximized
      // We set a default position so it doesn't spawn off-screen
      defaultPosition={{x: 100, y: 50}}
    >
      {/* 1. THE DRAGGABLE WRAPPER (Catches the x/y transform) */}
      <div 
        ref={nodeRef} 
        className={`absolute z-40 flex flex-col ${isMaximized ? 'inset-0 w-full h-full !transform-none' : ''}`}
        // If maximized, we force fixed positioning to cover the screen
        style={isMaximized ? { position: 'fixed', top: 0, left: 0 } : { position: 'absolute' }} 
      >
        
        {/* 2. THE ANIMATION WRAPPER (Catches the scale/opacity) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col h-full shadow-2xl rounded-lg overflow-hidden bg-white border border-gray-300"
        >
          
          {/* 3. THE RESIZABLE WRAPPER */}
          <Resizable
            size={isMaximized ? { width: '100vw', height: '100vh' } : undefined}
            defaultSize={{ width: 800, height: 600 }}
            minWidth={320}
            minHeight={200}
            enable={isMaximized ? false : undefined} // Disable resize handles when maximized
            className="flex flex-col"
          >
              
              {/* --- TITLE BAR --- */}
              <div 
                className="window-handle h-10 bg-gray-100 border-b flex items-center justify-between px-4 select-none cursor-default shrink-0"
                onDoubleClick={toggleMaximize}
              >
                <div className="flex items-center gap-2 opacity-70">
                   <span className="text-sm font-semibold text-gray-700">{title}</span>
                </div>

                <div className="flex items-center gap-2" onPointerDownCapture={e => e.stopPropagation()}>
                  <button onClick={onMinimize} className="p-1 hover:bg-gray-200 rounded text-gray-500">
                    <Minus size={14} />
                  </button>
                  <button onClick={toggleMaximize} className="p-1 hover:bg-gray-200 rounded text-gray-500">
                    {isMaximized ? <Maximize2 size={14} /> : <Square size={14} />}
                  </button>
                  <button onClick={onClose} className="p-1 hover:bg-red-500 hover:text-white rounded text-gray-500">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* --- APP CONTENT --- */}
              <div className="flex-1 overflow-hidden relative bg-gray-50">
                {children}
              </div>

          </Resizable>
        </motion.div>
      </div>
    </Draggable>
  );
}