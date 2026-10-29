# Campus360 — Project Report

Repository: https://github.com/vinalpatil1901/Industry_project
Branch: `main`
Report date: 29 October 2026

Campus360 is a single-page student platform that combines career guidance, college
recommendations, a student community chat, an AI-free study assistant, a student
money-management dashboard and a peer resource marketplace. Everything ships as one
Vite build and is deployed as one Vercel service.

---

## 1. Technology stack

| Layer | What is used | Where |
| --- | --- | --- |
| Build tool | Vite 8 (`vite build`, `vite dev`) | root `package.json`, `vite.config.js` |
| UI framework | React 19 (`react`, `react-dom`), hooks only, no router library | `Career&college/src` |
| Language | JavaScript (JSX), ES modules | throughout |
| Styling | Tailwind CSS 3.4 with a custom `tailwind.config.js`, plus a global `index.css` | `Career&college/src/index.css` |
| Icons | `lucide-react` (React app), Font Awesome 6.4 via CDN (money app) | both apps |
| Charts | Chart.js 4 (`chart.js/auto`) | `Money Management/script.js` |
| PDF text extraction | `pdfjs-dist` with its bundled worker (`?url` import) | `SmartStudy.jsx` |
| Confetti | `canvas-confetti` | legacy career dashboard component |
| Backend | Supabase: Auth, Postgres (REST via `@supabase/supabase-js` 2.x), Storage, Realtime | `Career&college/src/lib/supabase.js` |
| Deployment | Vercel, one service named `app`, framework `vite`, SPA rewrite to the service | `vercel.json` |
| Fonts | Google Fonts — Plus Jakarta Sans + Space Grotesk (React app), Inter (money app) | both HTML entries |

Environment variables (browser-safe, `VITE_` prefix only):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable / anon key>
```

`Career&college/src/lib/supabase.js` throws a clear error at start-up when either
value is missing, so a misconfigured deploy fails loudly instead of silently.

---

## 2. How the site is assembled

* `index.html` (repo root) loads `/Career&college/src/main.jsx` — this is the whole
  Campus360 shell: sidebar, header, and all React sections.
* `Money Management/index.html` is a **second Vite entry**. It is a standalone
  static page (own HTML/CSS/JS) that the React shell renders inside an
  `<iframe src="/Money%20Management/index.html?embedded=1">`. Navigation is passed
  into the iframe with `postMessage({ type: 'campus360:money-section', section })`.
* `vite.config.js` registers both entries (`app` and `money`) so one build produces
  the React app and the money dashboard. The React config points Vite's `root`
  at the repository root and dedupes React to avoid a second React copy.
* Routing is hash-based and handled in `App.jsx` (`readNavigation`): `#career-survey`,
  `#career-colleges`, `#community-live-chat`, `#study-smart-study`,
  `#money-expense|savings|invest|challenges`, `#marketplace-dashboard|listings|purchases`.

---

## 3. Sections and what each one uses

### 3.1 Login and session

* Files: `Career&college/src/components/LoginPage.jsx`, `src/App.jsx`
* Auth provider: Supabase Auth (email + password). Sign-up stores the full name in
  `user_metadata.full_name`; e-mail confirmation is handled by Supabase.
* Session handling: `supabase.auth.getSession()` on boot and
  `onAuthStateChange` afterwards. Supabase auth is the source of truth —
  `authUserId` in `App.jsx` decides whether the user is signed in, and the derived
  `signedInUser` is what every section receives.
* Guest mode: "Continue as a guest" stores `{ name, email, isGuest: true }` in
  `localStorage` under `campus360-session-v1`; it is a browse-only session.
  A real Supabase session always replaces it, and the header shows a blue
  **Sign in** button for guests (it clears the guest session and returns to the
  login page). Guests are persisted only in the browser; signed-in users get their
  name and email in the header.
* Validation: e-mail format (regex) and an 8-character password minimum are checked
  client-side before calling Supabase.

### 3.2 Career Survey

* Files: `src/components/CareerSurvey.jsx`, `src/utils/careerEvaluation.js`
* Form: four blocks — academic background, technical interest/aptitude, lifestyle
  and work culture, future goals — with 11 required dropdowns, a marks percentage,
  one optional free-text "Core Passion", and a Job / Higher Studies / Business
  path selector. Every dropdown also accepts a custom answer ("Add your own option").
