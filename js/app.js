// app.js - LÓGICA DEL SISTEMA DE RESTAURANTE (VERSIÓN CORREGIDA)

// Helper para obtener cliente desde config
const getClient = () => {
  if (!window.config || !window.config.supabaseClient) {
    console.error('❌ Supabase no está inicializado');
    return null;
  }
  return window.config.supabaseClient;
};

const getDb = () => {
  if (!window.config || !window.config.db) {
    return {};
  }
  return window.config.db;
};

// ============================================
// PRODUCTOS - CRUD
// ============================================

async function cargarProductos(id_categoria = null) {
  try {
    const client = getClient();
    const db = getDb();
    if (!client) return [];
    
    let query = client
      .from(db.productos)
      .select(`
        *,
        categorias(nombre_categoria)
      `)
      .eq('activo', true);
    
    if (id_categoria) {
      query = query.eq('id_categoria', id_categoria);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error al cargar productos:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Error al cargar productos:', err);
    return [];
  }
}

async function crearProducto(producto) {
  try {
    const client = getClient();
    const db = getDb();
    if (!client) return null;
    
    const { data, error } = await client
      .from(db.productos)
      .insert([producto])
      .select();
    
    if (error) throw error;
    console.log('✅ Producto creado:', data);
    return data;
  } catch (err) {
    console.error('Error al crear producto:', err);
    return null;
  }
}

async function actualizarProducto(id, cambios) {
  try {
    const client = getClient();
    const db = getDb();
    if (!client) return null;
    
    const { data, error } = await client
      .from(db.productos)
      .update(cambios)
      .eq('id_producto', id)
      .select();
    
    if (error) throw error;
    console.log('✅ Producto actualizado:', data);
    return data;
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    return null;
  }
}

// ============================================
// MESAS - CRUD
// ============================================

async function cargarMesas() {
  try {
    const client = getClient();
    const db = getDb();
    if (!client) return [];
    
    const { data, error } = await client
      .from(db.mesas)
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error al cargar mesas:', err);
    return [];
  }
}

async function actualizarEstadoMesa(id_mesa, estado) {
  try {
    const client = getClient();
    const db = getDb();
    if (!client) return null;
    
    const { data, error } = await client
      .from(db.mesas)
      .update({ estado })
      .eq('id_mesa', id_mesa)
      .select();
    
    if (error) throw error;
    console.log('✅ Mesa actualizada:', data);
    return data;
  } catch (err) {
    console.error('Error al actualizar mesa:', err);
    return null;
  }
}

// ============================================
// VENTAS - CRUD
// ============================================

async function crearVenta(venta) {
  try {
    const client = getClient();
    const db = getDb();
    if (!client) return null;
    
    const { data, error } = await client
      .from(db.ventas)
      .insert([venta])
      .select();
    
    if (error) throw error;
    console.log('✅ Venta creada:', data);
    return data[0];
  } catch (err) {
    console.error('Error al crear venta:', err);
    return null;
  }
}

async function crearDetalleVenta(detalles) {
  try {
    const client = getClient();
    const db = getDb();
    if (!client) return null;
    
    const { data, error } = await client
      .from(db.detalle_ventas)
      .insert(detalles)
      .select();
    
    if (error) throw error;
    console.log('✅ Detalles de venta creados:', data);
    return data;
  } catch (err) {
    console.error('Error al crear detalles:', err);
    return null;
  }
}

async function cargarVentas(filtros = {}) {
  try {
    const client = getClient();
    const db = getDb();
    if (!client) return [];
    
    let query = client
      .from(db.ventas)
      .select(`
        *,
        clientes(nombre),
        mesas(numero_mesa),
        empleados(nombre),
        metodos_pago(nombre_metodo),
        detalle_ventas(
          cantidad,
          precio_unitario,
          productos(nombre_producto)
        )
      `);
    
    if (filtros.fecha_inicio && filtros.fecha_fin) {
      query = query.gte('fecha_venta', filtros.fecha_inicio)
                    .lte('fecha_venta', filtros.fecha_fin);
    }
    
    if (filtros.estatus) {
      query = query.eq('estatus', filtros.estatus);
    }
    
    const { data, error } = await query.order('fecha_venta', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error al cargar ventas:', err);
    return [];
  }
}

// ============================================
// CLIENTES - CRUD
// ============================================

async function crearCliente(cliente) {
  try {
    const client = getClient();
    const db = getDb();
    if (!client) return null;
    
    const { data, error } = await client
      .from(db.clientes)
      .insert([cliente])
      .select();
    
    if (error) throw error;
    console.log('✅ Cliente creado:', data);
    return data;
  } catch (err) {
    console.error('Error al crear cliente:', err);
    return null;
  }
}

async function cargarClientes() {
  try {
    const client = getClient();
    const db = getDb();
    if (!client) return [];
    
    const { data, error } = await client
      .from(db.clientes)
      .select('*')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error al cargar clientes:', err);
    return [];
  }
}

// ============================================
// CATEGORIAS - CRUD
// ============================================

async function cargarCategorias() {
  try {
    const client = getClient();
    const db = getDb();
    if (!client) return [];
    
    const { data, error } = await client
      .from(db.categorias)
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error al cargar categorías:', err);
    return [];
  }
}

// ============================================
// EMPLEADOS - CRUD
// ============================================

async function cargarEmpleados() {
  try {
    const client = getClient();
    const db = getDb();
    if (!client) return [];
    
    const { data, error } = await client
      .from(db.empleados)
      .select('*')
      .eq('activo', true);
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error al cargar empleados:', err);
    return [];
  }
}

// ============================================
// REPORTES Y ANALYTICS
// ============================================

async function obtenerReporteDiario(fecha) {
  try {
    const client = getClient();
    const db = getDb();
    if (!client) return { total: 0, cantidad: 0, promedio: 0, ventas: [] };
    
    const inicio = `${fecha}T00:00:00`;
    const fin = `${fecha}T23:59:59`;
    
    const { data, error } = await client
      .from(db.ventas)
      .select('*')
      .gte('fecha_venta', inicio)
      .lte('fecha_venta', fin);
    
    if (error) throw error;
    
    const total = data.reduce((sum, venta) => sum + parseFloat(venta.total), 0);
    const cantidad = data.length;
    const promedio = cantidad > 0 ? (total / cantidad).toFixed(2) : 0;
    
    return { total, cantidad, promedio, ventas: data };
  } catch (err) {
    console.error('Error al obtener reporte:', err);
    return { total: 0, cantidad: 0, promedio: 0, ventas: [] };
  }
}

async function obtenerProductosMasVendidos(dias = 30) {
  try {
    const client = getClient();
    const db = getDb();
    if (!client) return [];
    
    const fecha_inicio = new Date();
    fecha_inicio.setDate(fecha_inicio.getDate() - dias);
    
    const { data, error } = await client
      .from(db.detalle_ventas)
      .select(`
        id_producto,
        cantidad,
        productos(nombre_producto, precio)
      `)
      .gte('ventas.fecha_venta', fecha_inicio.toISOString());
    
    if (error) throw error;
    
    const productos = {};
    data.forEach(item => {
      const id = item.id_producto;
      if (!productos[id]) {
        productos[id] = {
          nombre: item.productos.nombre_producto,
          cantidad: 0,
          ingresos: 0
        };
      }
      productos[id].cantidad += item.cantidad;
      productos[id].ingresos += item.cantidad * item.productos.precio;
    });
    
    return Object.values(productos).sort((a, b) => b.cantidad - a.cantidad);
  } catch (err) {
    console.error('Error al obtener productos más vendidos:', err);
    return [];
  }
}

// ============================================
// VALIDACIONES
// ============================================

function validarVenta(venta) {
  const errores = [];
  
  if (!venta.id_empleado) errores.push('Empleado requerido');
  if (!venta.id_metodo_pago) errores.push('Método de pago requerido');
  if (venta.total <= 0) errores.push('Total debe ser mayor a 0');
  
  return errores;
}

function validarProducto(producto) {
  const errores = [];
  
  if (!producto.nombre_producto) errores.push('Nombre del producto requerido');
  if (!producto.id_categoria) errores.push('Categoría requerida');
  if (producto.precio <= 0) errores.push('Precio debe ser mayor a 0');
  
  return errores;
}

// ============================================
// UTILIDADES
// ============================================

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString('es-MX');
}

function formatearDinero(cantidad) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(cantidad);
}

// Exportar para usarlas en otros archivos
window.restaurante = {
  cargarProductos,
  crearProducto,
  actualizarProducto,
  cargarMesas,
  actualizarEstadoMesa,
  crearVenta,
  crearDetalleVenta,
  cargarVentas,
  crearCliente,
  cargarClientes,
  cargarCategorias,
  cargarEmpleados,
  obtenerReporteDiario,
  obtenerProductosMasVendidos,
  validarVenta,
  validarProducto,
  formatearFecha,
  formatearDinero
};

console.log('✅ app.js cargado correctamente');