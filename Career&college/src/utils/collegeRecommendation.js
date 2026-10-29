import { ALL_COLLEGES } from '../data/collegesList';

// Career tracks that are close enough to a college's tags to still count as a
// good fit. The survey produces one of: ai, cloud, tech, design, quant,
// business, biotech.
const RELATED_TRACKS = {
  ai: ['ai', 'data', 'tech', 'research', 'cloud'],
  cloud: ['cloud', 'tech', 'engineering', 'data'],
  tech: ['tech', 'cloud', 'ai', 'engineering', 'data'],
  design: ['design', 'product', 'creative'],
  quant: ['quant', 'finance', 'data', 'research'],
  business: ['business', 'finance'],
  biotech: ['biotech', 'research', 'healthcare'],
};

const TRACK_LABELS = {
  ai: 'AI & Data Science',
  cloud: 'Cloud & Software',
  tech: 'Technology',
  design: 'Design',
  quant: 'Quant & Analytics',
  business: 'Business',
  biotech: 'Biotech & Research',
};

function ratingValue(rating) {
  if (typeof rating === 'number') return rating;
  const parsed = parseFloat(String(rating || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return [];
}

function curatedToCollege(college) {
  return {
    ...college,
    id: college.id,
    state: college.state || '',
    country: college.country || 'India',
    type: college.type || 'Institution',
    rating: college.rating || 'Not rated',
    nirfRank: college.nirfRank || 'Ranking unavailable',
    programs: asList(college.programs),
    careerTracks: asList(college.careerTracks).map((track) => track.toLowerCase()),
    keywords: asList(college.keywords).map((keyword) => keyword.toLowerCase()),
    avgPackage: college.avgPackage || 'Not provided',
    highestPackage: college.highestPackage || 'Not provided',
    fees: college.fees || 'Not provided',
    description: college.description || 'No description provided.',
    region: college.region || `${college.city}, ${college.state || ''} ${college.country || ''}`,
    source: 'Campus360 curated catalogue',
  };
}

export function collegesFromSupabase(rows) {
  return (rows || []).map((row) => ({
    id: row.id,
    name: row.name,
    city: row.city,
    state: row.state || '',
    country: row.country || 'India',
    region: `${row.city || ''} ${row.state || ''} ${row.country || ''}`.trim(),
    type: row.institution_type || 'Institution',
    rating: row.rating ? `${row.rating} ★` : 'Not rated',
    nirfRank: row.ranking || 'Ranking unavailable',
    programs: asList(row.programs),
    careerTracks: asList(row.career_tags).map((track) => track.toLowerCase()),
    keywords: [],
    avgPackage: row.average_package || 'Not provided',
    highestPackage: row.highest_package || 'Not provided',
    fees: row.annual_fees || 'Not provided',
    description: row.description || 'No description provided.',
    source: 'Campus360 database',
  }));
}

export const CURATED_COLLEGES = ALL_COLLEGES.map(curatedToCollege);

/** Merge database rows over the curated catalogue, newest source wins on duplicates. */
export function mergeCollegeCatalog(dbColleges) {
  const merged = new Map();
  CURATED_COLLEGES.forEach((college) => {
    merged.set(`${college.name}|${college.city}`.toLowerCase(), college);
  });
  (dbColleges || []).forEach((college) => {
    merged.set(`${college.name}|${college.city}`.toLowerCase(), { ...college, source: 'Campus360 database' });
  });
  return [...merged.values()];
}

function normalise(value) {
  return String(value || '').toLowerCase().trim();
}

/** Score one college against the active career track and the typed location. */
function scoreCollege(college, track, tokens) {
  const tags = college.careerTracks;
  const reasons = [];
  let trackScore = 0;

  if (tags.includes(track)) {
    trackScore = 50;
    reasons.push(`Strong ${TRACK_LABELS[track] || track} track`);
  } else {
    const relatedHit = (RELATED_TRACKS[track] || []).find((related) => tags.includes(related));
    if (relatedHit) {
      trackScore = 28;
      reasons.push(`Offers nearby ${TRACK_LABELS[relatedHit] || relatedHit} programs`);
    }
  }

  let locationScore = 0;
  if (tokens.length) {
    const city = normalise(college.city);
    const state = normalise(college.state);
    const country = normalise(college.country);
    const region = normalise(college.region);
    const name = normalise(college.name);
    const keywords = college.keywords;

    const cityHit = tokens.some((token) => city.includes(token) || token.includes(city));
    const stateHit = state && tokens.some((token) => state.includes(token) || token.includes(state));
    const countryHit = tokens.some((token) => country.includes(token) || token.includes(country));
    const regionHit = region && tokens.some((token) => region.includes(token));
    const nameHit = tokens.some((token) => name.includes(token));
    const keywordHit = keywords.some((keyword) => tokens.some((token) => keyword.includes(token)));

    if (cityHit) {
      locationScore = 45;
      reasons.push(`Located in ${college.city}`);
    } else if (stateHit) {
      locationScore = 40;
      reasons.push(`In ${college.state}`);
    } else if (countryHit) {
      locationScore = 34;
      reasons.push(`In ${college.country}`);
    } else if (regionHit) {
      locationScore = 26;
      reasons.push(`In ${college.region}`);
    } else if (nameHit) {
      locationScore = 20;
      reasons.push('Name matches your search');
    } else if (keywordHit) {
      locationScore = 18;
      reasons.push('Matches your location keyword');
    }
  }

  const quality = ratingValue(college.rating) * 2;
  return {
    ...college,
    score: trackScore + locationScore + quality,
    trackScore,
    locationScore,
    matchReasons: reasons,
  };
}

export function trackLabel(track) {
  return TRACK_LABELS[track] || 'your career track';
}

/**
 * Rank colleges for the active career track. When a location is typed, only
 * location matches are returned (best fit first); otherwise the strongest
 * track matches are returned so the page is never empty.
 */
export function rankColleges(colleges, track, locationQuery) {
  const cleanTrack = normalise(track) || 'tech';
  const tokens = normalise(locationQuery).split(/[^a-z0-9]+/).filter((token) => token.length > 1);
  const scored = colleges.map((college) => scoreCollege(college, cleanTrack, tokens));

  if (tokens.length === 0) {
    return {
      items: scored.sort((a, b) => b.score - a.score),
      hasLocationFilter: false,
    };
  }

  const locationMatches = scored.filter((college) => college.locationScore > 0);
  return {
    items: locationMatches.sort((a, b) => b.score - a.score),
    hasLocationFilter: true,
    totalInCatalog: colleges.length,
  };
}

/** States/cities present in the catalogue, used for quick filters. */
export function deriveLocations(colleges) {
  const states = new Map();
  colleges.forEach((college) => {
    const key = college.state || college.country;
    if (!key) return;
    const entry = states.get(key) || { label: key, country: college.country, count: 0 };
    entry.count += 1;
    states.set(key, entry);
  });
  return [...states.values()].sort((a, b) => b.count - a.count);
}

export function groupCollegesByState(colleges) {
  const groups = new Map();
  colleges.forEach((college) => {
    const key = college.state || college.country || 'Other';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(college);
  });
  return [...groups.entries()].map(([state, items]) => ({ state, items }));
}

const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const BLOCKED_TITLE = /^(list of|education in|higher education|universities in|colleges in|category:)/i;

function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, '').trim();
}

/**
 * Live web fallback: when a student types a city/state/country that the
 * catalogue does not cover, search Wikipedia (no API key, CORS friendly) for
 * real institutions in that place. Results link out to the source article.
 */
export async function fetchLiveColleges(locationQuery) {
  const query = locationQuery.trim();
  if (!query) return [];
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: `university college institute in ${query}`,
    srlimit: '12',
    srprop: 'snippet',
    format: 'json',
    origin: '*',
  });

  const response = await fetch(`${WIKI_API}?${params.toString()}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Live college search is unavailable right now.');
  const payload = await response.json();
  const results = payload?.query?.search || [];

  return results
    .filter((item) => !BLOCKED_TITLE.test(item.title))
    .slice(0, 6)
    .map((item) => ({
      id: `live-${item.pageid}`,
      name: item.title,
      snippet: stripHtml(item.snippet),
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/\s+/g, '_'))}`,
    }));
}

export function googleCollegesUrl(locationQuery) {
  const query = locationQuery.trim() || 'India';
  return `https://www.google.com/search?q=${encodeURIComponent(`best colleges universities in ${query}`)}`;
}
