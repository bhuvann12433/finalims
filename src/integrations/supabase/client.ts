// Supabase is disabled because the project now uses a custom backend API.
// This prevents the "supabaseUrl is required" runtime error.

// Provide a dummy client object so other files importing `supabase` will not break.
export const supabase = {
  auth: {
    signInWithPassword: () => {
      throw new Error("Supabase is disabled. Use backend API instead.");
    },
    signOut: () => {},
    getSession: () => Promise.resolve({ data: null }),
  },
};
