import { useEffect, useState } from 'react';
import { ChevronRight, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import CareerSurvey from './components/CareerSurvey';
import CollegeRecommendation from './components/CollegeRecommendation';
import MoneyManagement from './components/MoneyManagement';
import Marketplace from './components/Marketplace';
import { evaluateCareers } from './utils/careerEvaluation';

const MONEY_SECTIONS = {
  expense: 'Daily Expense Tracker',
  savings: 'Small Savings, Big Future',
  invest: 'Investment & Virtual Trading',
  challenges: 'Savings Challenges',
};

const MARKETPLACE_SECTIONS = {
  dashboard: 'Marketplace Dashboard',
  purchases: 'My Purchases',
  listings: 'My Listings',
};

function readNavigation() {
  const hash = window.location.hash.replace('#', '');

  if (hash.startsWith('money-')) {
    const section = hash.replace('money-', '');
    return { area: 'money', section: MONEY_SECTIONS[section] ? section : 'expense' };
  }

  if (hash.startsWith('marketplace-')) {
    const section = hash.replace('marketplace-', '');
    return { area: 'marketplace', section: MARKETPLACE_SECTIONS[section] ? section : 'dashboard' };
  }

  return {
    area: 'career',
    section: hash === 'career-colleges' ? 'colleges' : 'survey',
  };
}

export default function App() {
  const [navigation, setNavigation] = useState(readNavigation);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [surveyData, setSurveyData] = useState(null);
  const [careerResults, setCareerResults] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    const handleLocationChange = () => setNavigation(readNavigation());

    window.addEventListener('resize', handleResize);
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigate = (area, section) => {
    const hash = area === 'money' ? `money-${section}` : area === 'marketplace' ? `marketplace-${section}` : `career-${section}`;
    window.history.pushState(null, '', `#${hash}`);
    setNavigation({ area, section });
    setIsMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveSurvey = (formData) => {
    setSurveyData(formData);
    const evaluated = evaluateCareers(formData);
    setCareerResults(evaluated);
    setSelectedCareer(evaluated[0]);
  };

  const isMoneyArea = navigation.area === 'money';
  const isMarketplaceArea = navigation.area === 'marketplace';
  const breadcrumbSection = isMoneyArea
    ? MONEY_SECTIONS[navigation.section]
    : isMarketplaceArea
      ? MARKETPLACE_SECTIONS[navigation.section]
    : navigation.section === 'survey'
      ? 'Career Survey'
      : 'College Recommendation';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      <Sidebar
        activeArea={navigation.area}
        activeSection={navigation.section}
        onNavigate={navigate}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        sidebarWidth={sidebarWidth}
        setSidebarWidth={setSidebarWidth}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div
        className="flex min-h-screen min-w-0 flex-1 flex-col transition-all duration-150 ease-out"
        style={{ marginLeft: isDesktop ? (isCollapsed ? '68px' : `${sidebarWidth}px`) : 0 }}
      >
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="font-bold text-slate-800">Campus360</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-slate-600">{isMoneyArea ? 'Money Management' : isMarketplaceArea ? 'Marketplace' : 'Career'}</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-bold text-blue-600">{breadcrumbSection}</span>
            </div>
          </div>
        </header>

        <main className={isMoneyArea ? 'flex-1 overflow-hidden' : 'flex-1 p-4 sm:p-6 lg:p-8'}>
          {isMoneyArea ? (
            <MoneyManagement activeSection={navigation.section} />
          ) : isMarketplaceArea ? (
            <Marketplace activeSection={navigation.section} onNavigate={(section) => navigate('marketplace', section)} />
          ) : navigation.section === 'survey' ? (
            <CareerSurvey
              surveyData={surveyData}
              careerResults={careerResults}
              selectedCareer={selectedCareer}
              onSaveSurvey={handleSaveSurvey}
              onSelectCareer={setSelectedCareer}
              onGoToColleges={() => navigate('career', 'colleges')}
            />
          ) : (
            <CollegeRecommendation
              selectedCareer={selectedCareer}
              careerResults={careerResults}
              onSelectCareer={setSelectedCareer}
              onGoToSurvey={() => navigate('career', 'survey')}
            />
          )}
        </main>
      </div>
    </div>
  );
}
