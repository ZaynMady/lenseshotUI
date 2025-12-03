import React, { useState } from 'react';
import { api } from '../../../../api/client'; 

export default function CreateScreenplayModal({ isOpen, onClose, editorContent, onSuccess }) {
    const [scriptName, setScriptName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!scriptName.trim()) return alert("Please enter a name");
        
        setIsLoading(true);
        try {
            // 1. Prepare Content
            // If editorContent is empty/null, we can send a basic default or the actual empty doc
            const contentToSave = editorContent || { type: 'doc', content: [] };

            // 2. Call Backend Create Endpoint
            // We append .lss if not present, though your backend might handle it
            const finalName = scriptName.endsWith('.lss') ? scriptName : `${scriptName}.lss`;

            await api.createScreenplay(finalName, contentToSave);
            
            // 3. Success Callback (Updates parent state to "Opened")
            if (onSuccess) onSuccess(finalName);
            
        } catch (error) {
            console.error("Create failed", error);
            alert("Failed to create screenplay. Check console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-96 border border-gray-100">
                <h2 className="text-lg font-bold mb-1 text-gray-800">Save New Screenplay</h2>
                <p className="text-xs text-gray-500 mb-4">Give your screenplay a name to save it to your cloud storage.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Screenplay Name</label>
                        <input 
                            type="text" 
                            autoFocus
                            className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" 
                            placeholder="e.g. The Godfather Part IV"
                            value={scriptName}
                            onChange={(e) => setScriptName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button 
                            onClick={onClose} 
                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleCreate} 
                            disabled={isLoading}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                        >
                            {isLoading ? 'Creating...' : 'Save & Create'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}