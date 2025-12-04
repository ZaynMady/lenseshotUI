import { useNavigate } from 'react-router-dom';

// 1. Separation of concerns: Regular links vs Auth buttons
function NavLinks() {
  return (
    <div className="hidden md:flex items-center gap-8">
      
      {['Pricing', 'Contact Us'].map((item) => (
        <a 
          key={item} 
          href="#" 
          className="relative text-xl text-gray-600 font-['Island_Moments',cursive] hover:text-black transition-colors duration-300 group"
        >
          {item}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
        </a>
      ))}
    </div>
  );
}

function AuthButtons() {
    const navigate = useNavigate()
  return (
    <div className="flex items-center gap-4">
      <a  
        className="text-xl text-gray-600 cursor-pointer font-['Island_Moments',cursive] hover:text-black transition-colors"
        onClick={() => { navigate("/signIn")}}
      >
        Sign In
      </a>
      <a 
        onClick={() => {navigate("/signUp")}}
        className="bg-black text-white px-5 py-2 rounded-full font-['Courier_Prime',monospace] text-sm hover:bg-gray-800 hover:scale-105 transition-all duration-300 shadow-lg shadow-gray-200"
      >
        Sign Up
      </a>
    </div>
  );
}

function WebPageTitle() {
  return (
    <div className="flex items-center gap-2 cursor-pointer">
      {/* Optional: Add a small icon or camera svg here */}
      <h1 className="text-3xl md:text-4xl font-['Courier_Prime',monospace] font-bold text-gray-900 tracking-tighter">
        Lenseshot
        <span className="text-red-500">.</span>
      </h1>
    </div>
  );
}

export default function Navbar() {
  return (
    // 'sticky top-0' keeps it pinned while scrolling
    // 'backdrop-blur-md' gives it the frosty glass look
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* Branding (Left) */}
        <WebPageTitle />

        {/* Navigation & Auth (Right) */}
        <div className="flex items-center gap-8">
          <NavLinks />
          
          {/* A small vertical divider for visual separation */}
          <div className="hidden md:block h-6 w-px bg-gray-200"></div>
          
          <AuthButtons />
        </div>

      </div>
    </nav>
  );
}