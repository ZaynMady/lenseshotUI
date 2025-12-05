import React, { useState } from 'react';
import {api} from "../../../../api/client"

export default function CreateScreenplayModal({ isOpen, onClose, editorContent, templateId, onSuccess }) {
    const [scriptName, setScriptName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(''); 

    const handleCreate = async () => {
        // Reset previous errors
        setError('');

        if (!scriptName.trim()) {
            setError("Please enter a valid name.");
            return;
        }
        
        setIsLoading(true);
        try {
            // 1. Prepare Content Wrapper
            const rawContent = editorContent || { type: 'doc', content: [] };
            
            const filePayload = {
                meta: {
                    templateId: templateId || 'american',
                    version: '1.0'
                },
                content: rawContent
            };

            // 2. Call Backend
            await api.createScreenplay(scriptName, filePayload);
            
            // 3. Success Callback
            if (onSuccess) onSuccess(scriptName);
            
            // Close modal and reset form
            setScriptName('');
            onClose();
            
        } catch (err) {
            console.error("Create failed", err);
            setError("Failed to save. Please try again or check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    // Allow closing via Escape key
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Enter') handleCreate();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm transition-opacity"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

            <div 
                className="bg-white p-6 rounded-xl shadow-2xl w-96 border border-gray-100 relative z-10"
                onKeyDown={handleKeyDown}
            >
                <h2 id="modal-title" className="text-lg font-bold mb-1 text-gray-800">Save Screenplay</h2>
                <p className="text-xs text-gray-500 mb-4">Enter a name to save this version.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="script-name">
                            Screenplay Name
                        </label>
                        <input 
                            id="script-name"
                            type="text" 
                            autoFocus
                            className={`w-full border p-2 rounded-lg text-sm outline-none transition-all ${
                                error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                            }`}
                            placeholder="e.g. The Godfather Part IV"
                            value={scriptName}
                            onChange={(e) => {
                                setScriptName(e.target.value);
                                if (error) setError(''); // Clear error on type
                            }}
                        />
                        {/* Inline Error Message */}
                        {error && (
                            <p className="text-red-500 text-xs mt-1 font-medium animate-pulse">
                                {error}
                            </p>
                        )}
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
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-2"
                        >
                            {isLoading && (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isLoading ? 'Saving...' : 'Save As'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}