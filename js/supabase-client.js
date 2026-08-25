const supabaseClient = isSupabaseConfigured()
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

function cloudReady() {
    return Boolean(supabaseClient);
}

function cloudError(error, fallback = 'Cloud request failed.') {
    console.error(error);
    return error?.message || fallback;
}
