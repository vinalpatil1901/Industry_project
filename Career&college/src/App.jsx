import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CareerSurvey from './components/CareerSurvey';
import CollegeRecommendation from './components/CollegeRecommendation';
import { evaluateCareers } from './utils/careerEvaluation';
import { Menu, ChevronRight } from 'lucide-react';

export default function App() {
  // Navigation strictly between the two sub-sections: 'survey' and 'colleges'
  const [activeSection, setActiveSection] = useState('survey');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Adjustable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Shared state: survey inputs and evaluated career options
  const [surveyData, setSurveyData] = useState(null);
  const [careerResults, setCareerResults] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);

  // Handle survey submission
  const handleSaveSurvey = (formData) => {
    setSurveyData(formData);
    const evaluated = evaluateCareers(formData);
    setCareerResults(evaluated);
    setSelectedCareer(evaluated[0]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Main Sidebar with section 'Career' -> 'Career Survey' & 'College Recommendation' */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        sidebarWidth={sidebarWidth}
        setSidebarWidth={setSidebarWidth}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* 2. Main Content Area - dynamically respects adjustable sidebar */}
      <div 
        className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-150 ease-out"
        style={{ marginLeft: isDesktop ? (isCollapsed ? '68px' : `${sidebarWidth}px`) : 0 }}
      >
        
        {/* Clean Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb indicator */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="font-bold text-slate-800">Campus360</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-600">Career</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-blue-600 font-bold">
                {activeSection === 'survey' ? 'Career Survey' : 'College Recommendation'}
              </span>
            </div>
          </div>
        </header>

        {/* Sub-section views based on sidebar navigation */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeSection === 'survey' ? (
            <CareerSurvey
              surveyData={surveyData}
              careerResults={careerResults}
              selectedCareer={selectedCareer}
              onSaveSurvey={handleSaveSurvey}
              onSelectCareer={setSelectedCareer}
              onGoToColleges={() => {
                setActiveSection('colleges');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <CollegeRecommendation
              selectedCareer={selectedCareer}
              careerResults={careerResults}
              onSelectCareer={setSelectedCareer}
              onGoToSurvey={() => {
                setActiveSection('survey');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </main>

      </div>

    </div>
  );
}
