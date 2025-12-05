import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, X, AlertCircle, FileType } from 'lucide-react';

export default function ImportScreenplayModal({ isOpen, onClose, onImport }) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Handle Escape key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isOpen && e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const processFile = (file) => {
        setError(null);
        
        // 1. Check Extension
        if (!file.name.toLowerCase().endsWith('.lss')) {
            setError("Only .lss files are supported currently.");
            return;
        }

        // 2. Read File
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const json = JSON.parse(text);
                
                // 3. Extract Data (Handle Wrapper vs Legacy)
                let content = json;
                let templateId = 'american'; // Default

                if (json.meta && json.content) {
                    content = json.content;
                    templateId = json.meta.templateId || 'american';
                }

                // 4. Pass to Parent
                onImport(content, templateId, file.name);
                onClose();

            } catch (err) {
                console.error("Parse error", err);
                setError("Failed to parse file. It might be corrupted.");
            }
        };
        reader.onerror = () => {
            setError("Failed to read file.");
        };
        reader.readAsText(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
        // Reset input value to allow selecting the same file again if needed
        e.target.value = '';
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-modal-title"
        >
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200 relative z-10">
                
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 id="import-modal-title" className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Upload size={20} className="text-red-500" />
                        Import Screenplay
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                        aria-label="Close import modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm" role="alert">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Drag & Drop Zone */}
                    <div 
                        className={`
                            relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer
                            ${isDragging 
                                ? 'border-red-500 bg-red-50/50 scale-[1.02]' 
                                : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'}
                        `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                fileInputRef.current?.click();
                            }
                        }}
                        aria-label="Upload file area"
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept=".lss"
                            onChange={handleChange}
                            aria-hidden="true"
                        />
                        
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                            <FileText size={24} className="text-red-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">Supports .lss files</p>
                    </div>

                    {/* File Type Options */}
                    <div className="mt-6">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Supported Formats</p>
                        <div className="grid grid-cols-3 gap-3">
                            {/* Active: Lenseshot Script */}
                            <div className="flex flex-col items-center p-3 rounded-lg border border-red-200 bg-red-50/30 text-red-700">
                                <FileText size={20} className="mb-1" />
                                <span className="text-[10px] font-bold">LSS</span>
                            </div>

                            {/* Disabled: PDF */}
                            <div className="flex flex-col items-center p-3 rounded-lg border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60" aria-disabled="true">
                                <FileType size={20} className="mb-1" />
                                <span className="text-[10px] font-bold">PDF</span>
                                <span className="text-[8px] bg-gray-200 px-1.5 rounded-full mt-1">Soon</span>
                            </div>

                            {/* Disabled: FDX */}
                            <div className="flex flex-col items-center p-3 rounded-lg border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60" aria-disabled="true">
                                <FileText size={20} className="mb-1" />
                                <span className="text-[10px] font-bold">FDX</span>
                                <span className="text-[8px] bg-gray-200 px-1.5 rounded-full mt-1">Soon</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}