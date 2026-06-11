// ========================================
// CONFIG.JS - CONFIGURACIÓN SUPABASE
// ========================================

console.log('✅ config.js cargando...');

// Verificar que Supabase.js cargó
if (typeof window.supabase === 'undefined') {
  console.error('❌ ERROR: supabase-js no cargó correctamente');
  console.error('   Revisa que el CDN está en el HTML:');
  console.error('   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.1"></script>');
}

// Credenciales Supabase
const SUPABASE_URL = 'https://vuxuwgwhbseyhhiypcrg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_rRvknKmMBSccHt-iTib87g_ObEaa2UR';

// Inicializar cliente Supabase SOLO UNA VEZ
let supabaseClient = null;

try {
  const { createClient } = window.supabase;
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('✅ Cliente Supabase inicializado');
} catch (err) {
  console.error('❌ Error inicializando Supabase:', err);
}

// Exportar como window.config para acceso global
window.config = {
  supabaseClient: supabaseClient,
  SUPABASE_URL: SUPABASE_URL,
  SUPABASE_KEY: SUPABASE_KEY
};

// Alias global para compatibilidad
window.supabaseClient = supabaseClient;

console.log('✅ config.js cargado correctamente');