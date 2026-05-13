// ============================================
// CONFIGURATION — Edit these values
// ============================================
const CONFIG = {
  SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR-ANON-KEY-HERE',

  ITEMS_PER_PAGE: 15,
  REFRESH_INTERVAL: 60000,

  LEADS_TABLE: 'validated_leads',
  WHATSAPP_TABLE: 'phone_outreach_queue',
};

const { createClient } = supabase;
const supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
