import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Settings as SettingsIcon } from 'lucide-react';

// --- COMPONENTS ---
import StartButton from '../components/desktop/StartButton';
import TaskbarClock from '../components/desktop/TaskbarClock';
import TaskbarIcon from '../components/desktop/TaskbarIcon';
import Window from '../components/desktop/Window';

// --- APPS ---
import ScreenplayApp from './ScreenplayApp';
import SettingsApp from './SettingsApp';

// --- ICONS ---
// We remove fixed sizing classes here so they adapt to the TaskbarIcon container
const Icons = {
  Screenplay: (
    <svg viewBox="0 0 1024 1024" className="w-full h-full" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <path d="M899.984 19.873h-3.452c-26.123 0-47.296 21.172-47.296 47.296v888.508c0 26.127 21.173 47.298 47.296 47.298h3.452c26.119 0 47.297-21.171 47.297-47.298V67.169c0-26.124-21.177-47.296-47.297-47.296z" fill="#4A5699"></path>
      <path d="M132.643 19.873h-3.449c-26.12 0-47.296 21.172-47.296 47.296v888.508c0 26.127 21.177 47.298 47.296 47.298h3.449c26.123 0 47.299-21.171 47.299-47.298V67.169c0-26.124-21.176-47.296-47.299-47.296z" fill="#C45FA0"></path>
      <path d="M899.463 19.873H129.194c-26.12 0-47.296 21.172-47.296 47.296v3.377c0 26.12 21.177 47.299 47.296 47.299h770.269c26.123 0 47.296-21.179 47.296-47.299v-3.377c0-26.124-21.173-47.296-47.296-47.296z" fill="#6277BA"></path>
      <path d="M717.962 543.153H542.047c-26.121 0-47.298 21.175-47.298 47.297v3.724c0 26.123 21.177 47.293 47.298 47.293h175.915c26.121 0 47.297-21.17 47.297-47.293v-3.724c0-26.122-21.176-47.297-47.297-47.297z" fill="#E5594F"></path>
    </svg>
  ),
  Settings: (
    <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center shadow-inner">
        <SettingsIcon size={16} className="text-gray-600" />
    </div>
  )
};

export default function Desktop() {
  const taskbarRef = useRef();
  
  // --- STATE ---
  
  // Wallpaper with Persistence
  const [wallpaper, setWallpaper] = useState(() => {
    return localStorage.getItem('desktop_wallpaper') || 
    'https://images.unsplash.com/photo-1478720568477-152d9b164e63?q=80&w=2560&auto=format&fit=crop';
  });

  // Save wallpaper whenever it changes
  useEffect(() => {
    localStorage.setItem('desktop_wallpaper', wallpaper);
  }, [wallpaper]);

  // Window Manager State
  const [windowStates, setWindowStates] = useState({});
  const [zCounter, setZCounter] = useState(10); 

  // App Registry
  const apps = [
    { 
      id: 'screenplay', 
      name: 'Screenplay Writer', 
      icon: Icons.Screenplay,
      component: <ScreenplayApp /> 
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Icons.Settings,
      component: <SettingsApp /> 
    }
  ];

  // --- WINDOW ACTIONS ---

  const getWindowState = (id) => windowStates[id] || { isOpen: false, isMinimized: false, zIndex: 0 };

  const bringToFront = (id) => {
    setZCounter(prev => prev + 1);
    setWindowStates(prev => ({
        ...prev,
        [id]: { ...prev[id], isMinimized: false, zIndex: zCounter + 1 }
    }));
  };

  const openApp = (id) => {
    const state = getWindowState(id);
    if (state.isOpen) {
        bringToFront(id);
    } else {
        setZCounter(prev => prev + 1);
        setWindowStates(prev => ({
            ...prev,
            [id]: { isOpen: true, isMinimized: false, zIndex: zCounter + 1 }
        }));
    }
  };

  const closeApp = (id) => {
    setWindowStates(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
    });
  };

  const minimizeApp = (id) => {
    setWindowStates(prev => ({
        ...prev,
        [id]: { ...prev[id], isMinimized: true }
    }));
  };

  const toggleApp = (id) => {
    const state = getWindowState(id);
    
    if (!state.isOpen) {
        // Closed -> Open
        openApp(id);
    } else if (state.isMinimized) {
        // Minimized -> Show & Focus
        bringToFront(id);
    } else {
        // Visible -> Minimize
        minimizeApp(id);
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-cover bg-center select-none"
      style={{ backgroundImage: `url('${wallpaper}')`, transition: 'background-image 0.5s ease-in-out' }}
    >
      
      {/* 1. Desktop Shortcuts (REMOVED per request) */}
      {/* If you want them back later, uncomment the loop below */}
      <div className="absolute top-0 left-0 p-8 grid grid-flow-col grid-rows-6 gap-6 h-[calc(100%-80px)] pointer-events-none">
         {/* Shortcuts removed */}
      </div>

      {/* 2. Window Layer */}
      {apps.map((app) => {
          const state = windowStates[app.id];
          if (!state || !state.isOpen) return null;

          return (
            <Window 
                key={app.id}
                title={app.name}
                zIndex={state.zIndex}
                isMinimized={state.isMinimized}
                onClose={() => closeApp(app.id)}
                onMinimize={() => minimizeApp(app.id)}
                onFocus={() => bringToFront(app.id)}
            >
                {React.cloneElement(app.component, {
                    currentWallpaper: wallpaper,
                    onWallpaperChange: setWallpaper
                })}
            </Window>
          );
      })}

      {/* 3. Taskbar */}
      <Draggable nodeRef={taskbarRef} bounds="parent">
        <div 
          ref={taskbarRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-auto max-w-[90%] flex items-center gap-2 p-2 px-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl z-[9999]"
        >
          <StartButton />
          <div className="h-8 w-px bg-white/10 mx-1"></div>

          {apps.map((app) => {
            const state = getWindowState(app.id);
            // Highlight if Open (even if minimized)
            const isActive = state.isOpen; 
            // Optional: You could add a different style if it's visible vs minimized
            // but `isActive` is what puts the dot/background on usually.

            return (
                <TaskbarIcon 
                  key={app.id}
                  icon={app.icon}
                  isActive={isActive} 
                  onClick={() => toggleApp(app.id)}
                />
            );
          })}

          <div className="w-12"></div>
          <TaskbarClock />
        </div>
      </Draggable>

    </div>
  );
}