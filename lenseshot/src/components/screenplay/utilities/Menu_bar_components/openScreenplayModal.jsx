import React, { useState, useEffect } from 'react';
import { FileText, X, Search, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../../../api/client';

export default function OpenScreenplayModal({ isOpen, onClose, onFileSelect }) {
    const [scripts, setScripts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch scripts when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchScripts();
            setSearchQuery(''); // Reset search
        }
    }, [isOpen]);

    const fetchScripts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // [cite: 15, 16] Backend requires POST for listing
            const response = await api.listScreenplays();
            // Expecting response.data.screenplays based on docs
            setScripts(response.data.screenplays || []); 
        } catch (err) {
            console.error("Failed to load screenplays:", err);
            setError("Could not load your screenplays. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = async (fileName) => {
        // Optimistic UI or loading state could go here if needed
        onFileSelect(fileName);
    };

    // Filter logic
    const filteredScripts = scripts.filter(name => 
        name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-white z-10">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Open Screenplay</h2>
                            <p className="text-xs text-gray-500 mt-1">Select a script to continue writing.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search your scripts..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
                            <Loader2 className="animate-spin text-red-500" size={32} />
                            <span className="text-sm font-medium">Loading library...</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-48 text-red-500 gap-3 bg-red-50 rounded-xl border border-red-100">
                            <AlertCircle size={32} />
                            <span className="text-sm font-medium">{error}</span>
                            <button onClick={fetchScripts} className="text-xs underline hover:text-red-700">Try Again</button>
                        </div>
                    ) : filteredScripts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <FileText size={48} className="mb-3 opacity-20" />
                            <p className="text-sm">No screenplays found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredScripts.map((fileName) => (
                                <button
                                    key={fileName}
                                    onClick={() => handleSelect(fileName)}
                                    className="group relative flex flex-col items-start p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-red-200 transition-all duration-200 text-left"
                                >
                                    <div className="p-3 bg-red-50 text-red-500 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                                        <FileText size={24} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 text-sm truncate w-full mb-1 group-hover:text-red-600 transition-colors">
                                        {fileName}
                                    </h3>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                                        Screenplay
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}