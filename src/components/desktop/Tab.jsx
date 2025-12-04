import { useState } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility to merge tailwind classes cleanly
const cn = (...inputs) => twMerge(clsx(inputs));

/**
 * THE MAIN TABS COMPONENT
 *
 * @param {array} items - Array of objects: { id, label, icon (optional), content }
 * @param {string} defaultActiveId - (Optional) The ID of the tab to start active
 * @param {string} className - (Optional) Extra classes for the outer wrapper
 */
export const Tab = ({ items, defaultActiveId, className }) => {
  // State to track which tab is currently active. Default to the first item if none provided.
  const [activeTabId, setActiveTabId] = useState(
    defaultActiveId || items[0]?.id
  );

  // Find the content component matching the active ID
  const activeContent = items.find((item) => item.id === activeTabId)?.content;

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
      {/* --- THE TAB LIST CONTAINER --- */}
      {/* We use bg-gray-100/60 for a subtle, slightly translucent "frosted" look behind the tabs */}
      <div className="relative flex w-full p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-full overflow-x-auto scrollbar-hide border border-gray-200/50">

        {items.map((item) => {
          const isActive = activeTabId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTabId(item.id)}
              // Ensure relative positioning so the text sits ON TOP of the sliding background
              className={cn(
                "relative z-10 flex items-center justify-center gap-2 flex-1",
                "px-4 py-2.5 text-sm font-medium transition-colors duration-200 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                 // Conditional text color styling
                 isActive
                  ? "text-gray-900" // Active text color
                  : "text-gray-500 hover:text-gray-700" // Inactive & hover state
              )}
              // Accessibility attributes
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
            >
              {/* Optional Icon */}
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}

              {/* Label */}
              <span className="whitespace-nowrap">{item.label}</span>

              {/* --- THE SLIDING "PILL" BACKGROUND (Framer Motion Magic) --- */}
              {isActive && (
                <motion.div
                  // layoutId is the key. Framer Motion finds the element with this ID
                  // and automatically animates its position and size to the new container.
                  layoutId="activeTabPill"
                  className="absolute inset-0 z-[-1] bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-200/50"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* --- THE CONTENT AREA --- */}
      {/* Using animation-key on the container forces a slight fade animation on content switch */}
      <div className="mt-6 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm ring-1 ring-gray-900/5">
          <motion.div
            key={activeTabId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
             {activeContent}
          </motion.div>
      </div>
    </div>
  );
};