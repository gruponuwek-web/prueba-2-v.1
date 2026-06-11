// config.js - SUPABASE AUTH (SEGURO)
console.log('✅ config.js cargando...');

const SUPABASE_URL = 'https://vuxuwgwhbseyhhiypcrg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_rRvknKmMBSccHt-iTib87g_ObEaa2UR';

const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Variables globales
const db = {
  clientes: 'clientes',
  mesas: 'mesas',
  empleados: 'empleados',
  categorias: 'categorias',
  metodos_pago: 'metodos_pago',
  productos: 'productos',
  ventas: 'ventas',
  detalle_ventas: 'detalle_ventas',
  perfiles: 'perfiles' // Tabla de perfiles en lugar de usuarios
};

// Listener de cambios de autenticación
supabaseClient.auth.onAuthStateChange(async (event, session) => {
  console.log('🔐 Auth event:', event);
  
  if (event === 'SIGNED_IN' && session) {
    // Usuario inició sesión
    const user = session.user;
    localStorage.setItem('supabase.auth.token', session.access_token);
    localStorage.setItem('usuarioActual', JSON.stringify({
      id: user.id,
      email: user.email,
      session: session
    }));
    console.log('✅ Usuario autenticado:', user.email);
    
  } else if (event === 'SIGNED_OUT') {
    // Usuario cerró sesión
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('usuarioActual');
    console.log('🚪 Sesión cerrada');
  }
});

// Obtener sesión actual
async function obtenerSesionActual() {
  const { data } = await supabaseClient.auth.getSession();
  return data.session;
}

console.log('✅ config.js cargado correctamente');