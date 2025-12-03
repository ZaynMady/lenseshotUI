import React, { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion'; // Needed for open/close animations
import Draggable from 'react-draggable';

// --- COMPONENTS ---
import DesktopIcon from '../components/desktop/DesktopIcon';
import StartButton from '../components/desktop/StartButton';
import TaskbarClock from '../components/desktop/TaskbarClock';
import TaskbarIcon from '../components/desktop/TaskbarIcon';
import Window from '../components/desktop/Window'; // The new wrapper
import ScreenplayApp from './ScreenplayApp';

// --- ICONS (Keep your existing icon object) ---
const Icons = {Screenplay: <svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M899.984 19.873h-3.452c-26.123 0-47.296 21.172-47.296 47.296v888.508c0 26.127 21.173 47.298 47.296 47.298h3.452c26.119 0 47.297-21.171 47.297-47.298V67.169c0-26.124-21.177-47.296-47.297-47.296z" fill="#4A5699"></path><path d="M132.643 19.873h-3.449c-26.12 0-47.296 21.172-47.296 47.296v888.508c0 26.127 21.177 47.298 47.296 47.298h3.449c26.123 0 47.299-21.171 47.299-47.298V67.169c0-26.124-21.176-47.296-47.299-47.296z" fill="#C45FA0"></path><path d="M899.463 19.873H129.194c-26.12 0-47.296 21.172-47.296 47.296v3.377c0 26.12 21.177 47.299 47.296 47.299h770.269c26.123 0 47.296-21.179 47.296-47.299v-3.377c0-26.124-21.173-47.296-47.296-47.296z" fill="#6277BA"></path><path d="M899.463 905.006H129.194c-26.12 0-47.296 21.17-47.296 47.29v3.381c0 26.127 21.177 47.298 47.296 47.298h770.269c26.123 0 47.296-21.171 47.296-47.298v-3.381c0-26.12-21.173-47.29-47.296-47.29z" fill="#C45FA0"></path><path d="M717.962 543.153H542.047c-26.121 0-47.298 21.175-47.298 47.297v3.724c0 26.123 21.177 47.293 47.298 47.293h175.915c26.121 0 47.297-21.17 47.297-47.293v-3.724c0-26.122-21.176-47.297-47.297-47.297z" fill="#E5594F"></path><path d="M689.268 198.849H513.355c-26.122 0-47.298 21.175-47.298 47.297v3.722c0 26.12 21.176 47.297 47.298 47.297h175.912c26.122 0 47.298-21.177 47.298-47.297v-3.722c0-26.122-21.175-47.297-47.297-47.297z" fill="#F0D043"></path><path d="M757.789 353.081H261.17c-26.121 0-47.297 21.172-47.297 47.296v3.377c0 26.121 21.177 47.299 47.297 47.299h496.619c26.121 0 47.296-21.178 47.296-47.299v-3.377c0-26.125-21.175-47.296-47.296-47.296z" fill="#E5594F"></path><path d="M762.638 726.225h-496.62c-26.12 0-47.294 21.18-47.294 47.301v3.377c0 26.12 21.174 47.3 47.294 47.3h496.62c26.122 0 47.296-21.18 47.296-47.3v-3.377c0-26.122-21.174-47.301-47.296-47.301z" fill="#6277BA"></path><path d="M355.734 543.328H281.41c-26.122 0-47.297 21.17-47.297 47.293v3.378c0 26.118 21.175 47.297 47.297 47.297h74.324c26.123 0 47.296-21.179 47.296-47.297v-3.378c0-26.123-21.174-47.293-47.296-47.293z" fill="#F39A2B"></path><path d="M334.85 248.006m-48.986 0a48.986 48.986 0 1 0 97.972 0 48.986 48.986 0 1 0-97.972 0Z" fill="#F39A2B"></path></g></svg> };

export default function Desktop() {
  const taskbarRef = useRef();
  const [selectedIcon, setSelectedIcon] = useState(null);

  // Apps configuration
  const apps = [
    { 
      id: 'screenplay', 
      name: 'Screenplay Writer', 
      icon: Icons.Screenplay,
      // Map the ID to the actual Component
      component: <ScreenplayApp /> 
    }
  ];

const activeApp = apps.find(app => app.id === selectedIcon);
  
  // MINIMIZE LOGIC: Just deselect the icon (simulates closing/minimizing)
  const handleMinimize = () => setSelectedIcon(null);
  const handleClose = () => setSelectedIcon(null);

  return (
    <div className="h-screen w-full relative overflow-hidden bg-cover bg-center select-none"
      style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1478720568477-152d9b164e63?q=80&w=2560&auto=format&fit=crop')` }}
    >
      
      {/* 2. Desktop Grid Area */}
      <div className="absolute top-0 left-0 p-8 grid grid-flow-col grid-rows-6 gap-6 h-[calc(100%-80px)]">
        {apps.map((app) => (
          <DesktopIcon 
            key={app.id}
            label={app.name}
            icon={app.icon}
            // Use specific logic: isSelected highlights it, but double click usually opens
            // For now, let's keep your onClick logic
            isSelected={selectedIcon === app.id}
            onClick={() => setSelectedIcon(app.id)}
          />
        ))}
      </div>

      {/* --- THE WINDOW LAYER --- */}
      <AnimatePresence>
        {activeApp && (
          <Window 
            key={activeApp.id} 
            title={activeApp.name} 
            onClose={handleClose}
            onMinimize={handleMinimize} // <--- THIS WAS MISSING
          >
            {activeApp.component}
          </Window>
        )}
      </AnimatePresence>


      {/* 3. The Glassmorphism Taskbar */}
      <Draggable nodeRef={taskbarRef} bounds="parent">
        <div 
          ref={taskbarRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-auto max-w-[90%] flex items-center gap-2 p-2 px-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl z-50"
        >
          <StartButton />
          <div className="h-8 w-px bg-white/10 mx-1"></div>

          {apps.map((app) => (
            <TaskbarIcon 
              key={app.id}
              icon={app.icon}
              isActive={selectedIcon === app.id} 
              // Clicking taskbar toggles: Open if closed, Close if open
              onClick={() => setSelectedIcon(selectedIcon === app.id ? null : app.id)}
            />
          ))}

          <div className="w-12"></div>
          <TaskbarClock />
        </div>
      </Draggable>

    </div>
  );
}