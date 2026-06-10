// config.js - CONEXIÓN A SUPABASE
// Las credenciales se cargan desde .env.local (no subidas a GitHub)

const SUPABASE_URL = 'https://vuxuwgwhbseyhhiypcrg.supabase.co';
// En producción, carga esto desde variables de entorno:
// const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

// Para desarrollo local, crear archivo .env.local y usar este código:
const SUPABASE_KEY = 'WLvkNqRRej-K2v6CoVRA_-jX5BR5n'; // Solo para desarrollo local

// Inicializar Supabase
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
  usuarios: 'usuarios'
};

// Función para probar conexión
async function testConnection() {
  try {
    const { data, error } = await supabaseClient
      .from(db.productos)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error.message);
      return false;
    }
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (err) {
    console.error('❌ Error:', err);
    return false;
  }
}

// Inicializar al cargar la página
window.addEventListener('DOMContentLoaded', testConnection);
