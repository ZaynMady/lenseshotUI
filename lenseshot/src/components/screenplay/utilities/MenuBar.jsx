

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Save, Download, 
  Undo, Redo, Scissors, Copy, Clipboard,
  Check, Layout, Hash, Eye, 
  Settings, HelpCircle, Keyboard
} from 'lucide-react';

import { Maximize, Minimize } from 'lucide-react';

export default function MenuBar({ 
  editor, 
  fileName = "Draft 1.pdf",
  viewMode, 
  setViewMode, 
  showSceneNumbers, 
  toggleSceneNumbers, 
  onOpenTemplates,
  isFocusMode,      // <--- New Prop
  onToggleFocus,    // <--- New Prop
  onOpenShortcuts
}) {
  
  // Helper to run editor commands safely
  const run = (cb) => {
    if (editor) cb(editor.chain().focus()).run();
  };

  return (
    <div className="h-8 bg-white border-b border-red-100 flex items-center px-4 gap-2 text-xs select-none flex-none text-gray-600 relative z-50">
      
      {/* BRANDING */}
      <span className="font-bold text-red-600 mr-2 tracking-tight">TypeWriter</span>

      {/* --- MENUS --- */}

      {/* FILE */}
      <MenuDropdown label="File">
        <MenuItem icon={FileText} label="New Script" onClick={() => console.log('New')} />
        <MenuItem icon={Save} label="Save Draft" shortcut="Cmd+S" onClick={() => console.log('Save')} />
        <div className="my-1 border-b border-gray-100" />
        <MenuItem icon={Download} label="Export to PDF" onClick={() => console.log('PDF')} />
        <MenuItem icon={Download} label="Export to JSON" onClick={() => console.log('JSON')} />
      </MenuDropdown>

      {/* EDIT */}
      <MenuDropdown label="Edit">
        <MenuItem icon={Undo} label="Undo" shortcut="Cmd+Z" onClick={() => run(ch => ch.undo())} />
        <MenuItem icon={Redo} label="Redo" shortcut="Cmd+Shift+Z" onClick={() => run(ch => ch.redo())} />
        <div className="my-1 border-b border-gray-100" />
        {/* Note: Browser security often blocks programmatic Cut/Copy/Paste, but we can list them for shortcuts */}
        <MenuItem icon={Scissors} label="Cut" shortcut="Cmd+X" disabled />
        <MenuItem icon={Copy} label="Copy" shortcut="Cmd+C" disabled />
        <MenuItem icon={Clipboard} label="Paste" shortcut="Cmd+V" disabled />
      </MenuDropdown>

      {/* VIEW */}
      <MenuDropdown label="View">
         <MenuItem 
            label="Document View" 
            checkable 
            checked={viewMode === 'document'} 
            onClick={() => setViewMode('document')} 
          />
          <MenuItem 
            label="Scene View" 
            checkable 
            checked={viewMode === 'scene'} 
            onClick={() => setViewMode('scene')} 
          />
          <div className="my-1 border-b border-gray-100" /> {/* Separator */}

          <MenuItem 
            label="Focus Mode" 
            icon={isFocusMode ? Minimize : Maximize}
            shortcut="Cmd+Shift+F"
            checkable 
            checked={isFocusMode} 
            onClick={onToggleFocus} 
          />
      </MenuDropdown>

      {/* FORMAT */}
      <MenuDropdown label="Format">
        <MenuItem 
            label="Scene Numbering" 
            icon={Hash}
            checkable 
            checked={showSceneNumbers} 
            onClick={toggleSceneNumbers} 
        />
        <div className="my-1 border-b border-gray-100" />
        <MenuItem 
            label="Change Template..." 
            icon={Layout} 
            onClick={onOpenTemplates} 
        />
      </MenuDropdown>

      {/* TOOLS */}
      <MenuDropdown label="Tools">
        <MenuItem icon={Settings} label="Preferences" onClick={() => {}} />
        <MenuItem icon={Eye} label="Focus Mode" onClick={() => {}} />
      </MenuDropdown>

      {/* HELP */}
      <MenuDropdown label="Help">
        <MenuItem icon={Keyboard} label="Keyboard Shortcuts" onClick={onOpenShortcuts} />
        <MenuItem icon={HelpCircle} label="About TypeWriter" onClick={() => {}} />
      </MenuDropdown>

      {/* SPACER */}
      <div className="flex-1"></div>

      {/* FILE STATUS */}
      <span className="text-gray-400 italic text-[11px] font-medium">{fileName}</span>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function MenuDropdown({ label, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
            px-2 py-1 rounded transition-colors
            ${isOpen ? 'bg-red-50 text-red-700' : 'hover:bg-red-50 hover:text-red-700'}
        `}
      >
        {label}
      </button>
      
      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 shadow-xl rounded-md z-[100] py-1 flex flex-col">
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({ onClick, label, icon: Icon, checkable, checked, shortcut, disabled }) {
    return (
      <button
        onClick={() => {
            if (!disabled && onClick) onClick();
        }}
        disabled={disabled}
        className={`
            text-left px-3 py-1.5 text-xs flex items-center gap-2 w-full
            ${disabled ? 'opacity-50 cursor-default' : 'hover:bg-red-50 hover:text-red-900 text-gray-700'}
        `}
      >
        {/* Icon / Check Area (Fixed Width for alignment) */}
        <div className="w-4 h-4 flex items-center justify-center flex-none text-red-500">
          {checkable && checked && <Check size={13} strokeWidth={3} />}
          {Icon && !checkable && <Icon size={14} />}
        </div>

        {/* Label */}
        <span className="flex-1 truncate">{label}</span>

        {/* Shortcut Hint */}
        {shortcut && (
            <span className="text-[10px] text-gray-400 font-mono ml-2">{shortcut}</span>
        )}
      </button>
    );
  }