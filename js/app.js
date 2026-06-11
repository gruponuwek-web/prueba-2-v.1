// ========================================
// APP.JS - SISTEMA DE GESTIÓN RESTAURANTE
// Compatible con index.html
// ========================================

// Objeto global restaurante
const restaurante = {
  // ========================================
  // PROPIEDADES
  // ========================================
  
  db: {
    productos: 'productos',
    categorias: 'categorias',
    clientes: 'clientes',
    mesas: 'mesas',
    empleados: 'empleados',
    metodos_pago: 'metodos_pago',
    ventas: 'ventas',
    detalle_ventas: 'detalle_ventas',
    usuarios: 'usuarios'
  },

  get client() {
    return window.config?.supabaseClient || null;
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
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  },

  formatearHora(fecha) {
    return new Date(fecha).toLocaleTimeString('es-MX');
  },

  // ========================================
  // CLIENTES
  // ========================================

  async cargarClientes() {
    try {
      const { data, error } = await this.client
        .from(this.db.clientes)
        .select('*')
        .order('nombre');
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error cargando clientes:', err);
      return [];
    }
  },

  async crearCliente(cliente) {
    try {
      const { data, error } = await this.client
        .from(this.db.clientes)
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
      console.error('Error creando cliente:', err);
      alert('❌ Error: ' + err.message);
      return null;
    }
  },

  // ========================================
  // MESAS
  // ========================================

  async cargarMesas() {
    try {
      const { data, error } = await this.client
        .from(this.db.mesas)
        .select('*')
        .order('numero');
      
      if (error) throw error;
      
      return data?.map(m => ({
        id_mesa: m.id,
        numero_mesa: m.numero,
        capacidad: m.capacidad,
        estado: m.estado
      })) || [];
    } catch (err) {
      console.error('Error cargando mesas:', err);
      return [];
    }
  },

  // ========================================
  // EMPLEADOS
  // ========================================

  async cargarEmpleados() {
    try {
      const { data, error } = await this.client
        .from(this.db.empleados)
        .select('*')
        .order('nombre');
      
      if (error) throw error;
      
      return data?.map(e => ({
        id_empleado: e.id,
        nombre: e.nombre,
        puesto: e.puesto,
        telefono: e.telefono || '-'
      })) || [];
    } catch (err) {
      console.error('Error cargando empleados:', err);
      return [];
    }
  },

  // ========================================
  // CATEGORÍAS
  // ========================================

  async cargarCategorias() {
    try {
      const { data, error } = await this.client
        .from(this.db.categorias)
        .select('*')
        .order('nombre_categoria');
      
      if (error) throw error;
      
      return data?.map(c => ({
        id_categoria: c.id,
        nombre_categoria: c.nombre_categoria
      })) || [];
    } catch (err) {
      console.error('Error cargando categorías:', err);
      return [];
    }
  },

  // ========================================
  // PRODUCTOS
  // ========================================

  async cargarProductos() {
    try {
      const { data, error } = await this.client
        .from(this.db.productos)
        .select('*, categorias(id, nombre_categoria)')
        .order('nombre');
      
      if (error) throw error;
      
      return data?.map(p => ({
        id_producto: p.id,
        nombre_producto: p.nombre,
        precio: p.precio,
        descripcion: p.descripcion,
        categorias: {
          id_categoria: p.categorias?.id,
          nombre_categoria: p.categorias?.nombre_categoria
        }
      })) || [];
    } catch (err) {
      console.error('Error cargando productos:', err);
      return [];
    }
  },

  async crearProducto(producto) {
    try {
      const { data, error } = await this.client
        .from(this.db.productos)
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
      console.error('Error creando producto:', err);
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
      const { data, error } = await this.client
        .from(this.db.ventas)
        .select(`
          *,
          clientes(id, nombre),
          mesas(id, numero),
          empleados(id, nombre),
          metodos_pago(id, nombre)
        `)
        .order('fecha_venta', { ascending: false });
      
      if (error) throw error;
      
      return data?.map(v => ({
        id_venta: v.id,
        fecha_venta: v.fecha_venta,
        total: v.monto,
        clientes: { nombre: v.clientes?.nombre },
        mesas: { numero_mesa: v.mesas?.numero },
        empleados: { nombre: v.empleados?.nombre },
        metodos_pago: { nombre_metodo: v.metodos_pago?.nombre }
      })) || [];
    } catch (err) {
      console.error('Error cargando ventas:', err);
      return [];
    }
  },

  // ========================================
  // REPORTES
  // ========================================

  async obtenerReporteDiario(fecha) {
    try {
      const fechaInicio = fecha + 'T00:00:00';
      const fechaFin = fecha + 'T23:59:59';

      const { data, error } = await this.client
        .from(this.db.ventas)
        .select('monto')
        .gte('fecha_venta', fechaInicio)
        .lte('fecha_venta', fechaFin);
      
      if (error) throw error;

      const ventas = data || [];
      const cantidad = ventas.length;
      const total = ventas.reduce((sum, v) => sum + (v.monto || 0), 0);
      const promedio = cantidad > 0 ? total / cantidad : 0;

      return {
        fecha,
        cantidad,
        total,
        promedio
      };
    } catch (err) {
      console.error('Error obteniendo reporte diario:', err);
      return { fecha, cantidad: 0, total: 0, promedio: 0 };
    }
  },

  async obtenerProductosMasVendidos(dias = 7) {
    try {
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - dias);
      const fechaIso = fechaInicio.toISOString();

      const { data, error } = await this.client
        .from(this.db.detalle_ventas)
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

      return Object.values(agrupado).sort((a, b) => b.ingresos - a.ingresos);
    } catch (err) {
      console.error('Error obteniendo productos más vendidos:', err);
      return [];
    }
  }
};

// ========================================
// Alias global para compatibilidad
// ========================================
const db = restaurante.db;
const supabaseClient = window.config?.supabaseClient;

// ========================================
// Log de inicialización
// ========================================
console.log('✅ app.js cargado correctamente');
console.log('✅ Objeto restaurante disponible');