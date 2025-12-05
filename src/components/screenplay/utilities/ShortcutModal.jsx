import React, { useState, useEffect } from 'react';
import { X, Keyboard, ArrowRight, CornerDownLeft } from 'lucide-react';

export default function ShortcutModal({ isOpen, onClose, shortcuts, flows, onSaveShortcuts, onSaveFlows, nodeOptions }) {
  const [activeTab, setActiveTab] = useState('shortcuts');
  const [tempShortcuts, setTempShortcuts] = useState(shortcuts);
  const [tempFlows, setTempFlows] = useState(flows);
  const [listeningKey, setListeningKey] = useState(null);

  // Sync state when opening
  useEffect(() => {
    if (isOpen) {
        setTempShortcuts(shortcuts);
        setTempFlows(flows);
    }
  }, [isOpen, shortcuts, flows]);

  // Capture keystrokes for Shortcuts tab
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!listeningKey) return;
      e.preventDefault();
      e.stopPropagation();

      const modifiers = [];
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.metaKey) modifiers.push('Cmd');
      if (e.altKey) modifiers.push('Alt');
      if (e.shiftKey) modifiers.push('Shift');
      
      if (['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) return;

      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      const combo = [...modifiers, key].join('+');

      setTempShortcuts(prev => ({ ...prev, [listeningKey]: combo }));
      setListeningKey(null);
    };

    if (listeningKey) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listeningKey]);

  // Handle flow changes
  const handleFlowChange = (nodeType, trigger, targetType) => {
      setTempFlows(prev => ({
          ...prev,
          [nodeType]: {
              ...(prev[nodeType] || {}), // Handle case where nodeType doesn't exist yet
              [trigger]: targetType
          }
      }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] overflow-hidden border border-red-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-red-600 px-4 py-3 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Keyboard size={18} />
            <span>Editor Configuration</span>
          </div>
          <button onClick={onClose} className="text-red-100 hover:text-white transition-colors" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 shrink-0">
            <button 
                onClick={() => setActiveTab('shortcuts')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'shortcuts' ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                Key Bindings
            </button>
            <button 
                onClick={() => setActiveTab('flows')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'flows' ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                Flow Control (Enter/Tab)
            </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* --- TAB 1: SHORTCUTS --- */}
          {activeTab === 'shortcuts' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 mb-4">Click a button to record a new shortcut for creating elements.</p>
                
                {Object.entries(tempShortcuts).map(([action, keys]) => (
                    <div key={action} className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                        {/* Try to find a pretty label from nodeOptions, fallback to key */}
                        {nodeOptions?.find(n => n.value === action)?.label || action.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <button
                        onClick={() => setListeningKey(action)}
                        aria-label={`Record shortcut for ${action}`}
                        className={`px-3 py-1.5 text-xs font-mono rounded border transition-all min-w-[120px] text-center
                        ${listeningKey === action 
                            ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 shadow-sm'}
                        `}
                    >
                        {listeningKey === action ? 'Press keys...' : keys}
                    </button>
                    </div>
                ))}
              </div>
          )}

          {/* --- TAB 2: FLOWS (FIXED) --- */}
          {activeTab === 'flows' && (
              <div className="space-y-4">
                  <p className="text-xs text-gray-500 mb-4">
                      Customize what happens when you press <strong>Enter</strong> or <strong>Tab</strong> inside each element.
                  </p>
                  
                  {/* Table Header */}
                  <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <div>Current Element</div>
                      <div className="flex items-center gap-1"><CornerDownLeft size={12}/> Enter Creates</div>
                      <div className="flex items-center gap-1"><ArrowRight size={12}/> Tab Switches To</div>
                  </div>

                 

                {nodeOptions.map((option) => {
                    // FIX 1: Use .node instead of .value
                    const nodeKey = option.node; 
                    const label = option.label;
                    
                    // Get behavior safely, default to empty if missing
                    const behavior = tempFlows[nodeKey] || { enter: nodeKey, tab: nodeKey };
                    
                    return (
                        <div key={nodeKey} className="grid grid-cols-3 gap-4 items-center py-2 border-b border-gray-100 last:border-0">
                            <span className="text-sm font-semibold text-gray-700">{label}</span>
                            
                            {/* Enter Select */}
                            <select 
                                aria-label={`Enter behavior for ${label}`}
                                value={behavior.enter}
                                onChange={(e) => handleFlowChange(nodeKey, 'enter', e.target.value)}
                                className="text-xs border border-gray-300 rounded p-1.5 bg-white focus:ring-2 focus:ring-red-200 outline-none cursor-pointer"
                            >
                                {nodeOptions.map(opt => (
                                    // FIX 2: Use .node for key and value
                                    <option key={opt.node} value={opt.node}>{opt.label}</option>
                                ))}
                            </select>

                            {/* Tab Select */}
                            <select 
                                aria-label={`Tab behavior for ${label}`}
                                value={behavior.tab}
                                onChange={(e) => handleFlowChange(nodeKey, 'tab', e.target.value)}
                                className="text-xs border border-gray-300 rounded p-1.5 bg-white focus:ring-2 focus:ring-red-200 outline-none cursor-pointer"
                            >
                                {nodeOptions.map(opt => (
                                    // FIX 3: Use .node for key and value
                                    <option key={opt.node} value={opt.node}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    );
                })}
              </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
          <button 
            onClick={() => { 
                onSaveShortcuts(tempShortcuts); 
                onSaveFlows(tempFlows);
                onClose(); 
            }} 
            className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm font-medium"
          >
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
}