* Evaluation: `evaluateCareers(formData)` scores a fixed catalogue of **10 career
  tracks** (AI/ML Engineer, Cloud & Full-Stack Architect, Cybersecurity Architect,
  Product Designer, FinTech Quant, Data Science & BI, Tech Venture Founder,
  Technical Product Manager, Biomedical & HealthTech, DevOps/SRE). Scoring starts
  from a per-career base score, then adds keyword matches over the answers, a bonus
  for future-path choice, and a marks-based bonus for research-heavy tracks. The
  result is normalised to a match percentage per career and sorted descending.
* Storage: signed-in submissions are inserted into Supabase
  `public.career_survey_responses` (`user_id`, `answers` jsonb). On login the latest
  row is loaded and re-evaluated so results survive a refresh. **Guest survey
  answers are not persisted** — a guest refresh returns to an empty form.
* Result screen: top-3 career cards with match %, description and reasoning, plus
  the remaining careers behind "show more", and a shortcut to College Recommendation.

### 3.3 College Recommendation

* Files: `src/components/CollegeRecommendation.jsx`, `src/utils/collegeRecommendation.js`,
  `src/data/collegesList.js`
* Data sources, in priority order:
  1. **Supabase** `public.colleges` rows where `is_published = true` (fields:
     name, city, state, country, institution type, rating, ranking, programs,
     career tags, packages, fees, description).
  2. **Curated catalogue** — 34 institutions across 19 states/countries, embedded in
     `collegesList.js` (IITs, IISc, IIITs, NITs, IIMs, NID, ISI, AIIMS, BITS, plus
     Stanford, MIT, Berkeley, CMU, Oxford, Cambridge, Imperial, NUS, NTU, UofT, UBC,
     TUM, Melbourne). The two lists are merged and de-duplicated by name + city, and
     the page never shows an empty state because the catalogue is always available.
  3. **Live web fallback** — when a typed place has fewer than three catalogue
     matches, the page queries the Wikipedia search API
     (`https://en.wikipedia.org/w/api.php?...&origin=*`, keyless, CORS-enabled) and
     lists real institutions for that place as unverified references, each linking
     to its article. A Google search link is provided for the same query.
* Ranking: `rankColleges()` scores every college by career-track fit (exact track
  match, or partial credit through a related-track map such as AI → data/cloud/
  research), then by location precision (city → state → country → region →
  keyword), then by rating. Each card explains itself with "why it fits" chips.
* Location features: free-text city/state/country search, quick state chips derived
  from the catalogue, and **Use Current Location**, which reads the browser
  Geolocation API and reverse-geocodes the coordinates with the keyless
  BigDataCloud client API (`api.bigdatacloud.net`) to fill in the city.
* Default view: top 9 best-fit colleges grouped into state sections, with
  "View all in <state>" and a suggested-program list per college. The details modal
  shows packages, fees, ranking, rating, programs and reasons, plus a link to look
  up current admission details online.
* Note: Google Places/Maps was not used because it requires a billed API key that
  must not live in browser code; the keyless Wikipedia source plus Google search
  links cover the same need.

### 3.4 Community — Live Chat

* Files: `src/components/LiveChat.jsx`
* Supabase tables: `public.profiles` (student directory), `public.community_connections`
  (connection requests, `pending` / `accepted`), `public.community_direct_conversations`
  (one row per participant pair, with a deterministic pair helper),
  `public.community_direct_messages` (message bodies).
* Realtime: `supabase.channel(...)` subscriptions on `postgres_changes` for new
  messages in the open conversation, connection changes and new profiles, so the
  directory and chat update live.
* Access: signed-in users only. Guests see "Sign in to use Community"; the RLS
  policies for these tables are `to authenticated`.
* UI: student list with search, send/accept connection requests, conversation pane
  with message history and a composer.

### 3.5 SmartStudy

* File: `src/components/SmartStudy.jsx`
* Input: drag-and-drop or file picker for up to 15 files (`.pdf`, `.txt`, `.md`,
  `.csv`, `.json`, ≤15 MB each), including whole folders.
* Processing: entirely in the browser. PDFs are parsed with `pdfjs-dist` (worker
  loaded as an asset), text files are read with the File API, and the combined text
  is analysed locally. Nothing is uploaded to a server.
* Output: a study plan with word count, recommended review minutes, a readiness
  score, a summary view, revision flashcards and a multi-set practice quiz with
  explanations. Requires at least ~80 characters of selectable text (scanned PDFs
  without OCR are rejected with a clear message). "Download summary PDF" builds a
  printable window from the analysis.

### 3.6 Money Management (embedded dashboard)

* Entry: `Money Management/index.html`, `script.js` (≈1,600 lines), `style.css`
* Rendered inside the React shell via iframe; React only switches sections through
  `postMessage`.
