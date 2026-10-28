import React, { useState } from 'react';
import { 
  Compass, 
  ClipboardCheck, 
  GraduationCap, 
  X,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export default function Sidebar({ 
  activeSection, 
  setActiveSection, 
  isMobileOpen, 
  setIsMobileOpen,
  sidebarWidth = 256,
  setSidebarWidth,
  isCollapsed = false,
  setIsCollapsed
}) {
  // State for minimizing/expanding the Career section (defaults to expanded)
  const [isCareerExpanded, setIsCareerExpanded] = useState(true);

  // Resize drag handler
  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent) => {
      const newWidth = Math.min(360, Math.max(200, startWidth + (moveEvent.clientX - startX)));
      if (setSidebarWidth) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        style={{ width: isCollapsed ? '68px' : `${sidebarWidth}px` }}
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-all duration-150 ease-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 !w-64' : '-translate-x-full md:shadow-none'
        }`}
      >
        <div>
          {/* HEADER: Matches Image 1 precisely when collapsed */}
          {isCollapsed ? (
            <div className="py-3 px-2 flex flex-col items-center gap-2 border-b border-slate-800">
              {/* Compass Brand Icon */}
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                title="Campus360 - Click to expand"
                className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-500 transition-colors shrink-0"
              >
                <Compass className="w-5 h-5" />
              </button>

              {/* Expand Toggle Button */}
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                title="Expand Sidebar"
                className="w-9 h-9 rounded-lg border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors shrink-0"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="text-base font-bold text-white tracking-tight">
                    Campus<span className="text-blue-400 font-extrabold">360</span>
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium truncate">
                    Academic Platform
                  </span>
                </div>
              </div>

              {/* Controls: Collapse Sidebar Toggle (Desktop) & Close (Mobile) */}
              <div className="flex items-center gap-1">
                {setIsCollapsed && (
                  <button
                    type="button"
                    onClick={() => setIsCollapsed(true)}
                    title="Minimize sidebar width"
                    className="hidden md:flex p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="md:hidden text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* MENU SECTIONS */}
          {isCollapsed ? (
            /* COLLAPSED ICON STACK (Matching Image 1) */
            <div className="py-3 px-2 flex flex-col items-center gap-3">
              
              {/* Career minimize toggle */}
              <button
                type="button"
                onClick={() => setIsCareerExpanded(!isCareerExpanded)}
                title={isCareerExpanded ? "Minimize Career Section" : "Expand Career Section"}
                className="w-7 h-7 rounded text-slate-400 hover:text-white hover:bg-slate-800/80 flex items-center justify-center transition-colors"
              >
                {isCareerExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Sub-sections Icons */}
              {isCareerExpanded && (
                <div className="flex flex-col items-center gap-2.5">
                  {/* Sub-section a) Career Survey */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection('survey');
                      setIsMobileOpen(false);
                    }}
                    title="Career Survey"
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      activeSection === 'survey'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <ClipboardCheck className="w-5 h-5" />
                  </button>

                  {/* Sub-section b) College Recommendation */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection('colleges');
                      setIsMobileOpen(false);
                    }}
                    title="College Recommendation"
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      activeSection === 'colleges'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* EXPANDED FULL-WIDTH MENU */
            <div className="p-3 space-y-4">
              
              {/* Section: "Career" with Minimize '^' Toggle Button */}
              <div className="space-y-1">
                
                {/* Header with minimize '^' sign */}
                <button
                  type="button"
                  onClick={() => setIsCareerExpanded(!isCareerExpanded)}
                  title={isCareerExpanded ? "Minimize Career section" : "Expand Career section"}
                  className="w-full px-2 py-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white rounded hover:bg-slate-800/60 transition-colors cursor-pointer group"
                >
                  <span>Career</span>
                  <span className="p-0.5 rounded text-slate-400 group-hover:text-white">
                    {isCareerExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {/* Sub-sections (displayed only when NOT minimized) */}
                {isCareerExpanded && (
                  <div className="space-y-1 pt-0.5">
                    {/* Sub-section a) "Career Survey" */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection('survey');
                        setIsMobileOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        activeSection === 'survey'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ClipboardCheck className="w-4 h-4 shrink-0" />
                        <span className="truncate">Career Survey</span>
                      </div>
                    </button>

                    {/* Sub-section b) "College Recommendation" */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection('colleges');
                        setIsMobileOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        activeSection === 'colleges'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GraduationCap className="w-4 h-4 shrink-0" />
                        <span className="truncate">College Recommendation</span>
                      </div>
                    </button>
                  </div>
                )}

              </div>

            </div>
          )}
        </div>

        {/* Clean bottom padding */}
        <div className="p-2" />

        {/* Desktop Draggable Resize Handle */}
        {!isCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            title="Drag to adjust sidebar width"
            className="hidden md:block absolute top-0 bottom-0 right-0 w-1.5 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors"
          />
        )}
      </aside>
    </>
  );
}
