const UNAVAILABLE_MESSAGE = 'Online services are unavailable in this local build. Please use Guest access or restore the Supabase dependency.';

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

// Keeps guest access available when the local Supabase SDK installation is missing.
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
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
