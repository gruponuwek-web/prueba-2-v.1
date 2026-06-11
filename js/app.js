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

  // ===== CARRITO DE VENTAS =====
  carrito: [],

  agregarAlCarrito(producto) {
    const existe = this.carrito.find(item => item.id_producto === producto.id_producto);
    if (existe) {
      existe.cantidad += 1;
    } else {
      this.carrito.push({
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto,
        precio: producto.precio,
        cantidad: 1
      });
    }
    this.actualizarCarrito();
  },

  eliminarDelCarrito(idProducto) {
    this.carrito = this.carrito.filter(item => item.id_producto !== idProducto);
    this.actualizarCarrito();
  },

  cambiarCantidad(idProducto, cantidad) {
    const item = this.carrito.find(item => item.id_producto === idProducto);
    if (item && cantidad > 0) {
      item.cantidad = cantidad;
    } else if (cantidad <= 0) {
      this.eliminarDelCarrito(idProducto);
    }
    this.actualizarCarrito();
  },

  actualizarCarrito() {
    const tbody = document.getElementById('tabla-carrito').querySelector('tbody');
    tbody.innerHTML = '';

    if (this.carrito.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 1rem; color: #999;">Carrito vacío</td></tr>';
      document.getElementById('venta-subtotal').textContent = '$0';
      document.getElementById('venta-iva').textContent = '$0';
      document.getElementById('venta-total').textContent = '$0';
      return;
    }

    let subtotal = 0;
    this.carrito.forEach(item => {
      subtotal += item.precio * item.cantidad;
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.nombre_producto}</td>
        <td><input type="number" value="${item.cantidad}" min="1" onchange="restaurante.cambiarCantidad(${item.id_producto}, this.value)" style="width: 50px;"></td>
        <td>${this.formatearDinero(item.precio)}</td>
        <td>${this.formatearDinero(item.precio * item.cantidad)}</td>
        <td><button class="btn btn-small btn-danger" onclick="restaurante.eliminarDelCarrito(${item.id_producto})">✕</button></td>
      `;
      tbody.appendChild(tr);
    });

    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    document.getElementById('venta-subtotal').textContent = this.formatearDinero(subtotal);
    document.getElementById('venta-iva').textContent = this.formatearDinero(iva);
    document.getElementById('venta-total').textContent = this.formatearDinero(total);
  },

  // ===== CLIENTES =====

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

  async actualizarCliente(idCliente, cliente) {
    try {
      const { data, error } = await window.supabaseClient
        .from('clientes')
        .update({
          nombre: cliente.nombre,
          telefono: cliente.telefono || null,
          email: cliente.email || null
        })
        .eq('id_cliente', idCliente);
      if (error) throw error;
      console.log('✅ Cliente actualizado');
      return true;
    } catch (err) {
      console.error('❌ Error:', err);
      alert('❌ Error: ' + err.message);
      return false;
    }
  },

  async eliminarCliente(idCliente) {
    try {
      const { error } = await window.supabaseClient
        .from('clientes')
        .delete()
        .eq('id_cliente', idCliente);
      if (error) throw error;
      console.log('✅ Cliente eliminado');
      return true;
    } catch (err) {
      console.error('❌ Error:', err);
      alert('❌ Error: ' + err.message);
      return false;
    }
  },

  // ===== MESAS =====

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

  // ===== EMPLEADOS =====

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

  // ===== CATEGORÍAS =====

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

  // ===== PRODUCTOS =====

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

  async actualizarProducto(idProducto, producto) {
    try {
      const { data, error } = await window.supabaseClient
        .from('productos')
        .update({
          nombre_producto: producto.nombre_producto,
          id_categoria: producto.id_categoria,
          precio: producto.precio,
          descripcion: producto.descripcion || null
        })
        .eq('id_producto', idProducto);
      if (error) throw error;
      console.log('✅ Producto actualizado');
      return true;
    } catch (err) {
      console.error('❌ Error:', err);
      alert('❌ Error: ' + err.message);
      return false;
    }
  },

  async eliminarProducto(idProducto) {
    try {
      const { error } = await window.supabaseClient
        .from('productos')
        .delete()
        .eq('id_producto', idProducto);
      if (error) throw error;
      console.log('✅ Producto eliminado');
      return true;
    } catch (err) {
      console.error('❌ Error:', err);
      alert('❌ Error: ' + err.message);
      return false;
    }
  },

  validarProducto(producto) {
    const errors = [];
    if (!producto.nombre_producto) errors.push('El nombre es requerido');
    if (!producto.id_categoria) errors.push('La categoría es requerida');
    if (producto.precio <= 0) errors.push('El precio debe ser mayor a 0');
    return errors;
  },

  // ===== VENTAS =====

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

  async crearVenta(venta, detalles) {
    try {
      if (!venta.id_empleado || !venta.id_metodo_pago) {
        alert('❌ Empleado y método de pago son requeridos');
        return null;
      }
      if (detalles.length === 0) {
        alert('❌ Agrega al menos un producto');
        return null;
      }

      // Calcular subtotal
      const subtotal = detalles.reduce((sum, det) => sum + (det.cantidad * det.precio_unitario), 0);
      const iva = subtotal * 0.16;
      const total = subtotal + iva;

      const { data: ventaData, error: ventaError } = await window.supabaseClient
        .from('ventas')
        .insert({
          id_cliente: venta.id_cliente || null,
          id_mesa: venta.id_mesa || null,
          id_empleado: venta.id_empleado,
          id_metodo_pago: venta.id_metodo_pago,
          fecha_venta: new Date().toISOString(),
          subtotal: subtotal,
          iva: iva,
          total: total,
          estatus: 'pagada'
        })
        .select();

      if (ventaError) throw ventaError;
      const idVenta = ventaData[0].id_venta;

      // Insertar detalles
      const detallesConIdVenta = detalles.map(det => ({
        id_venta: idVenta,
        id_producto: det.id_producto,
        cantidad: det.cantidad,
        precio_unitario: det.precio_unitario,
        subtotal: det.cantidad * det.precio_unitario
      }));

      const { error: detalleError } = await window.supabaseClient
        .from('detalle_ventas')
        .insert(detallesConIdVenta);

      if (detalleError) throw detalleError;

      console.log('✅ Venta creada exitosamente');
      return ventaData[0];
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

  async actualizarUsuario(idUsuario, usuario) {
    try {
      const { data, error } = await window.supabaseClient
        .from('usuarios')
        .update({
          nombre_usuario: usuario.nombre_usuario,
          email: usuario.email,
          rol: usuario.rol,
          activo: usuario.activo
        })
        .eq('id_usuario', idUsuario);
      
      if (error) throw error;
      console.log('✅ Usuario actualizado');
      return true;
    } catch (err) {
      console.error('❌ Error:', err);
      alert('❌ Error: ' + err.message);
      return false;
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