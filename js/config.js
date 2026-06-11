// config.js - CONEXIÓN A SUPABASE (VERSIÓN CORREGIDA)
// Para proyectos HTML/JS en el navegador, las credenciales van aquí directamente

// ⚠️ IMPORTANTE: En producción (GitHub Pages), estas credenciales son públicas
// Pero Supabase está diseñado para esto (anon key es pública por defecto)
// Lo importante es que .env.local NO se suba a GitHub (está en .gitignore)

const SUPABASE_URL = 'https://vuxuwgwhbseyhhiypcrg.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_publishable_O2P4R_Dsh_b-MbtnAervFg_KO08zArl'; // Clave completa

// Verificar que Supabase esté disponible
if (!window.supabase) {
  console.error('❌ Supabase no se cargó. Verifica que el CDN está accesible.');
}

// Inicializar Supabase
const { createClient } = window.supabase;

let supabaseClient;

try {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('✅ Cliente Supabase inicializado');
} catch (err) {
  console.error('❌ Error al inicializar Supabase:', err.message);
}

// Nombres de tablas (para referencia)
const db = {
  clientes: 'clientes',
  mesas: 'mesas',
  empleados: 'empleados',
  categorias: 'categorias',
  metodos_pago: 'metodos_pago',
  productos: 'productos',
  ventas: 'ventas',
  detalle_ventas: 'detalle_ventas',
  usuarios: 'usuarios'
};

// Función para probar conexión
async function testConnection() {
  try {
    console.log('🔄 Probando conexión a Supabase...');
    
    const { data, error } = await supabaseClient
      .from(db.productos)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de Supabase:', error.message);
      const statusEl = document.getElementById('connection-status');
      if (statusEl) statusEl.innerHTML = '❌ ' + error.message;
      return false;
    }
    
    console.log('✅ Conexión a Supabase exitosa');
    const statusEl = document.getElementById('connection-status');
    if (statusEl) statusEl.innerHTML = '✅ Conectado a Supabase';
    return true;
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    const statusEl = document.getElementById('connection-status');
    if (statusEl) statusEl.innerHTML = '❌ ' + err.message;
    return false;
  }
}

// Exportar para usar en otros archivos
window.config = {
  supabaseClient,
  db,
  testConnection
};

console.log('✅ config.js cargado correctamente');