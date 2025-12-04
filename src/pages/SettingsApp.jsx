import React, { useState } from 'react';
import { supabase } from '../secrets/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LogOut, Image, Monitor, User } from 'lucide-react';

// Define SidebarItem outside to prevent re-renders breaking state/focus
const SidebarItem = ({ id, icon: Icon, label, activeTab, onClick }) => (
    <button 
        onClick={() => onClick(id)}
        className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
    >
        <Icon size={18} />
        {label}
    </button>
);

export default function SettingsApp({ currentWallpaper, onWallpaperChange }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personalization');

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/'); // Redirect to landing page
    };

    const wallpapers = [
        "https://images.unsplash.com/photo-1641499303009-078668286adc?q=80&w=1031&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://plus.unsplash.com/premium_photo-1685916643856-393b0119eac6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHdhbGxwYXBlcnxlbnwwfHwwfHx8MA%3D%3D",
        "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ];

    return (
        <div className="flex h-full w-full bg-white text-left">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-100 bg-gray-50/50 p-4 space-y-2 h-full">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">Settings</h2>
                
                <SidebarItem 
                    id="personalization" 
                    icon={Image} 
                    label="Background" 
                    activeTab={activeTab} 
                    onClick={setActiveTab} 
                />
                
                <SidebarItem 
                    id="account" 
                    icon={User} 
                    label="Account" 
                    activeTab={activeTab} 
                    onClick={setActiveTab} 
                />
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                
                {/* --- PERSONALIZATION TAB --- */}
                {activeTab === 'personalization' && (
                    <div className="space-y-6">
                        <div className="border-b border-gray-100 pb-4">
                            <h1 className="text-2xl font-bold text-gray-800">Background</h1>
                            <p className="text-gray-500 text-sm mt-1">Choose a wallpaper for your desktop.</p>
                        </div>

                        {/* Current Preview */}
                        <div className="aspect-video w-full max-w-md rounded-xl overflow-hidden shadow-md border border-gray-200">
                            <img src={currentWallpaper} className="w-full h-full object-cover" alt="Current" />
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-3 gap-4 max-w-2xl">
                            {wallpapers.map((url, i) => (
                                <button 
                                    key={i}
                                    onClick={() => onWallpaperChange(url)}
                                    className={`
                                        relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-105
                                        ${currentWallpaper === url ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-300'}
                                    `}
                                >
                                    <img src={url} className="w-full h-full object-cover" loading="lazy" alt={`Wallpaper ${i}`} />
                                    {currentWallpaper === url && (
                                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                            <div className="bg-blue-500 text-white p-1 rounded-full">
                                                <Monitor size={16} />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- ACCOUNT TAB --- */}
                {activeTab === 'account' && (
                    <div className="space-y-6">
                        <div className="border-b border-gray-100 pb-4">
                            <h1 className="text-2xl font-bold text-gray-800">Account</h1>
                            <p className="text-gray-500 text-sm mt-1">Manage your session and preferences.</p>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col items-start gap-4">
                            <div className="flex items-center gap-3 text-red-800">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <LogOut size={20} />
                                </div>
                                <span className="font-semibold">Sign Out</span>
                            </div>
                            <p className="text-sm text-red-600">
                                Ending your session will return you to the home page. Make sure all your work is saved.
                            </p>
                            <button 
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}