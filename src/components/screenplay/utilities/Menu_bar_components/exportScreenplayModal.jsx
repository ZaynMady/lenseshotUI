import React, { useState, useEffect } from 'react';
import { Download, FileText, X, FileType, Printer } from 'lucide-react';

export default function ExportScreenplayModal({ isOpen, onClose, onExport, defaultName }) {
    const [fileName, setFileName] = useState(defaultName || 'Untitled Script');

    // Update local state when prop changes
    useEffect(() => {
        if (defaultName) setFileName(defaultName.replace(/\.(lss|json|doc|pdf)$/i, ''));
    }, [defaultName, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Download size={20} className="text-red-500" />
                        Export Screenplay
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    
                    {/* Filename Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filename</label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-medium text-gray-700" 
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="My Screenplay"
                        />
                    </div>

                    {/* Export Options */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select Format</label>
                        <div className="grid grid-cols-1 gap-3">
                            
                            {/* Option 1: LSS (Project File) */}
                            <button 
                                onClick={() => { onExport('lss', fileName); onClose(); }}
                                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all group text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-gray-800">Lenseshot Script (.lss)</span>
                                    <span className="block text-xs text-gray-500">Best for backups and re-importing.</span>
                                </div>
                            </button>

                            {/* Option 2: PDF */}
                            <button 
                                onClick={() => { onExport('pdf', fileName); onClose(); }}
                                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all group text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Printer size={20} />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-gray-800">Print / PDF</span>
                                    <span className="block text-xs text-gray-500">Opens browser print dialog. Save as PDF.</span>
                                </div>
                            </button>

                            {/* Option 3: DOCX (HTML) */}
                            <button 
                                onClick={() => { onExport('docx', fileName); onClose(); }}
                                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all group text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FileType size={20} />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-gray-800">Word Document (.doc)</span>
                                    <span className="block text-xs text-gray-500">Export as rich text for Microsoft Word.</span>
                                </div>
                            </button>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}