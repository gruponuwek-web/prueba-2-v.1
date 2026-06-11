console.log('✅ app.js cargando...');

window.restaurante = {
  formatearDinero(cantidad) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(cantidad || 0);
  },

  formatearFecha(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-MX');
  },

  async cargarClientes() {
    try {
      const { data, error } = await window.supabaseClient
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

  async cargarMesas() {
    try {
      const { data, error } = await window.supabaseClient
        .from('mesas')
        .select('*')
        .order('numero');
      if (error) throw error;
      return (data || []).map(m => ({
        id_mesa: m.id,
        numero_mesa: m.numero,
        capacidad: m.capacidad,
        estado: m.estado
      }));
    } catch (err) {
      console.error('❌ Error cargando mesas:', err);
      return [];
    }
  },

  async cargarEmpleados() {
    try {
      const { data, error } = await window.supabaseClient
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

  async cargarCategorias() {
    try {
      const { data, error } = await window.supabaseClient
        .from('categorias')
        .select('*')
        .order('nombre_categoria');
      if (error) throw error;
      return (data || []).map(c => ({
        id_categoria: c.id,
        nombre_categoria: c.nombre_categoria || c.nombre
      }));
    } catch (err) {
      console.error('❌ Error cargando categorías:', err);
      return [];
    }
  },

  async cargarProductos() {
    try {
      const { data, error } = await window.supabaseClient
        .from('productos')
        .select('*, categorias(id, nombre_categoria)')
        .order('nombre');
      if (error) throw error;
      return (data || []).map(p => ({
        id_producto: p.id,
        nombre_producto: p.nombre,
        precio: p.precio,
        descripcion: p.descripcion,
        categorias: {
          id_categoria: p.categorias?.id,
          nombre_categoria: p.categorias?.nombre_categoria
        }
      }));
    } catch (err) {
      console.error('❌ Error cargando productos:', err);
      return [];
    }
  },

  async crearProducto(producto) {
    try {
      const { data, error } = await window.supabaseClient
        .from('productos')
        .insert({
          nombre: producto.nombre_producto,
          categoria_id: producto.id_categoria,
          precio: producto.precio,
          descripcion: producto.descripcion || null
        });
      if (error) throw error;
      console.log('✅ Producto creado');
      return data;
    } catch (err) {
      console.error('❌ Error:', err);
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

  async cargarVentas() {
    try {
      const { data, error } = await window.supabaseClient
        .from('ventas')
        .select('id, fecha_venta, monto, clientes(nombre), mesas(numero), empleados(nombre), metodos_pago(nombre)')
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

  async crearCliente(cliente) {
    try {
      const { data, error } = await window.supabaseClient
        .from('clientes')
        .insert({
          nombre: cliente.nombre,
          telefono: cliente.telefono || null,
          email: cliente.email || null,
          fecha_registro: new Date().toISOString()
        });
      if (error) throw error;
      console.log('✅ Cliente creado');
      return data;
    } catch (err) {
      console.error('❌ Error:', err);
      alert('❌ Error: ' + err.message);
      return null;
    }
  },

  async obtenerReporteDiario(fecha) {
    try {
      const { data, error } = await window.supabaseClient
        .from('ventas')
        .select('monto')
        .gte('fecha_venta', fecha + 'T00:00:00')
        .lte('fecha_venta', fecha + 'T23:59:59');
      if (error) throw error;
      const ventas = data || [];
      const cantidad = ventas.length;
      const total = ventas.reduce((s, v) => s + (v.monto || 0), 0);
      const promedio = cantidad > 0 ? total / cantidad : 0;
      return { fecha, cantidad, total, promedio };
    } catch (err) {
      console.error('❌ Error:', err);
      return { fecha, cantidad: 0, total: 0, promedio: 0 };
    }
  },

  async obtenerProductosMasVendidos(dias = 7) {
    try {
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - dias);
      const { data, error } = await window.supabaseClient
        .from('detalle_ventas')
        .select('cantidad, precio_unitario, productos(nombre)');
      if (error) throw error;
      const agrupado = {};
      (data || []).forEach(item => {
        const nombre = item.productos?.nombre || 'Desconocido';
        if (!agrupado[nombre]) agrupado[nombre] = { nombre, cantidad: 0, ingresos: 0 };
        agrupado[nombre].cantidad += item.cantidad || 0;
        agrupado[nombre].ingresos += (item.cantidad || 0) * (item.precio_unitario || 0);
      });
      return Object.values(agrupado).sort((a, b) => b.ingresos - a.ingresos);
    } catch (err) {
      console.error('❌ Error:', err);
      return [];
    }
  }
};

console.log('✅ app.js cargado correctamente');