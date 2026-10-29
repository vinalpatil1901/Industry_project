import React, { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Star,
  X,
  CheckCircle2,
  Info,
  Globe,
  ExternalLink,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  CURATED_COLLEGES,
  collegesFromSupabase,
  mergeCollegeCatalog,
  rankColleges,
  groupCollegesByState,
  deriveLocations,
  trackLabel,
  fetchLiveColleges,
  googleCollegesUrl,
} from '../utils/collegeRecommendation';

const REVERSE_GEOCODE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

function CollegeCard({ college, onView }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 transition-all flex flex-col sm:flex-row justify-between gap-5">
      <div className="space-y-2.5 flex-1">
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

        <div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">{college.name}</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{[college.city, college.state, college.country].filter(Boolean).join(', ')}</span>
          </p>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">{college.description}</p>

        {college.matchReasons?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {college.matchReasons.map((reason) => (
              <span key={reason} className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                {reason}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Suggested Academic Programs
          </span>
          <div className="flex flex-wrap gap-1.5">
            {college.programs.length > 0 ? college.programs.map((program, index) => (
              <span
                key={`${college.id}-${index}`}
                className="text-[11px] font-medium bg-slate-50 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200"
              >
                {program}
              </span>
            )) : (
              <span className="text-[11px] text-slate-500">Program list not published yet.</span>
            )}
          </div>
        </div>
      </div>

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
          onClick={() => onView(college)}
          className="w-full py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors text-center"
        >
          View Details & Admission
        </button>
      </div>
    </div>
  );
}

export default function CollegeRecommendation({
  selectedCareer,
  careerResults,
  onSelectCareer,
  onGoToSurvey,
}) {
  const [locationInput, setLocationInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [selectedCollegeModal, setSelectedCollegeModal] = useState(null);
  const [catalog, setCatalog] = useState(CURATED_COLLEGES);
  const [catalogNote, setCatalogNote] = useState('');
  const [liveSearch, setLiveSearch] = useState({ query: '', status: 'idle', items: [] });
  const hasCompletedSurvey = Boolean(careerResults?.length && selectedCareer);
  const track = selectedCareer?.trackKey || 'tech';

  // The curated catalogue is always available, so recommendations never render
  // an empty state. Published Supabase colleges are layered on top when the
  // project has them configured.
  useEffect(() => {
    if (!hasCompletedSurvey) return undefined;
    let active = true;

    supabase
      .from('colleges')
      .select('*')
      .eq('is_published', true)
      .order('name')
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setCatalog(CURATED_COLLEGES);
          setCatalogNote('Live college database is unavailable right now, so these come from the Campus360 curated catalogue.');
          return;
        }
        if (!data || data.length === 0) {
          setCatalog(CURATED_COLLEGES);
          setCatalogNote('');
          return;
        }
        setCatalog(mergeCollegeCatalog(collegesFromSupabase(data)));
        setCatalogNote('');
      });

    return () => { active = false; };
  }, [hasCompletedSurvey]);

  const sortedLocations = useMemo(() => deriveLocations(catalog), [catalog]);

  const ranking = useMemo(() => rankColleges(catalog, track, locationInput), [catalog, track, locationInput]);
  const rankedColleges = ranking.items;
  const hasLocationFilter = ranking.hasLocationFilter;
  const query = locationInput.trim();

  // Group by state when browsing, keep a single ranked list when a place is typed.
  const browseGroups = useMemo(() => {
    if (hasLocationFilter) return [];
    return groupCollegesByState(rankedColleges.slice(0, 9));
  }, [hasLocationFilter, rankedColleges]);
  const browseCount = browseGroups.reduce((total, group) => total + group.items.length, 0);

  // Live web fallback for places the catalogue does not cover.
  useEffect(() => {
    if (!hasCompletedSurvey || query.length < 3 || !hasLocationFilter || rankedColleges.length >= 3) {
      return undefined;
    }

    let active = true;
    const timer = setTimeout(() => {
      setLiveSearch({ query, status: 'loading', items: [] });
      fetchLiveColleges(query)
        .then((results) => {
          if (!active) return;
          setLiveSearch({ query, status: results.length ? 'ready' : 'empty', items: results });
        })
        .catch(() => {
          if (!active) return;
          setLiveSearch({ query, status: 'error', items: [] });
        });
    }, 600);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [hasCompletedSurvey, query, hasLocationFilter, rankedColleges.length]);

  // Results only apply to the query they were fetched for.
  const isLiveSearchShown = hasLocationFilter && query.length >= 3 && rankedColleges.length < 3;
  const liveResultsCurrent = liveSearch.query === query;
  const liveColleges = liveResultsCurrent ? liveSearch.items : [];
  const liveStatus = liveResultsCurrent ? liveSearch.status : 'idle';

  const handleUseCurrentLocation = () => {
    setLocationMessage('');
    if (!('geolocation' in navigator)) {
      setLocationMessage('Your browser does not share location. Type a city or state instead.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `${REVERSE_GEOCODE_URL}?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`,
          );
          const place = await response.json();
          const resolved = place.city || place.locality || place.principalSubdivision || place.countryName;
          if (resolved) {
            setLocationInput(resolved);
            setLocationMessage(`Detected ${resolved}. Recommendations updated for your area.`);
          } else {
            setLocationMessage('We could not name your city. Type it above to filter colleges.');
          }
        } catch {
          setLocationMessage('Your city could not be detected. Type a city or state above.');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setLocationMessage('Location permission was blocked. Type a city or state to filter colleges.');
      },
      { timeout: 8000, enableHighAccuracy: false },
    );
  };

  if (!hasCompletedSurvey) {
    return (
      <section className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 p-8 text-center">
        <div className="max-w-md">
          <Info className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-lg font-extrabold text-slate-600">Complete your survey</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your college recommendations are built from your career survey. Answer it once and we will rank colleges that fit your strongest career track and your location.
          </p>
          <button
            type="button"
            onClick={onGoToSurvey}
            className="mt-5 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Go to career survey
          </button>
        </div>
      </section>
    );
  }

  const totalMatches = rankedColleges.length;
  const stateMatches = new Set(rankedColleges.map((college) => college.state || college.country)).size;

  return (
    <div className="w-full space-y-6 animate-fadeIn">

      {/* Active Career Track Bar */}
      {careerResults && careerResults.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 font-medium">Active Career Track:</span>
            <span className="font-bold text-slate-900">{selectedCareer?.title}</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Matching {trackLabel(track)} colleges
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Switch Track:</span>
            <select
              value={selectedCareer?.id || careerResults[0].id}
              onChange={(event) => {
                const found = careerResults.find((career) => career.id === event.target.value);
                if (found) onSelectCareer(found);
              }}
              className="text-xs font-bold text-blue-700 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              {careerResults.map((career) => (
                <option key={career.id} value={career.id}>
                  {career.title} ({career.matchPercentage}%)
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Location filter */}
      <div className="w-full bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-600" />
            Recommend by city, state or country
          </label>
          <span className="text-[11px] text-slate-400">
            {hasLocationFilter
              ? `${totalMatches} institution${totalMatches === 1 ? '' : 's'} across ${stateMatches} state${stateMatches === 1 ? '' : 's'}`
              : `${catalog.length} institutions across ${sortedLocations.length} states & countries`}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={locationInput}
              onChange={(event) => {
                setLocationInput(event.target.value);
                setLocationMessage('');
              }}
              placeholder="Type any city, state or country (e.g. Pune, Maharashtra, Delhi, Karnataka, London, Singapore, Germany)..."
              className="w-full text-xs pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
            {locationInput && (
              <button
                type="button"
                onClick={() => {
                  setLocationInput('');
                  setLocationMessage('');
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label="Clear location"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 border border-slate-300 transition-colors shrink-0 disabled:opacity-60"
          >
            <Navigation className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting...' : 'Use Current Location'}</span>
          </button>
        </div>

        {/* Quick state filters */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => {
              setLocationInput('');
              setLocationMessage('');
            }}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
              locationInput
                ? 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-700'
                : 'bg-blue-600 text-white border-blue-600'
            }`}
          >
            All states
          </button>
          {sortedLocations.slice(0, 8).map((location) => {
            const isActive = locationInput.trim().toLowerCase() === location.label.toLowerCase();
            return (
              <button
                key={location.label}
                type="button"
                onClick={() => {
                  setLocationInput(isActive ? '' : location.label);
                  setLocationMessage('');
                }}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-700'
                }`}
              >
                {location.label} ({location.count})
              </button>
            );
          })}
        </div>

        {locationMessage ? (
          <div className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{locationMessage}</span>
          </div>
        ) : hasLocationFilter ? (
          <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-0.5">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>
              {totalMatches > 0
                ? `Ranked for "${query}" by career fit, academic merit and location.`
                : `No catalogue college is listed in "${query}" yet — showing live web results below.`}
            </span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-0.5">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Showing best-fit colleges for the {trackLabel(track)} track, grouped by state.</span>
          </div>
        )}

        {catalogNote && (
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">{catalogNote}</p>
        )}
      </div>

      {/* Recommendations */}
      <div className="w-full space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{hasLocationFilter ? `Colleges in ${query}` : 'Recommended Colleges'}</span>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
              {hasLocationFilter ? `${totalMatches} matched` : `${browseCount} of ${totalMatches}`}
            </span>
          </h2>
          <span className="text-xs text-slate-500">Ranked by career suitability, merit & location</span>
        </div>

        {totalMatches === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100/70 p-6 text-center">
            <Building2 className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 font-bold text-slate-600">Nothing in the catalogue for “{query}” yet.</p>
            <p className="mt-1 text-sm text-slate-500">Look at the live web results below, or pick one of the state filters above.</p>
          </div>
        )}

        {hasLocationFilter ? (
          <div className="space-y-4">
            {rankedColleges.map((college) => (
              <CollegeCard key={college.id} college={college} onView={setSelectedCollegeModal} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {browseGroups.map((group) => (
              <div key={group.state} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {group.state}
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                      {group.items.length} shown
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setLocationInput(group.state);
                      setLocationMessage('');
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    View all in {group.state}
                  </button>
                </div>
                <div className="space-y-4">
                  {group.items.map((college) => (
                    <CollegeCard key={college.id} college={college} onView={setSelectedCollegeModal} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live web results */}
      {isLiveSearchShown && totalMatches < 3 && (
        <div className="w-full space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              More institutions in “{query}” found online
            </h3>
            <a
              href={googleCollegesUrl(query)}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
            >
              Search Google for colleges in {query}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {(liveStatus === 'loading' || liveStatus === 'idle') && (
            <p className="text-xs text-slate-500">Searching live college sources…</p>
          )}
          {liveStatus === 'error' && (
            <p className="text-xs text-slate-500">Live lookup is unavailable right now. Use the Google search link above.</p>
          )}
          {liveStatus === 'empty' && (
            <p className="text-xs text-slate-500">No extra web results found. Use the Google search link above.</p>
          )}
          {liveColleges.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {liveColleges.map((college) => (
                <li key={college.id} className="py-2.5 flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <a
                      href={college.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-slate-900 hover:text-blue-700 hover:underline flex items-center gap-1"
                    >
                      {college.name}
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    {college.snippet && <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{college.snippet}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[10px] text-slate-400">
            Web results are unverified references from Wikipedia, not admissions data.
          </p>
        </div>
      )}

      {/* College details modal */}
      {selectedCollegeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  {selectedCollegeModal.type}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedCollegeModal.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {[selectedCollegeModal.city, selectedCollegeModal.state, selectedCollegeModal.country].filter(Boolean).join(', ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCollegeModal(null)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{selectedCollegeModal.description}</p>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 block">Average Package</span>
                <strong className="text-slate-800">{selectedCollegeModal.avgPackage}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Tuition Fee</span>
                <strong className="text-slate-800">{selectedCollegeModal.fees}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Ranking</span>
                <strong className="text-slate-800">{selectedCollegeModal.nirfRank}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Rating</span>
                <strong className="text-slate-800">{selectedCollegeModal.rating}</strong>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-800">Key Curriculums:</span>
              <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                {selectedCollegeModal.programs.map((program, index) => (
                  <li key={index}>{program}</li>
                ))}
              </ul>
            </div>

            {selectedCollegeModal.matchReasons?.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800">Why it fits you:</span>
                <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                  {selectedCollegeModal.matchReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 flex flex-wrap justify-between items-center gap-2">
              <a
                href={googleCollegesUrl(`${selectedCollegeModal.name} ${selectedCollegeModal.city}`)}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
              >
                Check admission details online
                <ExternalLink className="w-3 h-3" />
              </a>
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