* Four sections:
  1. **Daily Expense Tracker** — add/edit/delete expenses, category and month
     filters, today/monthly totals, daily average, a Chart.js category doughnut and
     an expense history table.
  2. **Small Savings, Big Future** — daily savings calculator with preset amounts,
     compounding over 30/90/180/365 days, future-value milestones and savings goals
     with a progress tracker.
  3. **Future Investment** — SIP explainer and a live SIP projection
     (monthly amount, years, expected annual return → invested amount, estimated
     returns, total value).
  4. **Savings Challenges** — challenge cards, a daily check-in streak and
     completed-challenge counters, with add/reset controls.
* Persistence: `localStorage` only —
  `student_money_expenses`, `student_money_goals`, `student_money_investment_v2`,
  `student_money_challenges_v2`, `student_sidebar_width`. The app does not call
  Supabase.
* Important: `supabase/schema.sql` also defines `expense_entries`, `savings_goals`,
  `investment_entries` and `study_tasks` tables, but the current money UI does not
  use them — the data is per-browser, not per-account.

### 3.7 Learn & Earn (marketplace)

* Files: `src/components/Marketplace.jsx`, `MarketplaceListingForm.jsx`
* Supabase tables: `public.marketplace_listings` (title, category, subject, course,
  semester, college, description, resource type, price, condition, asset/image
  path, status) and `public.marketplace_orders` (buyer, seller, amount, status).
  Seller names are resolved from `public.profiles`.
* Storage: `campus360-assets` bucket — PDFs for digital resources, images for
  physical used books. Files are uploaded into a per-user folder (`<user-id>/...`)
  and opened through short-lived signed URLs.
* Sections: **Learn & Earn** (metrics + browse with category/subject/availability/
  sort/search filters), **My Listings** (publish/unpublish/edit/delete your own
  resources and see request counts), **My Purchases** (completed requests and
  downloads).
* Access control: every write is scoped to the signed-in user id and mirrored by
  RLS policies. Guests can only browse, and the listing action explains that a
  sign-in is required. If the component receives no user id from the shell, it now
  re-checks `supabase.auth.getUser()` before deciding, so a signed-in student is
  never mistaken for a guest.

### 3.8 Study pet

* File: `src/components/StudyPet.jsx`
* A small mascot bubble that rotates area-specific encouragement messages
  (career, community, study, money, marketplace) and can be hidden. Purely
  client-side, no data.

---

## 4. Database and security model

`supabase/schema.sql` is the single source of truth for the backend. It creates:

| Table | Purpose |
| --- | --- |
| `profiles` | one row per auth user (`display_name`, `college_name`, `course`); created by the `handle_new_user()` trigger on sign-up |
| `community_connections` | connection requests between students (`pending` / `accepted`) |
| `community_direct_conversations` | one conversation per participant pair |
| `community_direct_messages` | chat messages, keyed by conversation |
| `career_survey_responses` | latest survey answers per user (`answers` jsonb) |
| `colleges` | published college catalogue (programs jsonb, career tags, fees, ranking) |
| `marketplace_listings` | marketplace resources and used books |
| `marketplace_orders` | access/purchase requests between students |
| `expense_entries`, `savings_goals`, `investment_entries`, `study_tasks` | reserved for the money/smart-study cloud sync; defined but not yet used by the UI |

Row Level Security is enabled on every table. Key policies: profiles readable by any
signed-in user but updatable only by the owner; published colleges readable by
authenticated users; listings readable when published or owned, writable only by the
seller; orders visible to buyer and seller; survey answers restricted to their owner;
storage objects readable by signed-in users and writable only inside the uploader's
own folder. Realtime publication is enabled for profiles, connections and messages.

The schema also seeds 10 public institutions into `colleges` (with volatile figures
deliberately left out) so a fresh project has something to show.

---

## 5. External services and integrations

| Service | Used for | Key required |
| --- | --- | --- |
| Supabase | Auth, Postgres, Storage, Realtime | publishable key (client), project URL |
| Wikipedia search API | live college lookup for places outside the catalogue | no |
| BigDataCloud reverse geocode (client endpoint) | converting browser coordinates into a city for the location filter | no |
| Google search links | "check admission details online", "search colleges in <place>" | no |
| Google Fonts, cdnjs (Font Awesome) | typography and icons | no |

---

## 6. Test report

Environment: local Vite dev server (port 5174) in Chromium, plus a production
`vite build`. Signed-in behaviour was verified with a locally injected Supabase
session (a real account password was not available to the test run), so the UI and
authorisation gating are verified while live database writes still depend on the
project's schema being applied.

