import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Briefcase, 
  GraduationCap, 
  Rocket, 
  Zap,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Cpu,
  Heart,
  Target
} from 'lucide-react';

const SAMPLE_PROFILE = {
  qualification: "Undergraduate Degree (B.Tech/B.Sc)",
  marksPercentage: "88",
  stream: "Computer Science & Engineering",
  favoriteSubjects: "Computer Science & Algorithms",
  primaryInterest: "Artificial Intelligence & Deep Learning",
  secondaryInterest: "Cloud Systems & Distributed Infrastructure",
  coreAptitude: "Logical & Algorithmic Problem Solving",
  hobbies: "Coding side projects, Robotics tinkering, Open source",
  passion: "Architecting intelligent algorithms and high-scale software systems",
  freeTimeActivity: "Building side projects & participating in hackathons",
  workEnvironment: "Fast-Paced High Growth Startup",
  careerMotive: "Technical Mastery & Pioneering Inventions",
  preferredLearningStyle: "Hands-on Practical Building & Project-based",
  futurePath: "Job" // Job / Higher Studies / Business
};

export default function CareerSurvey({ 
  surveyData, 
  careerResults, 
  selectedCareer, 
  onSaveSurvey, 
  onSelectCareer, 
  onGoToColleges 
}) {
  const [formData, setFormData] = useState(surveyData || SAMPLE_PROFILE);
  const [isFormVisible, setIsFormVisible] = useState(!careerResults || careerResults.length === 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for expanding more career options if user is not satisfied with top 3
  const [showMoreCareers, setShowMoreCareers] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFillSample = () => {
    setFormData(SAMPLE_PROFILE);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onSaveSurvey(formData);
      setIsSubmitting(false);
      setIsFormVisible(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  };

  // Top 3 primary careers vs remaining alternative careers
  const primaryCareers = careerResults ? careerResults.slice(0, 3) : [];
  const additionalCareers = careerResults ? careerResults.slice(3) : [];

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      
      {/* RESULT SECTION: Dynamic Career Options */}
      {!isFormVisible && careerResults && careerResults.length > 0 && (
        <div className="w-full space-y-6">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Suggested Best-Fit Career Options
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated from your academic profile, intellectual strengths, lifestyle habits, and life ambitions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFormVisible(true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              Edit / Retake Survey
            </button>
          </div>

          {/* Top 3 Best-Fit Career Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {primaryCareers.map((career, idx) => {
              const isSelected = selectedCareer?.id === career.id || (!selectedCareer && idx === 0);

              return (
                <div
                  key={career.id}
                  className={`bg-white rounded-xl border p-6 transition-all flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3.5">
                    
                    {/* Top Row: Rank & Match Score */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        Top Match #{idx + 1}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {career.matchPercentage}% Compatibility
                      </span>
                    </div>

                    {/* Career Title */}
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {career.title}
                    </h3>

                    {/* Career Description */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {career.description}
                    </p>

                    {/* Match Reason */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] text-slate-600">
                      <strong className="text-slate-800">Why it fits you:</strong> {career.matchWhy}
                    </div>

                    {/* Required Skills Chips */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Required Core Skills
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {career.requiredSkills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Call to action for colleges */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCareer(career);
                        onGoToColleges();
                      }}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-2xs"
                    >
                      <span>View Colleges for this Track</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* MORE CAREERS EXPANDABLE SECTION (if user wants to explore beyond top 3) */}
          {additionalCareers.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Not fully satisfied with these suggestions?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Explore {additionalCareers.length} additional career pathways that also demonstrate high affinity with your profile.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMoreCareers(!showMoreCareers)}
                  className="px-4 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-200 shrink-0"
                >
                  <span>{showMoreCareers ? "Hide Additional Options" : `Look at ${additionalCareers.length} More Options`}</span>
                  {showMoreCareers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Expanded Additional Careers Grid */}
              {showMoreCareers && (
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                  {additionalCareers.map((career, idx) => (
                    <div
                      key={career.id}
                      className="bg-slate-50/70 hover:bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-5 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                            Alternative #{idx + 4}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {career.matchPercentage}% Affinity
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 leading-snug">
                          {career.title}
                        </h4>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {career.description}
                        </p>

                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Key Skills
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {career.requiredSkills.slice(0, 3).map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[10px] font-medium bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCareer(career);
                            onGoToColleges();
                          }}
                          className="w-full py-2 px-3 bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-300"
                        >
                          <span>Select & View Colleges</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* FULL-PAGE COMPREHENSIVE SURVEY FORM */}
      {isFormVisible && (
        <form onSubmit={handleSubmit} className="w-full bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8">
          
          {/* Header Title with 1-Click Sample Profile Button */}
          <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Complete Career & Academic Survey
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide accurate details about your academic standing, technical interests, personal lifestyle, and career aspirations.
              </p>
            </div>

            <button
              type="button"
              onClick={handleFillSample}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              Fill Sample Profile
            </button>
          </div>

          {/* SECTION 1: Academic Background & Performance */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 text-sm font-bold text-slate-900">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>1. Academic Background & Performance</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Qualification */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Highest / Current Qualification <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.qualification}
                  onChange={(e) => handleInputChange('qualification', e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="10th Standard / Secondary School">10th Standard / Secondary School</option>
                  <option value="12th Standard / Higher Secondary (Science/PCM)">12th Standard / Higher Secondary (Science/PCM)</option>
                  <option value="12th Standard / Higher Secondary (Commerce)">12th Standard / Higher Secondary (Commerce)</option>
                  <option value="12th Standard / Higher Secondary (Arts/Humanities)">12th Standard / Higher Secondary (Arts/Humanities)</option>
                  <option value="Undergraduate Degree (B.Tech/B.Sc)">Undergraduate Degree (B.Tech/B.Sc)</option>
                  <option value="Undergraduate Degree (B.Com/BBA)">Undergraduate Degree (B.Com/BBA)</option>
                  <option value="Diploma / Polytechnic">Diploma / Polytechnic</option>
                  <option value="Postgraduate Degree (M.Tech/M.S/MBA)">Postgraduate Degree (M.Tech/M.S/MBA)</option>
                </select>
              </div>

              {/* Marks / Percentage */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Academic Marks / Percentage (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="40"
                  max="100"
                  required
                  value={formData.marksPercentage}
                  onChange={(e) => handleInputChange('marksPercentage', e.target.value)}
                  placeholder="e.g. 88"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Stream / Branch */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Academic Stream / Discipline <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.stream}
                  onChange={(e) => handleInputChange('stream', e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology & Software">Information Technology & Software</option>
                  <option value="Electronics & Communication (ECE)">Electronics & Communication (ECE)</option>
                  <option value="Mechanical & Mechatronics">Mechanical & Mechatronics</option>
                  <option value="Commerce, Finance & Accountancy">Commerce, Finance & Accountancy</option>
                  <option value="Pure Mathematics & Statistics">Pure Mathematics & Statistics</option>
                  <option value="Life Sciences, Biotech & Pre-Med">Life Sciences, Biotech & Pre-Med</option>
                  <option value="Design, Arts & Media Communications">Design, Arts & Media Communications</option>
                </select>
              </div>

              {/* Favorite Subjects */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Favorite Academic Subject <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.favoriteSubjects}
                  onChange={(e) => handleInputChange('favoriteSubjects', e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Computer Science & Algorithms">Computer Science & Algorithms</option>
                  <option value="Mathematics & Calculus">Mathematics & Calculus</option>
                  <option value="Physics & Mechanics">Physics & Mechanics</option>
                  <option value="Economics, Finance & Accounting">Economics, Finance & Accounting</option>
                  <option value="Statistics & Probability">Statistics & Probability</option>
                  <option value="Biology & Genetics">Biology & Genetics</option>
                  <option value="Graphic Design, Art & Psychology">Graphic Design, Art & Psychology</option>
                  <option value="Business Studies & Management">Business Studies & Management</option>
                </select>
              </div>

            </div>
          </div>

          {/* SECTION 2: Core Interests & Technical Domains */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 text-sm font-bold text-slate-900">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>2. Technical Domains & Intellectual Strengths</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Primary Interest */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Primary Interest Domain <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.primaryInterest}
                  onChange={(e) => handleInputChange('primaryInterest', e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Artificial Intelligence & Deep Learning">Artificial Intelligence & Deep Learning</option>
                  <option value="Cloud Systems & Distributed Infrastructure">Cloud Systems & Distributed Infrastructure</option>
                  <option value="Cybersecurity, Ethical Hacking & Networks">Cybersecurity, Ethical Hacking & Networks</option>
                  <option value="Product Design, UI/UX & Interaction Design">Product Design, UI/UX & Interaction Design</option>
                  <option value="FinTech, Algorithmic Trading & Quantitative Finance">FinTech, Algorithmic Trading & Quantitative Finance</option>
                  <option value="Data Science & Business Intelligence">Data Science & Business Intelligence</option>
                  <option value="Tech Entrepreneurship & Venture Startups">Tech Entrepreneurship & Venture Startups</option>
                  <option value="Biomedical Engineering & HealthTech">Biomedical Engineering & HealthTech</option>
                  <option value="Robotics, Embedded Systems & IoT">Robotics, Embedded Systems & IoT</option>
                  <option value="Technical Product Management">Technical Product Management</option>
                </select>
              </div>

              {/* Secondary Interest */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Secondary Complementary Interest <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.secondaryInterest}
                  onChange={(e) => handleInputChange('secondaryInterest', e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Cloud Systems & Distributed Infrastructure">Cloud Systems & Distributed Infrastructure</option>
                  <option value="Artificial Intelligence & Deep Learning">Artificial Intelligence & Deep Learning</option>
                  <option value="Data Science & Business Analytics">Data Science & Business Analytics</option>
                  <option value="Product Design & Human-Computer Interaction">Product Design & Human-Computer Interaction</option>
                  <option value="Cybersecurity & Defense Systems">Cybersecurity & Defense Systems</option>
                  <option value="Stock Markets & Corporate Valuation">Stock Markets & Corporate Valuation</option>
                  <option value="Hardware Architecture & Microcontrollers">Hardware Architecture & Microcontrollers</option>
                  <option value="Venture Creation & Product Strategy">Venture Creation & Product Strategy</option>
                </select>
              </div>

              {/* Core Intellectual Aptitude */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Greatest Natural Strength / Aptitude <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.coreAptitude}
                  onChange={(e) => handleInputChange('coreAptitude', e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Logical & Algorithmic Problem Solving">Logical & Algorithmic Problem Solving</option>
                  <option value="Visual, Spatial & Creative Design Intuition">Visual, Spatial & Creative Design Intuition</option>
                  <option value="Quantitative, Numerical & Statistical Analysis">Quantitative, Numerical & Statistical Analysis</option>
                  <option value="Systematic Debugging & Technical Troubleshooting">Systematic Debugging & Technical Troubleshooting</option>
                  <option value="Strategic Leadership, Communication & Negotiation">Strategic Leadership, Communication & Negotiation</option>
                  <option value="Scientific Experimentation & Research Meticulousness">Scientific Experimentation & Research Meticulousness</option>
                </select>
              </div>

            </div>
          </div>

          {/* SECTION 3: Passions, Habits & Lifestyle */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 text-sm font-bold text-slate-900">
              <Heart className="w-4 h-4 text-blue-600" />
              <span>3. Lifestyle, Hobbies & Preferred Work Environment</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Hobbies Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Primary Hobby <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.hobbies}
                  onChange={(e) => handleInputChange('hobbies', e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Coding side projects, Robotics tinkering, Open source">Coding side projects & Open Source</option>
                  <option value="Competitive Programming & Algorithmic Problem Solving">Competitive Programming & Puzzles</option>
                  <option value="Digital Art, 3D Modeling & UI Design">Digital Art, 3D Modeling & UI Design</option>
                  <option value="Stock Market, Crypto & Financial Trading">Stock Market & Crypto Trading</option>
                  <option value="Reading Tech Publications, Non-Fiction & Research Papers">Reading Tech & Research Publications</option>
                  <option value="Robotics, Embedded Systems & IoT Tinkering">Robotics & IoT Hardware Tinkering</option>
                  <option value="Gaming, Modding & Esports Strategy">Gaming, Modding & Esports Strategy</option>
                  <option value="Content Creation, Podcasting & Technical Blogging">Content Creation & Tech Blogging</option>
                  <option value="Music Production & Audio Engineering">Music Production & Audio Engineering</option>
                  <option value="Community Outreach, Teaching & Volunteering">Community Outreach & Volunteering</option>
                  <option value="Sports, Chess & Strategic Board Games">Sports, Chess & Strategy Games</option>
                </select>
              </div>

              {/* Free time activity */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Free Time Activity <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.freeTimeActivity}
                  onChange={(e) => handleInputChange('freeTimeActivity', e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Building side projects & participating in hackathons">Building side projects & hackathons</option>
                  <option value="Designing interactive mockups & prototypes in Figma">Designing interactive UI mockups</option>
                  <option value="Analyzing financial market charts & macroeconomics">Analyzing financial market charts</option>
                  <option value="Reading scientific preprints & experimenting with code">Reading preprints & experimenting</option>
                  <option value="Brainstorming venture ideas & business models">Brainstorming business & startup ideas</option>
                  <option value="Playing strategy games or competitive esports">Playing competitive strategy games</option>
                </select>
              </div>

              {/* Work Environment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Preferred Work Culture <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.workEnvironment}
                  onChange={(e) => handleInputChange('workEnvironment', e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Fast-Paced High Growth Startup">Fast-Paced High Growth Startup (High Ownership)</option>
                  <option value="Big Tech / Global Multinational Enterprise">Global Big Tech Enterprise (High Scale & Stability)</option>
                  <option value="Research & Academic Laboratory">Research & Academic Lab (Deep Science & Rigor)</option>
                  <option value="Remote / Digital Nomad Environment">Remote & Decentralized (High Flexibility)</option>
                  <option value="Quantitative Hedge Fund / Investment Bank">Hedge Fund / Investment Bank (High Stakes)</option>
                  <option value="Creative Design & Media Studio">Creative Design Studio (Artistic & Collaborative)</option>
                </select>
              </div>

              {/* Core Passion (Optional, no asterisk) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Core Passion <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.passion}
                  onChange={(e) => handleInputChange('passion', e.target.value)}
                  placeholder="e.g. Building scalable software tools, solving algorithms"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

            </div>
          </div>

          {/* SECTION 4: Future Ambitions & Life Goals */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 text-sm font-bold text-slate-900">
              <Target className="w-4 h-4 text-blue-600" />
              <span>4. Future Horizons & Career Goals</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Life Goals & Career Motive */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Primary Career Motive <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.careerMotive}
                  onChange={(e) => handleInputChange('careerMotive', e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Technical Mastery & Pioneering Inventions">Technical Mastery & Pioneering Inventions</option>
                  <option value="Maximizing High-Income Potential & Rapid Wealth">Maximizing High-Income Potential & Rapid Wealth</option>
                  <option value="Building Scalable Tech Ventures as a Founder">Building Scalable Tech Ventures as a Founder</option>
                  <option value="Work-Life Balance, Job Security & Freedom">Work-Life Balance, Job Security & Freedom</option>
                  <option value="Creating Meaningful Societal / Healthcare Impact">Creating Meaningful Societal / Healthcare Impact</option>
                </select>
              </div>

              {/* Preferred Learning Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Preferred Learning Mode <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.preferredLearningStyle}
                  onChange={(e) => handleInputChange('preferredLearningStyle', e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Hands-on Practical Building & Project-based">Hands-on Practical Building & Project-based</option>
                  <option value="Deep Theoretical & Research-driven">Deep Theoretical & Research-driven</option>
                  <option value="Visual Video Demonstrations & Case Studies">Visual Video Demonstrations & Case Studies</option>
                  <option value="Mentorship & Peer Apprenticeship">Mentorship & Peer Apprenticeship</option>
                  <option value="Self-Paced Independent Documentation Reading">Self-Paced Independent Documentation Reading</option>
                </select>
              </div>

              {/* Future Path Selection: Job / Higher Studies / Business */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Future Path Selection <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Job", label: "Job", icon: Briefcase },
                    { id: "Higher Studies", label: "Higher Studies", icon: GraduationCap },
                    { id: "Business", label: "Business", icon: Rocket }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = formData.futurePath === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleInputChange('futurePath', item.id)}
                        className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-5 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Evaluating Comprehensive Profile...
                </>
              ) : (
                <>
                  <span>Submit & Analyze Careers</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
