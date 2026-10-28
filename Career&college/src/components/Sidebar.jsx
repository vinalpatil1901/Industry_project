import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Compass,
  GraduationCap,
  LibraryBig,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  PiggyBank,
  Trophy,
  TrendingUp,
  Store,
  WalletCards,
  X,
} from 'lucide-react';

const careerLinks = [
  { id: 'survey', label: 'Career Survey', icon: ClipboardCheck },
  { id: 'colleges', label: 'College Recommendation', icon: GraduationCap },
];

const moneyLinks = [
  { id: 'expense', label: 'Daily Expense Tracker', icon: WalletCards },
  { id: 'savings', label: 'Small Savings, Big Future', icon: PiggyBank },
  { id: 'invest', label: 'Investment & Virtual Trading', icon: TrendingUp },
  { id: 'challenges', label: 'Savings Challenges', icon: Trophy },
];

const marketplaceLinks = [
  { id: 'dashboard', label: 'Marketplace Dashboard', icon: Store },
  { id: 'purchases', label: 'My Purchases', icon: LibraryBig },
  { id: 'listings', label: 'My Listings', icon: ListChecks },
];

function SectionHeader({ title, expanded, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between rounded px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white"
      aria-expanded={expanded}
    >
      <span>{title}</span>
      <span className="rounded p-0.5 text-slate-400 group-hover:text-white">
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </span>
    </button>
  );
}

export default function Sidebar({
  activeArea,
  activeSection,
  onNavigate,
  isMobileOpen,
  setIsMobileOpen,
  sidebarWidth = 256,
  setSidebarWidth,
  isCollapsed = false,
  setIsCollapsed,
}) {
  const [isCareerExpanded, setIsCareerExpanded] = useState(true);
  const [isMoneyExpanded, setIsMoneyExpanded] = useState(true);
  const [isMarketplaceExpanded, setIsMarketplaceExpanded] = useState(true);

  const navigate = (area, section) => onNavigate(area, section);

  const handleMouseDown = (event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent) => {
      setSidebarWidth?.(Math.min(360, Math.max(200, startWidth + (moveEvent.clientX - startX))));
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const iconButton = (area, item) => {
    const Icon = item.icon;
    const isActive = activeArea === area && activeSection === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => navigate(area, item.id)}
        title={item.label}
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
          isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Icon className="h-5 w-5" />
      </button>
    );
  };

  const textButton = (area, item) => {
    const Icon = item.icon;
    const isActive = activeArea === area && activeSection === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => navigate(area, item.id)}
        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
          isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {isMobileOpen && <div onClick={() => setIsMobileOpen(false)} className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden" />}

      <aside
        style={{ width: isCollapsed ? '68px' : `${sidebarWidth}px` }}
        className={`fixed bottom-0 left-0 top-0 z-50 flex flex-col justify-between border-r border-slate-800 bg-slate-900 text-slate-300 transition-all duration-150 ease-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 !w-64' : '-translate-x-full md:shadow-none'
        }`}
      >
        <div>
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2 border-b border-slate-800 px-2 py-3">
              <button type="button" onClick={() => setIsCollapsed(false)} title="Expand sidebar" className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md transition-colors hover:bg-blue-500">
                <Compass className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => setIsCollapsed(false)} title="Expand sidebar" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/40 text-slate-300 transition-colors hover:bg-slate-800">
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
              <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm"><Compass className="h-5 w-5" /></div>
                <div className="truncate">
                  <span className="text-base font-bold tracking-tight text-white">Campus<span className="font-extrabold text-blue-400">360</span></span>
                  <span className="block truncate text-[10px] font-medium text-slate-400">Academic Platform</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setIsCollapsed(true)} title="Minimize sidebar" className="hidden rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white md:flex"><PanelLeftClose className="h-4 w-4" /></button>
                <button type="button" onClick={() => setIsMobileOpen(false)} aria-label="Close navigation menu" className="rounded p-1 text-slate-400 hover:text-white md:hidden"><X className="h-5 w-5" /></button>
              </div>
            </div>
          )}

          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2 px-2 py-3">
              <button type="button" onClick={() => setIsCareerExpanded(!isCareerExpanded)} title="Toggle Career section" className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white">
                {isCareerExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {isCareerExpanded && careerLinks.map((item) => iconButton('career', item))}
              <div className="my-1 h-px w-8 bg-slate-800" />
              <button type="button" onClick={() => setIsMoneyExpanded(!isMoneyExpanded)} title="Toggle Money Management section" className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white">
                {isMoneyExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {isMoneyExpanded && moneyLinks.map((item) => iconButton('money', item))}
              <div className="my-1 h-px w-8 bg-slate-800" />
              <button type="button" onClick={() => setIsMarketplaceExpanded(!isMarketplaceExpanded)} title="Toggle Marketplace section" className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white">
                {isMarketplaceExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {isMarketplaceExpanded && marketplaceLinks.map((item) => iconButton('marketplace', item))}
            </div>
          ) : (
            <nav className="space-y-4 p-3" aria-label="Campus360 sections">
              <div className="space-y-1">
                <SectionHeader title="Career" expanded={isCareerExpanded} onClick={() => setIsCareerExpanded(!isCareerExpanded)} />
                {isCareerExpanded && <div className="space-y-1 pt-0.5">{careerLinks.map((item) => textButton('career', item))}</div>}
              </div>

              <div className="border-t border-slate-800 pt-3">
                <SectionHeader title="Money Management" expanded={isMoneyExpanded} onClick={() => setIsMoneyExpanded(!isMoneyExpanded)} />
                {isMoneyExpanded && <div className="space-y-1 pt-0.5">{moneyLinks.map((item) => textButton('money', item))}</div>}
              </div>

              <div className="border-t border-slate-800 pt-3">
                <SectionHeader title="Marketplace" expanded={isMarketplaceExpanded} onClick={() => setIsMarketplaceExpanded(!isMarketplaceExpanded)} />
                {isMarketplaceExpanded && <div className="space-y-1 pt-0.5">{marketplaceLinks.map((item) => textButton('marketplace', item))}</div>}
              </div>
            </nav>
          )}
        </div>

        <div className="p-2" />
        {!isCollapsed && <div onMouseDown={handleMouseDown} title="Drag to adjust sidebar width" className="absolute bottom-0 right-0 top-0 hidden w-1.5 cursor-col-resize transition-colors hover:bg-blue-500/60 active:bg-blue-600 md:block" />}
      </aside>
    </>
  );
}
