import React from 'react';
import { 
  Compass, 
  ShoppingBag, 
  Sparkles
} from 'lucide-react';

export default function Navbar({ activeView, setActiveView, onResetSurvey, currentResult }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('survey')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-100">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-800 bg-clip-text text-transparent tracking-tight">
                  Campus<span className="text-blue-600 font-extrabold">360</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-100/80 text-blue-700 border border-blue-200/60">
                  AI Navigator
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Career Discovery & Student Commerce Platform
              </p>
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveView('survey')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeView === 'survey'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Compass className="w-4 h-4 text-blue-600" />
              Career Survey
            </button>

            <button
              onClick={() => {
                if (currentResult) {
                  setActiveView('results');
                } else {
                  setActiveView('survey');
                }
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 relative ${
                activeView === 'results'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Recommendations
              {currentResult && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            <div className="h-4 w-px bg-slate-200 mx-2" />

            {/* Campus360 Student Marketplace Link */}
            <button
              onClick={() => {
                if (currentResult) {
                  setActiveView('results');
                  setTimeout(() => {
                    const el = document.getElementById('marketplace-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else {
                  alert("Please complete the Career Survey to unlock personalized textbook bundles on Campus360 Marketplace!");
                }
              }}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-100/70 transition-all flex items-center gap-2 group"
            >
              <ShoppingBag className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>Student Marketplace</span>
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full border border-amber-200">
                2nd-Hand Books
              </span>
            </button>
          </nav>

          {/* User Profile & Action */}
          <div className="flex items-center gap-3">
            {currentResult && (
              <button
                onClick={onResetSurvey}
                className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-all"
              >
                <span>New Survey</span>
              </button>
            )}

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-white">
                VS
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  Vinal Shah
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Undergrad / Tech Track
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
