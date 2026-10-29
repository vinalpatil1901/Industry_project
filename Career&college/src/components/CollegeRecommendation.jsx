import React, { useEffect, useMemo, useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Star, 
  X, 
  CheckCircle2, 
  Info,
  Globe
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ALL_COLLEGES } from '../data/collegesList';

function toRecommendationCollege(college) {
  return {
    id: college.id,
    name: college.name,
    city: college.city,
    state: college.state || '',
    country: college.country || 'India',
    type: college.institution_type || college.type || 'Institution',
    rating: college.rating ? (typeof college.rating === 'number' ? `${college.rating} stars` : college.rating) : 'Not rated',
    nirfRank: college.ranking || college.nirfRank || 'Ranking unavailable',
    programs: Array.isArray(college.programs) ? college.programs : [],
    careerTracks: college.career_tags || college.careerTracks || [],
    avgPackage: college.average_package || college.avgPackage || 'Not provided',
    highestPackage: college.highest_package || college.highestPackage || 'Not provided',
    fees: college.annual_fees || college.fees || 'Not provided',
    description: college.description || 'No description provided.',
    region: college.region || `${college.city} ${college.state || ''} ${college.country || ''}`,
    keywords: college.keywords || [],
  };
}

export default function CollegeRecommendation({ 
  selectedCareer, 
  careerResults, 
  onSelectCareer,
  onGoToSurvey,
}) {
  const [locationInput, setLocationInput] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [selectedCollegeModal, setSelectedCollegeModal] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const hasCompletedSurvey = Boolean(careerResults?.length && selectedCareer);

  // Recommendations depend on the student's own survey response. Never use a
  // default career track here: that would show unrelated colleges as if they
  // were personalised recommendations.
  useEffect(() => {
    if (!hasCompletedSurvey) {
      setIsLoading(false);
      return undefined;
    }
    let active = true;
    setIsLoading(true);
    setLoadError('');
    supabase
      .from('colleges')
      .select('*')
      .eq('is_published', true)
      .order('name')
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setLoadError(error.code === 'PGRST205' || error.code === '42P01'
            ? 'College data has not been set up in Supabase yet.'
            : 'College recommendations could not be loaded.');
          setColleges([]);
        } else {
          setColleges((data || []).map((college) => ({
            id: college.id,
            name: college.name,
            city: college.city,
            state: college.state || '',
            country: college.country || 'India',
            type: college.institution_type || 'Institution',
            rating: college.rating ? `${college.rating} ★` : 'Not rated',
            nirfRank: college.ranking || 'Ranking unavailable',
            programs: Array.isArray(college.programs) ? college.programs : [],
            careerTracks: college.career_tags || [],
            avgPackage: college.average_package || 'Not provided',
            highestPackage: college.highest_package || 'Not provided',
            fees: college.annual_fees || 'Not provided',
            description: college.description || 'No description provided.',
            region: `${college.city} ${college.state || ''} ${college.country || ''}`,
            keywords: [],
          })));
        }
        setIsLoading(false);
      });
    return () => { active = false; };
  }, [hasCompletedSurvey]);

  // Handle "Use Current Location" button
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setLocationMessage("");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsLocating(false);
          setLocationMessage('Location permission granted. Type your city to filter published colleges.');
        },
        () => {
          setIsLocating(false);
          setLocationMessage('Location could not be detected. Type your city to filter published colleges.');
        },
        { timeout: 3000 }
      );
    } else {
      setIsLocating(false);
      setLocationMessage('Location is unavailable. Type your city to filter published colleges.');
    }
  };

  // Filter and suggest 4 to 5 colleges for ANY city, state, or country typed
  const { suggestedColleges, matchStatus } = useMemo(() => {
    const track = selectedCareer?.trackKey || "tech";
    const rawQuery = locationInput.trim().toLowerCase();

    // Base candidate pool prioritizing the selected career track
    const trackPrioritized = colleges.filter((col) =>
      col.careerTracks.includes(track)
    );
    const candidatePool = [...trackPrioritized, ...colleges.filter(c => !trackPrioritized.some(p => p.id === c.id))];

    if (!rawQuery) {
      // Default: Return top 5 colleges for the active track
      return {
        suggestedColleges: candidatePool.slice(0, 5),
        matchStatus: "Showing top recommended premier institutions"
      };
    }

    // Comprehensive query matching: city, state, country, region, keywords, name
    const queryTokens = rawQuery.split(/[\s,]+/).filter(t => t.length > 1);

    // Exact or direct substring matches
    const exactMatches = candidatePool.filter((col) => {
      const cityMatch = col.city.toLowerCase().includes(rawQuery);
      const stateMatch = col.state.toLowerCase().includes(rawQuery);
      const countryMatch = col.country.toLowerCase().includes(rawQuery);
      const regionMatch = col.region.toLowerCase().includes(rawQuery);
      const nameMatch = col.name.toLowerCase().includes(rawQuery);
      const kwMatch = col.keywords && col.keywords.some(k => k.toLowerCase().includes(rawQuery) || rawQuery.includes(k.toLowerCase()));

      return cityMatch || stateMatch || countryMatch || regionMatch || nameMatch || kwMatch;
    });

    // Token-based matching (e.g. "California USA" or "Pune Maharashtra")
    let results = exactMatches;
    if (results.length === 0 && queryTokens.length > 0) {
      results = candidatePool.filter((col) => {
        return queryTokens.some(token => 
          col.city.toLowerCase().includes(token) ||
          col.state.toLowerCase().includes(token) ||
          col.country.toLowerCase().includes(token) ||
          col.name.toLowerCase().includes(token) ||
          (col.keywords && col.keywords.some(k => k.toLowerCase().includes(token)))
        );
      });
    }

    // If matches found, ensure we provide 4 to 5 institutions by supplementing with best regional/track institutes
    if (results.length > 0) {
      if (results.length < 5) {
        // Pad with top institutes in the same country or track
        const matchedCountry = results[0].country;
        const sameCountryColleges = candidatePool.filter(c => 
          c.country === matchedCountry && !results.some(r => r.id === c.id)
        );
        const remainder = candidatePool.filter(c => 
          !results.some(r => r.id === c.id) && !sameCountryColleges.some(s => s.id === c.id)
        );
        results = [...results, ...sameCountryColleges, ...remainder];
      }

      return {
        suggestedColleges: results.slice(0, 5),
        matchStatus: `Filtered for location: "${locationInput.trim()}"`
      };
    } else {
      // Smart Fallback: If user types a remote town, display top universities accessible for that area/track
      return {
        suggestedColleges: candidatePool.slice(0, 5),
        matchStatus: `Showing top premier universities accessible for "${locationInput.trim()}"`
      };
    }
  }, [selectedCareer, locationInput, colleges]);

  if (!hasCompletedSurvey) {
    return (
      <section className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 p-8 text-center">
        <div className="max-w-md">
          <Info className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-lg font-extrabold text-slate-600">Complete your survey</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Your college recommendations will appear here after you complete the career survey.</p>
          <button type="button" onClick={onGoToSurvey} className="mt-5 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">Go to career survey</button>
        </div>
      </section>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      
      {/* Active Career Track Bar */}
      {careerResults && careerResults.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Active Career Track:</span>
            <span className="font-bold text-slate-900">{selectedCareer?.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Switch Track:</span>
            <select
              value={selectedCareer?.id || careerResults[0].id}
              onChange={(e) => {
                const found = careerResults.find(c => c.id === e.target.value);
                if (found) onSelectCareer(found);
              }}
              className="text-xs font-bold text-blue-700 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              {careerResults.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.matchPercentage}%)
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* LOCATION FILTER / SEARCH BAR ONLY (Image 3: Quick tabs removed) */}
      <div className="w-full bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-600" />
            Filter by Custom or Current Location
          </label>
          <span className="text-[11px] text-slate-400">
            Suggesting 4 to 5 curated institutions
          </span>
        </div>

        {/* Search Bar + Use Current Location Button */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setLocationMessage("");
              }}
              placeholder="Type any city, state, or country (e.g. Mumbai, California, London, Bangalore, Singapore, Delhi, Germany)..."
              className="w-full text-xs pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
            {locationInput && (
              <button
                type="button"
                onClick={() => {
                  setLocationInput("");
                  setLocationMessage("");
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Use Current Location Action Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 border border-slate-300 transition-colors shrink-0"
          >
            <Navigation className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? "Detecting..." : "Use Current Location"}</span>
          </button>
        </div>

        {/* Location Status Badge */}
        {locationMessage ? (
          <div className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{locationMessage}</span>
          </div>
        ) : locationInput ? (
          <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-0.5">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{matchStatus}</span>
          </div>
        ) : null}
      </div>

      {/* 4 TO 5 SUGGESTED COLLEGES LIST */}
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Recommended Colleges</span>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
              {suggestedColleges.length} Top Institutions
            </span>
          </h2>
          <span className="text-xs text-slate-500">
            Ranked by academic merit & career suitability
          </span>
        </div>

        <div className="space-y-4">
          {isLoading && <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">Loading college recommendations…</div>}
          {!isLoading && suggestedColleges.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100/70 p-8 text-center"><p className="font-bold text-slate-600">{loadError || 'No published colleges match this career track yet.'}</p><p className="mt-1 text-sm text-slate-500">Only colleges added and published in Supabase appear here.</p></div>}
          {suggestedColleges.map((college) => (
            <div
              key={college.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 transition-all flex flex-col sm:flex-row justify-between gap-5"
            >
              {/* College Information Column */}
              <div className="space-y-2.5 flex-1">
                
                {/* Type, Ranking & Global Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {college.type}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {college.rating}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {college.nirfRank}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {college.country}
                  </span>
                </div>

                {/* College Title */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {college.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{college.city}, {college.state}, {college.country}</span>
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {college.description}
                </p>

                {/* Programs Chips */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Suggested Academic Programs
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {college.programs.map((prog, pIdx) => (
                      <span
                        key={pIdx}
                        className="text-[11px] font-medium bg-slate-50 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200"
                      >
                        {prog}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Stats & Actions Sidebar */}
              <div className="sm:w-56 bg-slate-50 p-4 rounded-xl border border-slate-200/90 flex flex-col justify-between space-y-3 shrink-0">
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg Package</span>
                    <span className="text-sm font-bold text-slate-900">{college.avgPackage}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Highest Offer</span>
                    <span className="text-xs font-bold text-emerald-600">{college.highestPackage}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Estimated Tuition</span>
                    <span className="text-xs font-bold text-slate-800">{college.fees}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCollegeModal(college)}
                  className="w-full py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors text-center"
                >
                  View Details & Admission
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* College Modal details */}
      {selectedCollegeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  {selectedCollegeModal.type}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedCollegeModal.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedCollegeModal.city}, {selectedCollegeModal.state}, {selectedCollegeModal.country}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCollegeModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedCollegeModal.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 block">Average Package</span>
                <strong className="text-slate-800">{selectedCollegeModal.avgPackage}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Tuition Fee</span>
                <strong className="text-slate-800">{selectedCollegeModal.fees}</strong>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-800">
                Key Curriculums:
              </span>
              <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                {selectedCollegeModal.programs.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCollegeModal(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
