import { useRef } from "react";
import Draggable from "react-draggable";

export default function DesktopIcon ({ label, icon, onDoubleClick, onDragEnd }) {
  const iconRef = useRef(null);

  return (
    <Draggable
      nodeRef={iconRef}
      onStop={onDragEnd}
      bounds="parent"
    >
      <button 
        ref={iconRef}
        onDoubleClick={onDoubleClick}
        className="cursor-pointer select-none group flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 w-24 h-24 text-white text-center"
        aria-label={label}
      >
        <div className="size-8 mb-1">{icon}</div>
        <span className="text-xs break-words">{label}</span>
      </button>
    </Draggable>
  );
};