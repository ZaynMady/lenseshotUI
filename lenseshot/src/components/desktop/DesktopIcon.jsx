import { useRef } from "react";
import Draggable from "react-draggable";

export default function DesktopIcon ({ label, icon, position, onDragEnd }) {
  const iconRef = useRef()

  return (
    <Draggable
    nodeRef={iconRef}
    
    >
    <button ref={iconRef}
      className="cursor-select select-none group flex flex-col ..." // Add cursor-move
    >
      {icon}
    </button>
    </Draggable>
  );
};