export default function StartButton ({ onClick }) { 
  return (
    <button 
      onClick={onClick}
      aria-label="Start Menu"
      className="flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all border border-white/10 mr-2 shadow-inner group"
    >
      <svg className="size-6 text-red-500 group-hover:rotate-90 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 12l4 4" />
        <path d="M12 12l-4-4" />
      </svg>
    </button>
  );
}