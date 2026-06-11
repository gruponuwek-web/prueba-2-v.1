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
        .order('numero_mesa');
      if (error) throw error;
      return (data || []).map(m => ({
        id_mesa: m.id_mesa,
        numero_mesa: m.numero_mesa,
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
        id_empleado: e.id_empleado,
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
        id_categoria: c.id_categoria,
        nombre_categoria: c.nombre_categoria
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
        .select('*, categorias(id_categoria, nombre_categoria)')
        .order('nombre_producto');
      if (error) throw error;
      return (data || []).map(p => ({
        id_producto: p.id_producto,
        nombre_producto: p.nombre_producto,
        precio: p.precio,
        descripcion: p.descripcion,
        categorias: {
          id_categoria: p.categorias?.id_categoria,
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
          nombre_producto: producto.nombre_producto,
          id_categoria: producto.id_categoria,
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
        .select('id_venta, fecha_venta, total, clientes(nombre), mesas(numero_mesa), empleados(nombre), metodos_pago(nombre_metodo)')
        .order('fecha_venta', { ascending: false });
      if (error) throw error;
      return (data || []).map(v => ({
        id_venta: v.id_venta,
        fecha_venta: v.fecha_venta,
        total: v.total,
        clientes: { nombre: v.clientes?.nombre || 'Mostrador' },
        mesas: { numero_mesa: v.mesas?.numero_mesa || '-' },
        empleados: { nombre: v.empleados?.nombre || '-' },
        metodos_pago: { nombre_metodo: v.metodos_pago?.nombre_metodo || '-' }
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
        .select('total')
        .gte('fecha_venta', fecha + 'T00:00:00')
        .lte('fecha_venta', fecha + 'T23:59:59');
      if (error) throw error;
      const ventas = data || [];
      const cantidad = ventas.length;
      const total = ventas.reduce((s, v) => s + (v.total || 0), 0);
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
        .select('cantidad, precio_unitario, productos(nombre_producto), ventas(fecha_venta)');
      if (error) throw error;
      
      const filtered = (data || []).filter(item => {
        const venta_fecha = new Date(item.ventas?.fecha_venta || '');
        return venta_fecha >= fechaInicio;
      });
      
      const agrupado = {};
      filtered.forEach(item => {
        const nombre = item.productos?.nombre_producto || 'Desconocido';
        if (!agrupado[nombre]) agrupado[nombre] = { nombre, cantidad: 0, ingresos: 0 };
        agrupado[nombre].cantidad += item.cantidad || 0;
        agrupado[nombre].ingresos += (item.cantidad || 0) * (item.precio_unitario || 0);
      });
      return Object.values(agrupado).sort((a, b) => b.ingresos - a.ingresos);
    } catch (err) {
      console.error('❌ Error:', err);
      return [];
    }
  },

  // ===== USUARIOS =====
  
  async cargarUsuarios() {
    try {
      const { data, error } = await window.supabaseClient
        .from('usuarios')
        .select('*')
        .order('fecha_creacion', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('❌ Error cargando usuarios:', err);
      return [];
    }
  },

  async crearUsuario(usuario) {
    try {
      if (!usuario.nombre_usuario || !usuario.email || !usuario.password || !usuario.rol) {
        alert('❌ Todos los campos son requeridos');
        return null;
      }

      const { data, error } = await window.supabaseClient
        .from('usuarios')
        .insert({
          nombre_usuario: usuario.nombre_usuario,
          email: usuario.email,
          password: usuario.password,
          rol: usuario.rol,
          activo: true,
          fecha_creacion: new Date().toISOString()
        });
      
      if (error) throw error;
      console.log('✅ Usuario creado:', data);
      return data;
    } catch (err) {
      console.error('❌ Error creando usuario:', err);
      alert('❌ Error: ' + err.message);
      return null;
    }
  },

  async eliminarUsuario(id) {
    try {
      const { error } = await window.supabaseClient
        .from('usuarios')
        .delete()
        .eq('id_usuario', id);
      
      if (error) throw error;
      console.log('✅ Usuario eliminado');
      return true;
    } catch (err) {
      console.error('❌ Error:', err);
      alert('❌ Error: ' + err.message);
      return false;
    }
  }
};

console.log('✅ app.js cargado correctamente');