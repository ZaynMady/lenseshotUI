export default function TaskbarIcon ({ icon, isActive, onClick }) {
  return (
  <button 
    onClick={onClick}
    className={`relative p-3 rounded-xl transition-all duration-300 hover:bg-white/10 group
      ${isActive ? 'bg-white/10' : ''}
    `}
  >
    <div className="size-6 text-white group-hover:-translate-y-1 transition-transform duration-300">
      {icon}
    </div>
    {/* Active Dot Indicator */}
    {isActive && (
      <div 
        data-testid="active-indicator"
        className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"
      >
      </div>
    )}
  </button>
  )
}