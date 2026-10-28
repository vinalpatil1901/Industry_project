import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  ArrowLeft, 
  Share2, 
  Printer, 
  TrendingUp, 
  DollarSign, 
  GraduationCap, 
  ShoppingBag, 
  MapPin, 
  Star, 
  CheckCircle2, 
  ChevronRight, 
  Compass, 
  Layers, 
  ShieldCheck, 
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react';
import CollegeDetailModal from './CollegeDetailModal';
import MarketplaceModal from './MarketplaceModal';

export default function CareerResultDashboard({ 
  resultData, 
  onRetakeSurvey, 
  onSwitchCareer 
}) {
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedMarketplaceItem, setSelectedMarketplaceItem] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  const {
    primaryCareer,
    primaryMatchPercentage,
    scoresBreakdown,
    secondaryRecommendations,
    topColleges,
    marketplaceItems,
    evaluatedAt,
    rawSurveyData
  } = resultData;

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  }, [primaryCareer.id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddToCart = (item) => {
    setCartCount(prev => prev + 1);
    showToast(`"${item.title.slice(0, 32)}..." added to your Campus360 Locker Bag!`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Career & College Recommendation link copied to clipboard!");
    } else {
      showToast("Link ready to share!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <button
            onClick={onRetakeSurvey}
            className="hover:text-blue-600 flex items-center gap-1 text-slate-600 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Edit Survey Inputs
          </button>
          <span>/</span>
          <span className="text-slate-800 font-bold">Career & College Dossier</span>
          <span>/</span>
          <span className="text-blue-600 font-bold">{primaryCareer.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {cartCount > 0 && (
            <div className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
              <span>Campus Bag ({cartCount})</span>
            </div>
          )}

          <button
            onClick={handleShare}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            Share Track
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print / PDF Dossier
          </button>

          <button
            onClick={onRetakeSurvey}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            Retake Survey
          </button>
        </div>
      </div>

      {/* 1. PERSONALIZED HEADER CARD (Explicit Requirement) */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/40 relative overflow-hidden">
        {/* Glow & Backdrop decorative */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Left Student Info & Congratulatory Statement */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Campus360 Evaluation Engine • Evaluated on {evaluatedAt}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Recommended Track: <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200 bg-clip-text text-transparent">
                {primaryCareer.title}
              </span>
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              Based on your academic stream (<span className="text-blue-300 font-semibold">{rawSurveyData?.stream || "Computer Science"}</span>, <span className="text-blue-300 font-semibold">{rawSurveyData?.percentage || 88}%</span> score), primary goal (<span className="text-emerald-300 font-semibold">{rawSurveyData?.pathSelection || "Job"}</span>), and your affinity for <span className="text-blue-200 font-semibold">{primaryCareer.relatedDisciplines?.slice(0, 2).join(" & ")}</span>, you demonstrate an extraordinary aptitude for this domain.
            </p>

            {/* Sub-Score Metrics */}
            <div className="pt-2 grid grid-cols-3 gap-3 text-center sm:text-left">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">
                  Academic Synergy
                </div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {scoresBreakdown?.academicScore}%
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">
                  Passion & Lifestyle
                </div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {scoresBreakdown?.passionScore}%
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">
                  Market Growth
                </div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  {primaryCareer.payScale.growth}
                </div>
              </div>
            </div>
          </div>

          {/* Right Compatibility Radial Dial */}
          <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex flex-col items-center justify-center text-center shadow-inner min-w-[240px]">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Radial SVG Gauge */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/15"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * primaryMatchPercentage) / 100}
                  strokeLinecap="round"
                  className="text-emerald-400 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">
                  {primaryMatchPercentage}%
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">
                  Match Score
                </span>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ★ Optimal Career Compatibility
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-2">
              Ranked #{1} out of 18 industry career profiles evaluated.
            </p>
          </div>

        </div>
      </div>

      {/* 2. CAREER OVERVIEW CARD (Explicit Requirement) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        
        {/* Card Header & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {primaryCareer.category}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {primaryCareer.payScale.growth}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {primaryCareer.title}
            </h2>
            <p className="text-slate-500 text-xs italic mt-0.5">
              "{primaryCareer.tagline}"
            </p>
          </div>

          {/* Pay Scale Quick Grid */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Estimated Market Compensation
            </div>
            <div className="flex items-baseline gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Entry-Level</span>
                <span className="font-bold text-slate-800">{primaryCareer.payScale.entry}</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 block">Mid-Career</span>
                <span className="font-bold text-blue-700">{primaryCareer.payScale.mid}</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 block">Lead / Senior</span>
                <span className="font-bold text-emerald-700">{primaryCareer.payScale.senior}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Description & Why You Matched */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-600" />
              Role Description & Mission
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              {primaryCareer.summary}
            </p>

            <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200/60 space-y-2">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                Why this matches your survey input:
              </span>
              <ul className="space-y-1.5">
                {primaryCareer.matchReasons.map((reason, idx) => (
                  <li key={idx} className="text-xs text-blue-900/90 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical & Soft Skills Chips */}
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center justify-between">
                <span>Core Technical Skills Required</span>
                <span className="text-[10px] text-slate-400 font-normal">Proficiency Target</span>
              </h3>
              <div className="space-y-2.5">
                {primaryCareer.techSkills.map((skill, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span>{skill.name}</span>
                      <span className="text-blue-600 font-bold">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                Essential Soft & Cognitive Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {primaryCareer.softSkills.map((soft, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200"
                  >
                    ✦ {soft}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Day in the Life & Progression Roadmap */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Career Progression Roadmap (Years 1 to 5+)
            </h3>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Progression trajectory for top candidates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {primaryCareer.roadmap.map((stage, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                    {stage.year}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Phase 0{idx + 1}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 pt-1">
                  {stage.role}
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {stage.focus}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. DEDICATED GRID OF 3 TOP-TIER RECOMMENDED COLLEGES (Explicit Requirement) */}
      <div id="colleges-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Top 3 Recommended Colleges & Universities
              </h2>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Curated institutions with the highest placement track record, premier lab infrastructure, and alumni density for {primaryCareer.title}.
            </p>
          </div>

          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
            3 High-Affinity Matches
          </span>
        </div>

        {/* The 3 Dedicated College Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topColleges.map((college) => (
            <div
              key={college.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-card-hover transition-all flex flex-col overflow-hidden group"
            >
              {/* Card Banner */}
              <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/40 relative">
                
                {/* Status Badges: Public / Private / Autonomous & Rating (Explicit Requirement) */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${college.statusColor}`}>
                    {college.status} Institution
                  </span>

                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1 shadow-2xs">
                    <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
                    {college.rating}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {college.name}
                </h3>

                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {college.location}
                </p>

                <div className="text-[11px] text-blue-800 font-semibold mt-2 bg-blue-100/70 px-2 py-1 rounded-md">
                  {college.ranking}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                
                {/* Recommended Academic Program */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Recommended Curriculum
                  </span>
                  <div className="text-xs font-bold text-slate-800">
                    {college.program}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Tuition: <strong className="text-slate-700">{college.tuition}</strong>
                  </div>
                </div>

                {/* Placement Stats Strip */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 grid grid-cols-2 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg Placement</span>
                    <span className="text-xs font-black text-slate-900">{college.avgPackage}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Placement Rate</span>
                    <span className="text-xs font-black text-emerald-600">{college.placementRate}</span>
                  </div>
                </div>

                {/* College Highlights list */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Campus Distinctions
                  </span>
                  {college.highlights.slice(0, 2).map((h, hIdx) => (
                    <div key={hIdx} className="text-[11px] text-slate-600 flex items-start gap-1.5 leading-snug">
                      <span className="text-blue-600 font-bold shrink-0">✦</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={() => setSelectedCollege(college)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-blue-600 text-white flex items-center justify-center gap-1.5 transition-colors group-hover:shadow-md"
                >
                  <span>View Admission & Cutoff Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CROSS-FUNCTIONAL INTEGRATION CARD (Explicit Requirement) */}
      {/* Links directly to the Campus360 Student Marketplace */}
      <div id="marketplace-section" className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 rounded-2xl p-6 sm:p-8 border border-amber-300/80 shadow-xs space-y-6">
        
        {/* Marketplace Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                  Campus360 Student Marketplace Integration
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Verified Seniors
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Required Second-Hand Textbooks & Lab Kits
              </h2>
              <p className="text-slate-600 text-xs mt-0.5 max-w-2xl">
                Save up to 75% on semester reading materials. Pre-annotated books and hardware kits listed directly by senior students graduating from this career path.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Zero-commissions peer student exchange
            </span>
          </div>
        </div>

        {/* Marketplace Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {marketplaceItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-amber-400 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                
                {/* Condition & Discount pill */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.conditionColor}`}>
                    {item.condition}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {item.discount}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-amber-700 transition-colors">
                  {item.title}
                </h4>

                <p className="text-[11px] text-slate-500 italic">
                  {item.authors}
                </p>

                {/* Pricing row */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-lg font-black text-slate-900">
                    ₹{item.secondHandPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs line-through text-slate-400">
                    ₹{item.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">
                    Save ₹{(item.originalPrice - item.secondHandPrice).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Seller Mini Profile */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full ${item.seller.avatarBg} text-white font-bold flex items-center justify-center text-[10px]`}>
                      {item.seller.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 leading-tight flex items-center gap-1">
                        {item.seller.name}
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{item.seller.campus}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                    ★ {item.seller.rating}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedMarketplaceItem(item)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-center"
                >
                  View Details & Chat
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToCart(item)}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center gap-1 shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Reserve
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Marketplace Banner Footer Action */}
        <div className="bg-white rounded-xl p-4 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-bold text-slate-900">Looking for more second-hand materials?</span>
            <span className="hidden sm:inline text-slate-500">Access student notes, semester test papers, and graphing calculators.</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (marketplaceItems[0]) setSelectedMarketplaceItem(marketplaceItems[0]);
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>Open Campus360 Marketplace Hub</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 5. SECONDARY CAREER RECOMMENDATIONS */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Alternative Career Tracks Matching Your Profile
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your multidisciplinary answers also demonstrated strong compatibility with these alternate industry pathways.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {secondaryRecommendations.map((rec, idx) => (
            <div
              key={rec.career.id}
              className="bg-slate-50 hover:bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-400 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Alternative Match #{idx + 2}
                  </span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    {rec.matchPercentage}% Affinity
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {rec.career.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {rec.career.summary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500">
                  Avg: <strong className="text-slate-800">{rec.career.payScale.mid}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => onSwitchCareer(rec.career.id)}
                  className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  <span>Explore Track</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* College Detail Modal */}
      {selectedCollege && (
        <CollegeDetailModal
          college={selectedCollege}
          onClose={() => setSelectedCollege(null)}
        />
      )}

      {/* Marketplace Modal */}
      {selectedMarketplaceItem && (
        <MarketplaceModal
          item={selectedMarketplaceItem}
          onClose={() => setSelectedMarketplaceItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

    </div>
  );
}
