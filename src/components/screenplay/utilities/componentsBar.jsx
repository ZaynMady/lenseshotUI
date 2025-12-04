import React, { useState, useEffect } from 'react';

export default function ComponentsBar({ editor, elements = [] }) {
  // 1. STATE TRICK: Force React to re-render when Tiptap changes
  const [, forceUpdate] = useState();

  useEffect(() => {
    // GUARD: Don't attach listeners to a dead editor
    if (!editor || editor.isDestroyed) return;

    const handleUpdate = () => forceUpdate({});

    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);

    return () => {
      // Safety check before unbinding
      if (!editor.isDestroyed) {
        editor.off('selectionUpdate', handleUpdate);
        editor.off('transaction', handleUpdate);
      }
    };
  }, [editor]);

  // 2. CRITICAL GUARD: If editor is null OR destroyed, do not render anything.
  if (!editor || editor.isDestroyed || !editor.view) {
      return null;
  }

  // 3. GENERIC SET NODE LOGIC
  const setNode = (nodeName) => {
    if (!editor || editor.isDestroyed) return;
    
    // Safety: ensure we are focusing before switching
    editor.chain()
      .focus()
      .clearNodes() 
      .setNode(nodeName)
      .run();
  };

  // 4. GENERIC ACTIVE CHECK
  const isActive = (nodeName) => {
    if (!editor || !editor.view || editor.isDestroyed) return false;
    return editor.isActive(nodeName);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 border-b border-gray-200">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">
        Elements
      </span>

      {elements.map((el) => (
        <ElementButton 
          key={el.node} // Unique key based on node name
          label={el.label} 
          icon={el.icon}
          isActive={isActive(el.node)}
          onClick={() => setNode(el.node)}
          shortcut={el.shortcut}
        />
      ))}
    </div>
  );
}

function ElementButton({ label, icon, isActive, onClick, shortcut }) {
  return (
    <button
      type="button" 
      onMouseDown={(e) => e.preventDefault()} 
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all
        border
        ${isActive 
          ? 'bg-white text-blue-600 border-blue-200 shadow-sm ring-1 ring-blue-100' 
          : 'bg-transparent text-gray-600 border-transparent hover:bg-gray-200 hover:text-gray-900'}
      `}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      {/* Render the icon component directly if passed as a React Element */}
      {icon} 
      <span>{label}</span>
    </button>
  );
}