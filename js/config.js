// ============================================
// CONFIGURATION — Edit these values
// ============================================
const CONFIG = {
  SUPABASE_URL: 'https://kgbygrmwtwpmomkbmnzj.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnYnlncm13dHdwbW9ta2JtbnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcwODYsImV4cCI6MjA5MzA1MzA4Nn0.RZ3p8bbyp2zxODfhhfiXprSGwrM4D8TAa_CZLnktyYU',

  ITEMS_PER_PAGE: 15,
  REFRESH_INTERVAL: 60000,

  LEADS_TABLE: 'validated_leads',
  WHATSAPP_TABLE: 'phone_outreach_queue',
};

const { createClient } = supabase;
const supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
