// Supabase connection settings.
// Replace these placeholders with values from Supabase Project Settings > API.
// The anon key is safe for browser use when Row Level Security is enabled.
const SUPABASE_URL = 'https://uechhagcrjnfypkanzql.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_98VMIjiZtBBQuladSqOm-w_hh7summM';

function isSupabaseConfigured() {
    return !SUPABASE_URL.includes('YOUR_PROJECT_REF') && !SUPABASE_ANON_KEY.includes('YOUR_');
}
