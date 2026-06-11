// ========================================
// APP.JS - SISTEMA DE GESTIÓN RESTAURANTE
// Compatible con index.html - SIN conflictos
// ========================================

// Esperar a que config.js esté listo
if (!window.config) {
  console.error('❌ config.js no cargó. Revisa el orden de los scripts.');
}

// Crear objeto global restaurante (SIN redeclarar db)
window.restaurante = {
  // ========================================
  // PROPIEDADES
  // ========================================
  
  get client() {
    return window.config?.supabaseClient || null;
  },

  get dbTables() {
    return {
      productos: 'productos',
      categorias: 'categorias',
      clientes: 'clientes',
      mesas: 'mesas',
      empleados: 'empleados',
      metodos_pago: 'metodos_pago',
      ventas: 'ventas',
      detalle_ventas: 'detalle_ventas',
      usuarios: 'usuarios'
    };
  },

  // ========================================
  // UTILIDADES
  // ========================================

  formatearDinero(cantidad) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(cantidad || 0);
  },

  formatearFecha(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  },

  formatearHora(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleTimeString('es-MX');
  },

  // ========================================
  // CLIENTES
  // ========================================

  async cargarClientes() {
    try {
      if (!this.client) throw new Error('Cliente Supabase no disponible');
      
      const { data, error } = await this.client
        .from('clientes')
        .select('*')
        .order('nombre');
      
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('❌ Error cargando clientes:', err);
      return [];
    }
  },

  async crearCliente(cliente) {
    try {
      if (!this.client) throw new Error('Cliente Supabase no disponible');
      
      const { data, error } = await this.client
        .from('clientes')
        .insert({
          nombre: cliente.nombre,
          telefono: cliente.telefono || null,
          email: cliente.email || null,
          fecha_registro: new Date().toISOString()
        });
      
      if (error) throw error;
      console.log('✅ Cliente creado:', data);
      return data;
    } catch (err) {
      console.error('❌ Error creando cliente:', err);
      alert('❌ Error: ' + err.message);
      return null;
    }
  },

  // ========================================
  // MESAS
  // ========================================

  async cargarMesas() {
    try {
      if (!this.client) throw new Error('Cliente Supabase no disponible');
      
      const { data, error } = await this.client
        .from('mesas')
        .select('*')
        .order('numero');
      
      if (error) throw error;
      
      // Mapear a formato esperado por HTML
      return (data || []).map(m => ({
        id_mesa: m.id,
        numero_mesa: m.numero || m.numero_mesa,
        capacidad: m.capacidad,
        estado: m.estado
      }));
    } catch (err) {
      console.error('❌ Error cargando mesas:', err);
      return [];
    }
  },

  // ========================================
  // EMPLEADOS
  // ========================================

  async cargarEmpleados() {
    try {
      if (!this.client) throw new Error('Cliente Supabase no disponible');
      
      const { data, error } = await this.client
        .from('empleados')
        .select('*')
        .order('nombre');
      
      if (error) throw error;
      
      return (data || []).map(e => ({
        id_empleado: e.id,
        nombre: e.nombre,
        puesto: e.puesto || '-',
        telefono: e.telefono || '-'
      }));
    } catch (err) {
      console.error('❌ Error cargando empleados:', err);
      return [];
    }
  },

  // ========================================
  // CATEGORÍAS
  // ========================================

  async cargarCategorias() {
    try {
      if (!this.client) throw new Error('Cliente Supabase no disponible');
      
      const { data, error } = await this.client
        .from('categorias')
        .select('*')
        .order('nombre_categoria');
      
      if (error) throw error;
      
      return (data || []).map(c => ({
        id_categoria: c.id || c.id_categoria,
        nombre_categoria: c.nombre_categoria || c.nombre
      }));
    } catch (err) {
      console.error('❌ Error cargando categorías:', err);
      return [];
    }
  },

  // ========================================
  // PRODUCTOS
  // ========================================

  async cargarProductos() {
    try {
      if (!this.client) throw new Error('Cliente Supabase no disponible');
      
      const { data, error } = await this.client
        .from('productos')
        .select('*, categorias(id, nombre_categoria, nombre)')
        .order('nombre');
      
      if (error) throw error;
      
      return (data || []).map(p => ({
        id_producto: p.id,
        nombre_producto: p.nombre,
        precio: p.precio,
        descripcion: p.descripcion,
        categorias: {
          id_categoria: p.categorias?.id,
          nombre_categoria: p.categorias?.nombre_categoria || p.categorias?.nombre
        }
      }));
    } catch (err) {
      console.error('❌ Error cargando productos:', err);
      return [];
    }
  },

  async crearProducto(producto) {
    try {
      if (!this.client) throw new Error('Cliente Supabase no disponible');
      
      const { data, error } = await this.client
        .from('productos')
        .insert({
          nombre: producto.nombre_producto,
          categoria_id: producto.id_categoria,
          precio: producto.precio,
          descripcion: producto.descripcion || null
        });
      
      if (error) throw error;
      console.log('✅ Producto creado:', data);
      return data;
    } catch (err) {
      console.error('❌ Error creando producto:', err);
      alert('❌ Error: ' + err.message);
      return null;
    }
  },

  validarProducto(producto) {
    const errors = [];
    if (!producto.nombre_producto) errors.push('El nombre es requerido');
    if (!producto.id_categoria) errors.push('La categoría es requerida');
    if (producto.precio <= 0) errors.push('El precio debe ser mayor a 0');
    return errors;
  },

  // ========================================
  // VENTAS
  // ========================================

  async cargarVentas() {
    try {
      if (!this.client) throw new Error('Cliente Supabase no disponible');
      
      const { data, error } = await this.client
        .from('ventas')
        .select(`
          id,
          fecha_venta,
          monto,
          clientes(id, nombre),
          mesas(id, numero),
          empleados(id, nombre),
          metodos_pago(id, nombre)
        `)
        .order('fecha_venta', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(v => ({
        id_venta: v.id,
        fecha_venta: v.fecha_venta,
        total: v.monto,
        clientes: { nombre: v.clientes?.nombre || 'Mostrador' },
        mesas: { numero_mesa: v.mesas?.numero || '-' },
        empleados: { nombre: v.empleados?.nombre || '-' },
        metodos_pago: { nombre_metodo: v.metodos_pago?.nombre || '-' }
      }));
    } catch (err) {
      console.error('❌ Error cargando ventas:', err);
      return [];
    }
  },

  // ========================================
  // REPORTES
  // ========================================

  async obtenerReporteDiario(fecha) {
    try {
      if (!this.client) throw new Error('Cliente Supabase no disponible');
      
      const fechaInicio = fecha + 'T00:00:00';
      const fechaFin = fecha + 'T23:59:59';

      const { data, error } = await this.client
        .from('ventas')
        .select('monto')
        .gte('fecha_venta', fechaInicio)
        .lte('fecha_venta', fechaFin);
      
      if (error) throw error;

      const ventas = data || [];
      const cantidad = ventas.length;
      const total = ventas.reduce((sum, v) => sum + (v.monto || 0), 0);
      const promedio = cantidad > 0 ? total / cantidad : 0;

      console.log(`✅ Reporte ${fecha}: ${cantidad} ventas, total $${total}`);
      
      return {
        fecha,
        cantidad,
        total,
        promedio
      };
    } catch (err) {
      console.error('❌ Error obteniendo reporte diario:', err);
      return { fecha, cantidad: 0, total: 0, promedio: 0 };
    }
  },

  async obtenerProductosMasVendidos(dias = 7) {
    try {
      if (!this.client) throw new Error('Cliente Supabase no disponible');
      
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - dias);
      const fechaIso = fechaInicio.toISOString();

      const { data, error } = await this.client
        .from('detalle_ventas')
        .select(`
          cantidad,
          precio_unitario,
          productos(id, nombre)
        `)
        .gte('ventas.fecha_venta', fechaIso);
      
      if (error) throw error;

      // Agrupar por producto
      const agrupado = {};
      (data || []).forEach(item => {
        const nombre = item.productos?.nombre || 'Desconocido';
        if (!agrupado[nombre]) {
          agrupado[nombre] = { nombre, cantidad: 0, ingresos: 0 };
        }
        agrupado[nombre].cantidad += item.cantidad || 0;
        agrupado[nombre].ingresos += (item.cantidad || 0) * (item.precio_unitario || 0);
      });

      const resultado = Object.values(agrupado).sort((a, b) => b.ingresos - a.ingresos);
      console.log(`✅ Top ${dias} días: ${resultado.length} productos`);
      
      return resultado;
    } catch (err) {
      console.error('❌ Error obteniendo productos más vendidos:', err);
      return [];
    }
  }
};

// ========================================
// Crear alias global (si app.js lo necesita)
// ========================================
if (typeof restaurante === 'undefined') {
  window.restaurante = window.restaurante;
}

console.log('✅ app.js cargado correctamente');
console.log('✅ Objeto restaurante disponible en window.restaurante');