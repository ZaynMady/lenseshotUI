import React from 'react';
import { Layout, Check, X } from 'lucide-react';
import templates from '../../editor/templates'; // Import your templates list

export default function TemplateModal({ isOpen, onClose, currentTemplateId, onSelect }) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-modal-title"
        >
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 id="template-modal-title" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Layout size={22} className="text-red-500" />
                        Choose Template
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                        aria-label="Close template modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Template Grid */}
                <div className="p-6 bg-gray-50/50 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates && templates.map((tpl) => {
                            const isActive = currentTemplateId === tpl.id;
                            return (
                                <button
                                    key={tpl.id}
                                    onClick={() => onSelect(tpl)}
                                    className={`
                                        relative group flex flex-col items-start p-5 rounded-xl border-2 transition-all duration-200 text-left
                                        ${isActive 
                                            ? 'border-red-500 bg-white ring-4 ring-red-50 shadow-md' 
                                            : 'border-gray-200 bg-white hover:border-red-200 hover:shadow-lg'
                                        }
                                    `}
                                    aria-pressed={isActive}
                                >
                                    {/* Active Badge */}
                                    {isActive && (
                                        <div className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                    )}

                                    <span className={`text-lg font-bold mb-1 ${isActive ? 'text-red-600' : 'text-gray-800'}`}>
                                        {tpl.name}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {tpl.elements?.length || 0} Elements
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}