| # | Section | What was tested | Result |
| --- | --- | --- | --- |
| 1 | Login page | Empty submit | Pass — "Enter a valid email address." and "Use at least 8 characters for your password." |
| 2 | Login page | Continue as a guest | Pass — enters the app with a GUEST badge and a working Sign in button |
| 3 | Career Survey | Filled all required fields, submitted | Pass — 10 ranked careers; top match "AI & Machine Learning Engineer 94%" for the test answers |
| 4 | Career Survey | Guest reload behaviour | Known limitation — survey is not saved for guests (signed-in users are stored in `career_survey_responses`) |
| 5 | College Recommendation | Default view after survey | Pass — "9 of 34" institutions grouped into 8 state sections, with match reasons and program lists |
| 6 | College Recommendation | Location filter `Maharashtra` | Pass — 3 institutions, all with "In Maharashtra" reasons |
| 7 | College Recommendation | Location filter `Kerala` (not in catalogue) | Pass — live Wikipedia results listed, Google search link present, no dead end |
| 8 | Community | Guest access | Pass — "Sign in to use Community" |
| 9 | Community | Signed-in shell | Pass — connection UI loads instead of the guest block (API rejected the injected test token, as expected) |
| 10 | SmartStudy | Uploaded a `.txt` note and created a plan | Pass — 1 file / 87 words / 5 min / readiness 75, summary, flashcards and quiz all render |
| 11 | Money → Daily Expense Tracker | Added ₹150 "Food" expense | Pass — saved to `student_money_expenses`, today's spend ₹150.00, history row visible |
| 12 | Money → Small Savings | Created a goal (₹50,000, deadline 2027-03-31) | Pass — goal card with 0% progress appears |
| 13 | Money → Future Investment | SIP 2,000/month, 5 years, 12% | Pass — invested ₹1,20,000.00, returns ₹44,972.73, total ₹1,64,972.73 |
| 14 | Money → Savings Challenges | Completed one challenge | Pass — completed counter 2 → 3 |
| 15 | Money sections | Sidebar switching for all four sections | Pass — `expense-section`, `savings-section`, `invest-section`, `challenges-section` each activate |
| 16 | Learn & Earn | Guest browse, "List a resource" | Pass — browsing loads without error, listing shows the sign-in message instead of the old guest error |
| 17 | Learn & Earn | Signed-in "List a resource" | Pass — upload form opens with all fields |
| 18 | Learn & Earn | My Listings / My Purchases | Pass — both sections render their own empty/summary states |
| 19 | Build | `npm run build` (root) | Pass — 4.56 s, no errors |
| 20 | Lint | `oxlint` on the React app | Pass — 0 errors, 7 pre-existing warnings (`react(set-state-in-effect)` in App, Marketplace, LiveChat) |

Not covered by automation: a real end-to-end sign-in with a confirmed account, and
database writes (listing upload, purchase request, survey save) against the live
Supabase project, because no account credentials were available and the schema must
be applied to that project first. Errors from those actions now surface as readable
database messages rather than a misleading guest warning.

---

## 7. Known limitations / next steps

1. **Guest sessions are ephemeral.** Guest surveys and money data live only in the
   browser. Signing in is required for college results to persist across reloads.
2. **Money data is not synced.** The dashboard uses `localStorage`; the
   `expense_entries`, `savings_goals`, `investment_entries` and `study_tasks` tables
   exist but are unused. Moving the dashboard to those tables would give per-account
   data across devices.
3. **Guest browsing of Learn & Earn is blocked by RLS.** The UI allows browsing, but
   the policies are `to authenticated`, so guests see an empty list. Either add an
   `anon` read policy for published listings or make the guest state explicit.
4. **College catalogue depth.** 34 institutions cover 19 states/countries; states
   outside that set rely on the live Wikipedia list rather than the richer
   package/fee cards. Seeding `colleges` through Supabase makes the catalogue
   manageable without code changes.
5. **Live sources are keyless public APIs.** Wikipedia and BigDataCloud are fine for
   reference and reverse geocoding, but they are not admission databases; fee,
   package and ranking figures are editorial estimates and should be re-checked.
6. **Legacy files.** `CareerResultDashboard.jsx`, `CollegeDetailModal.jsx`,
   `Navbar.jsx` and the root `script.js`/`style.css`/empty `career/` folder are no
   longer mounted by `App.jsx` and could be removed in a cleanup pass.
7. **Bundle size.** The main chunk is ~600 kB (SmartStudy's PDF parser is lazy-loaded
   into its own chunk). Further code-splitting is optional.
