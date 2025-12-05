import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bold, Italic, Underline, Strikethrough, RemoveFormatting,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered,
  Undo, Redo, 
  Highlighter, 
  ChevronDown,
  Palette,
  Keyboard
} from 'lucide-react';

export default function Toolbar({ editor, onOpenShortcutModal }) {
  const [, forceUpdate] = useState();

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const handleUpdate = () => forceUpdate({});
    
    // Listen to all relevant events
    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);
    editor.on('update', handleUpdate);

    return () => {
      if (!editor.isDestroyed) {
        editor.off('selectionUpdate', handleUpdate);
        editor.off('transaction', handleUpdate);
        editor.off('update', handleUpdate);
      }
    };
  }, [editor]);

  if (!editor || editor.isDestroyed) {
      return <div className="h-12 border-b bg-gray-50/50"></div>;
  }

  // Helper to run commands and keep focus
  const run = (cb) => {
    cb(editor.chain().focus()).run();
  };

  const isActive = (type, opts) => editor.isActive(type, opts);

  // --- COMPONENT: Color Picker (Ref-based) ---
  const ColorPicker = ({ type, icon: Icon, title }) => {
    const inputRef = useRef(null);
    const isText = type === 'text';
    
    // Safety check: Ensure TextStyle is loaded, otherwise getAttributes might fail
    const currentAttributes = editor.getAttributes(isText ? 'textStyle' : 'highlight');
    const currentColor = currentAttributes?.color;

    const handleColorChange = (e) => {
        const color = e.target.value;
        // 1. Restore focus immediately
        editor.chain().focus(); 
        
        // 2. Apply the color
        if (isText) {
            editor.chain().focus().setColor(color).run();
        } else {
            editor.chain().focus().toggleHighlight({ color: color }).run();
        }
    };

    return (
      <div className="relative flex items-center justify-center">
        {/* The Visible Button */}
        <button 
            type="button"
            onClick={() => inputRef.current?.click()} // Trigger the hidden input
            className="p-1.5 rounded-md hover:bg-gray-200 text-gray-700 transition-colors relative overflow-hidden flex items-center justify-center"
            title={title}
        >
           <Icon size={16} />
           <div 
             className="absolute bottom-1 left-1.5 right-1.5 h-0.5 rounded-full" 
             style={{ backgroundColor: currentColor || (isText ? '#000' : 'transparent') }}
           />
        </button>

        {/* The Hidden Input */}
        <input 
          ref={inputRef}
          type="color"
          className="invisible absolute w-0 h-0 overflow-hidden" // Completely hidden from layout
          value={currentColor || '#000000'}
          onInput={handleColorChange} // onInput fires immediately (smoother than onChange)
        />
      </div>
    );
  };

  // --- COMPONENT: Font Selector (Portal) ---
  const FontSelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const toggleOpen = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 5, 
                left: rect.left
            });
        }
        setIsOpen(!isOpen);
    };

    const handleSelectFont = (font) => {
        // 1. Apply font
        editor.chain().focus().setFontFamily(font).run();
        // 2. Close menu
        setIsOpen(false);
    };

    // Get current font (defaults to first in list if not set)
    const currentFont = editor.getAttributes('textStyle')?.fontFamily;

    return (
      <>
        <button 
          ref={buttonRef}
          onClick={toggleOpen}
          type="button"
          className={`flex items-center gap-2 px-2 py-1.5 hover:bg-gray-200 rounded-md text-xs font-medium text-gray-700 w-32 justify-between border transition-all ${isOpen ? 'bg-gray-200 border-gray-300' : 'border-transparent'}`}
          title="Font Family"
        >
          <span className="truncate">
            {currentFont || 'Courier Prime'}
          </span>
          <ChevronDown size={12} className="text-gray-400" />
        </button>
        
        {isOpen && createPortal(
            <>
                <div 
                    className="fixed inset-0 z-[9998]" 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                    }} 
                />
                
                <div 
                    className="fixed bg-white border border-gray-200 shadow-xl rounded-lg z-[9999] py-1 overflow-auto w-40 max-h-60 flex flex-col"
                    style={{ top: coords.top, left: coords.left }}
                >
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Serif</div>
                    {['Courier New', 'Courier Prime', 'Times New Roman', 'Georgia'].map(font => (
                        <FontItem 
                            key={font} 
                            font={font} 
                            current={currentFont} 
                            onClick={() => handleSelectFont(font)} 
                        />
                    ))}
                    <div className="h-px bg-gray-100 my-1"></div>
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sans Serif</div>
                    {['Inter', 'Arial', 'Helvetica'].map(font => (
                        <FontItem 
                            key={font} 
                            font={font} 
                            current={currentFont} 
                            onClick={() => handleSelectFont(font)} 
                        />
                    ))}
                </div>
            </>,
            document.body
        )}
      </>
    );
  };

  // --- Sub-components Helper ---
  const ToolbarGroup = ({ children }) => (
    <div className="flex items-center gap-0.5 p-1 bg-gray-100/50 rounded-lg border border-gray-100 mx-1">
      {children}
    </div>
  );

  const Divider = () => <div className="h-6 w-px bg-gray-200 mx-1 self-center" />;

  return (
    <div className="h-14 border-b bg-white flex items-center px-4 gap-1 shadow-sm overflow-x-auto scrollbar-hide w-full relative z-10">
      
      <ToolbarGroup>
        <ToolBtn onClick={() => run(ch => ch.undo())} disabled={!editor.can().undo()} icon={<Undo size={15}/>} label="Undo" />
        <ToolBtn onClick={() => run(ch => ch.redo())} disabled={!editor.can().redo()} icon={<Redo size={15}/>} label="Redo" />
      </ToolbarGroup>

      <Divider />

      <div className="flex items-center gap-1 mx-1">
        <FontSelector />
        <div className="flex items-center bg-gray-100/50 rounded-lg border border-gray-100 p-0.5">
            <ColorPicker type="text" icon={Palette} title="Text Color" />
            <ColorPicker type="highlight" icon={Highlighter} title="Highlight Color" />
        </div>
      </div>
      
      <Divider />

      <ToolbarGroup>
        <ToolBtn onClick={() => run(ch => ch.toggleBold())} active={isActive('bold')} icon={<Bold size={15} />} label="Bold" />
        <ToolBtn onClick={() => run(ch => ch.toggleItalic())} active={isActive('italic')} icon={<Italic size={15} />} label="Italic" />
        <ToolBtn onClick={() => run(ch => ch.toggleUnderline())} active={isActive('underline')} icon={<Underline size={15} />} label="Underline" />
         <ToolBtn onClick={() => run(ch => ch.toggleStrike())} active={isActive('strike')} icon={<Strikethrough size={15} />} label="Strikethrough" />
        <ToolBtn onClick={() => run(ch => ch.unsetAllMarks().clearNodes())} icon={<RemoveFormatting size={15} />} label="Clear" className="text-red-500 hover:bg-red-50" />
      </ToolbarGroup>

      <Divider />

      <ToolbarGroup>
        <ToolBtn onClick={() => run(ch => ch.setTextAlign('left'))} active={isActive({ textAlign: 'left' })} icon={<AlignLeft size={15} />} label="Left" />
        <ToolBtn onClick={() => run(ch => ch.setTextAlign('center'))} active={isActive({ textAlign: 'center' })} icon={<AlignCenter size={15} />} label="Center" />
        <ToolBtn onClick={() => run(ch => ch.setTextAlign('right'))} active={isActive({ textAlign: 'right' })} icon={<AlignRight size={15} />} label="Right" />
        <ToolBtn onClick={() => run(ch => ch.setTextAlign('justify'))} active={isActive({ textAlign: 'justify' })} icon={<AlignJustify size={15} />} label="Justify" />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolBtn onClick={() => run(ch => ch.toggleBulletList())} active={isActive('bulletList')} icon={<List size={15} />} label="Bullets" />
        <ToolBtn onClick={() => run(ch => ch.toggleOrderedList())} active={isActive('orderedList')} icon={<ListOrdered size={15} />} label="Numbered" />
      </ToolbarGroup>

      <div className="flex-1" />

       <button onClick={onOpenShortcutModal} className="flex items-center gap-2 px-3 py-1.5 ml-1 text-xs font-medium text-gray-500 bg-white hover:bg-gray-50 rounded-full border border-gray-200 transition-all hover:shadow-sm">
          <Keyboard size={14} />
          <span className="hidden lg:inline">Shortcuts</span>
       </button>
    </div>
  );
}

function ToolBtn({ onClick, active, disabled, icon, label, className }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`
        p-1.5 rounded-md transition-all flex items-center justify-center
        ${active ? 'bg-blue-100 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}
        ${disabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''}
        ${className || ''}
      `}
    >
      {icon}
    </button>
  );
}

function FontItem({ font, current, onClick }) {
    // Normalizing fonts to handle quotes vs no-quotes issues
    const normalize = (f) => f?.replace(/['"]/g, '');
    const isSelected = normalize(current) === normalize(font);

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation(); // Stop portal click from closing immediately
                onClick();
            }}
            className={`block w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between
                ${isSelected ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'}
            `}
            style={{ fontFamily: font }}
        >
            {font}
            {isSelected && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
        </button>
    )
}