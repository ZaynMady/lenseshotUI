import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Draggable from 'react-draggable';
import { Resizable } from 're-resizable';
import { X, Minus, Square, Maximize2 } from 'lucide-react';

export default function Window({ 
  title, 
  onClose, 
  onMinimize, 
  onFocus, 
  zIndex, 
  isMinimized, 
  children 
}) {
  const [isMaximized, setIsMaximized] = useState(false);
  const nodeRef = useRef(null); 

  const toggleMaximize = () => setIsMaximized(!isMaximized);

  // Focus window on mount
  useEffect(() => {
    if (onFocus) onFocus();
  }, []);

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".window-handle"
      disabled={isMaximized}
      position={isMaximized ? { x: 0, y: 0 } : undefined}
      defaultPosition={{x: 100, y: 50}}
      onStart={onFocus}
    >
      {/* WRAPPER DIV 
         changed onMouseDownCapture -> onMouseDown to allow children to stopPropagation
      */}
      <div 
        ref={nodeRef} 
        onMouseDown={onFocus} 
        className={`absolute flex flex-col ${isMaximized ? 'inset-0 w-full h-full !transform-none' : ''}`}
        style={{ 
            position: isMaximized ? 'fixed' : 'absolute', 
            top: isMaximized ? 0 : undefined, 
            left: isMaximized ? 0 : undefined,
            zIndex: zIndex,
            display: isMinimized ? 'none' : 'flex' 
        }} 
      >
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col h-full shadow-2xl rounded-lg overflow-hidden bg-white border border-gray-300"
        >
          
          <Resizable
            size={isMaximized ? { width: '100vw', height: '100vh' } : undefined}
            defaultSize={{ width: 900, height: 650 }}
            minWidth={320}
            minHeight={200}
            enable={isMaximized ? false : undefined} 
            className="flex flex-col h-full"
          >
              
              {/* --- TITLE BAR --- */}
              <div 
                className="window-handle h-10 bg-gray-100 border-b flex items-center justify-between px-4 select-none cursor-default shrink-0"
                onDoubleClick={toggleMaximize}
              >
                <div className="flex items-center gap-2 opacity-70">
                   <span className="text-sm font-semibold text-gray-700">{title}</span>
                </div>

                <div 
                  className="flex items-center gap-2" 
                  onPointerDownCapture={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); onMinimize(); }} 
                    className="p-1 hover:bg-gray-200 rounded text-gray-500" 
                    aria-label='minimize' 
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Minus size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleMaximize(); }} 
                    className="p-1 hover:bg-gray-200 rounded text-gray-500" 
                    aria-label='maximize' 
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {isMaximized ? <Maximize2 size={14} /> : <Square size={14} />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onClose(); }} 
                    className="p-1 hover:bg-red-500 hover:text-white rounded text-gray-500" 
                    aria-label='close' 
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* --- APP CONTENT --- */}
              <div className="flex-1 overflow-hidden relative bg-gray-50 flex flex-col">
                {children}
              </div>

          </Resizable>
        </motion.div>
      </div>
    </Draggable>
  );
}