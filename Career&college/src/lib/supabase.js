import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const UNAVAILABLE_MESSAGE =
  'Online services are not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local, or continue as a guest.';

// Guest-only fallback used when the project is built without Supabase values.
// Every call resolves with the same readable error instead of throwing, so the
// app still boots and guest sections (money, SmartStudy) keep working.
function unavailableQuery() {
  const result = Promise.resolve({ data: null, error: { message: UNAVAILABLE_MESSAGE } });
  let query;
  query = new Proxy({}, {
    get(_target, key) {
      if (key === 'then') return result.then.bind(result);
      if (key === 'catch') return result.catch.bind(result);
      if (key === 'finally') return result.finally.bind(result);
      return () => query;
    },
  });
  return query;
}

const unavailableAuthResult = () => Promise.resolve({ data: null, error: { message: UNAVAILABLE_MESSAGE } });

function createUnavailableClient() {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      getUser: () => Promise.resolve({ data: { user: null }, error: { message: UNAVAILABLE_MESSAGE } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: unavailableAuthResult,
      signUp: unavailableAuthResult,
      signOut: () => Promise.resolve({ error: null }),
      resend: unavailableAuthResult,
    },
    from: unavailableQuery,
    storage: { from: unavailableQuery },
    channel: () => ({ on() { return this; }, subscribe() { return this; } }),
    removeChannel: () => {},
  };
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : createUnavailableClient();
