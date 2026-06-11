console.log('✅ config.js cargando...');

const SUPABASE_URL = 'https://vuxuwgwhbseyhhiypcrg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_rRvknKmMBSccHt-iTib87g_ObEaa2UR';

const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

window.db = {
  productos: 'productos',
  categorias: 'categorias',
  clientes: 'clientes',
  mesas: 'mesas',
  empleados: 'empleados',
  metodos_pago: 'metodos_pago',
  ventas: 'ventas',
  detalle_ventas: 'detalle_ventas'
};

window.config = { supabaseClient, SUPABASE_URL, SUPABASE_KEY };
window.supabaseClient = supabaseClient;

console.log('✅ config.js cargado correctamente');