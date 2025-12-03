import React, { useState, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo, 
  Highlighter, Type, 
  ChevronDown,
  Palette,
  Keyboard
} from 'lucide-react';

export default function Toolbar({ editor, shortcuts, onOpenShortcutModal }) {
  const [, forceUpdate] = useState();

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const handleUpdate = () => forceUpdate({});
    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);
    return () => {
      if (!editor.isDestroyed) {
        editor.off('selectionUpdate', handleUpdate);
        editor.off('transaction', handleUpdate);
      }
    };
  }, [editor]);

  if (!editor || editor.isDestroyed) {
      return <div className="h-12 border-b bg-gray-50"></div>;
  }

  const run = (cb) => {
    cb(editor.chain().focus()).run();
  };

  const isActive = (type, opts) => editor.isActive(type, opts);

  // --- Components ---

  const Divider = () => <div className="h-5 w-px bg-gray-300 mx-1 self-center" />;

  const ColorPicker = ({ type, icon: Icon }) => {
    return (
      <div className="relative group flex items-center">
        <button className="p-1.5 rounded hover:bg-gray-200 text-gray-700">
           <Icon size={16} />
        </button>
        <input 
          type="color"
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          onInput={(event) => {
             if (type === 'text') {
                 run(ch => ch.setColor(event.target.value));
             } else {
                 run(ch => ch.toggleHighlight({ color: event.target.value }));
             }
          }}
        />
      </div>
    );
  };

  const FontSelector = () => (
    <div className="relative group">
       <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-200 rounded text-xs font-medium text-gray-700 w-28 justify-between">
          <span className="truncate">
            {editor.getAttributes('textStyle').fontFamily || 'Courier Prime'}
          </span>
          <ChevronDown size={12} />
       </button>
       {/* Simple Dropdown for Demo */}
       <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 shadow-lg rounded-md hidden group-hover:block z-50 py-1">
          {['Courier Prime', 'Inter', 'Times New Roman', 'Arial', 'Georgia'].map(font => (
            <button
               key={font}
               onClick={() => run(ch => ch.setFontFamily(font))}
               className="block w-full text-left px-3 py-1 text-xs hover:bg-gray-100"
               style={{ fontFamily: font }}
            >
              {font}
            </button>
          ))}
       </div>
    </div>
  );

  return (
    <div className="h-12 border-b bg-white flex items-center px-2 gap-1 shadow-sm ">
      
      {/* HISTORY */}
      <div className="flex items-center gap-0.5 mr-1">
        <ToolBtn onClick={() => run(ch => ch.undo())} icon={<Undo size={15}/>} label="Undo" />
        <ToolBtn onClick={() => run(ch => ch.redo())} icon={<Redo size={15}/>} label="Redo" />
      </div>

      <Divider />

      {/* FONT FAMILY */}
      <FontSelector />
      
      <Divider />

      {/* TEXT STYLES */}
      <div className="flex items-center gap-0.5">
        <ToolBtn 
          onClick={() => run(ch => ch.toggleBold())} 
          active={isActive('bold')} 
          icon={<Bold size={15} />} 
          label="Bold" 
        />
        <ToolBtn 
          onClick={() => run(ch => ch.toggleItalic())} 
          active={isActive('italic')} 
          icon={<Italic size={15} />} 
          label="Italic" 
        />
        <ToolBtn 
          onClick={() => run(ch => ch.toggleUnderline())} 
          active={isActive('underline')} 
          icon={<Underline size={15} />} 
          label="Underline" 
        />
         <ToolBtn 
          onClick={() => run(ch => ch.toggleStrike())} 
          active={isActive('strike')} 
          icon={<Strikethrough size={15} />} 
          label="Strike" 
        />
      </div>

      <Divider />

      {/* COLORS */}
      <div className="flex items-center gap-0.5">
        <ColorPicker type="text" icon={Palette} />
        <ColorPicker type="highlight" icon={Highlighter} />
      </div>

      <Divider />

      {/* ALIGNMENT */}
      <div className="flex items-center gap-0.5">
        <ToolBtn 
          onClick={() => run(ch => ch.setTextAlign('left'))} 
          active={isActive({ textAlign: 'left' })} 
          icon={<AlignLeft size={15} />} 
          label="Left" 
        />
        <ToolBtn 
          onClick={() => run(ch => ch.setTextAlign('center'))} 
          active={isActive({ textAlign: 'center' })} 
          icon={<AlignCenter size={15} />} 
          label="Center" 
        />
        <ToolBtn 
          onClick={() => run(ch => ch.setTextAlign('right'))} 
          active={isActive({ textAlign: 'right' })} 
          icon={<AlignRight size={15} />} 
          label="Right" 
        />
        <ToolBtn 
          onClick={() => run(ch => ch.setTextAlign('justify'))} 
          active={isActive({ textAlign: 'justify' })} 
          icon={<AlignJustify size={15} />} 
          label="Justify" 
        />
      </div>

      <div className="flex-1" />

      <Divider />
      
      {/* SETTINGS */}
       <button 
          onClick={onOpenShortcutModal}
          className="flex items-center gap-1 px-3 py-1.5 ml-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-all"
       >
          <Keyboard size={14} />
          <span>Shortcuts</span>
       </button>

    </div>
  );
}

function ToolBtn({ onClick, active, icon, label }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={label}
      className={`
        p-1.5 rounded-md transition-all flex items-center justify-center
        ${active 
          ? 'bg-blue-50 text-blue-600 shadow-inner' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
      `}
    >
      {icon}
    </button>
  );
}