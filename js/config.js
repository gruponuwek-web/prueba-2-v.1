console.log('✅ config.js cargando...');

const SUPABASE_URL = 'https://vuxuwgwhbseyhhiypcrg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_rRvknKmMBSccHt-iTib87g_ObEaa2UR';

const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

window.config = {
  supabaseClient: supabaseClient,
  SUPABASE_URL: SUPABASE_URL,
  SUPABASE_KEY: SUPABASE_KEY
};

console.log('✅ config.js cargado correctamente');