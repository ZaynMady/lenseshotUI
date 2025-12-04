import { useEffect } from "react";
import { useState } from "react";

export default function TaskbarClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-end text-white text-xs font-medium px-4 border-l border-white/10 ml-2">
      <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      <span className="text-gray-400">{time.toLocaleDateString()}</span>
    </div>
  );
};