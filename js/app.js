console.log('✅ app.js cargando...');

window.restaurante = {
  carrito: [],

  // ===== CARRITO =====
  agregarAlCarrito: function(producto) {
    const existe = this.carrito.find(p => p.id_producto === producto.id_producto);
    if (existe) {
      existe.cantidad++;
    } else {
      this.carrito.push({ ...producto, cantidad: 1 });
    }
    this.actualizarCarrito();
  },

  eliminarDelCarrito: function(idProducto) {
    this.carrito = this.carrito.filter(p => p.id_producto !== idProducto);
    this.actualizarCarrito();
  },

  cambiarCantidad: function(idProducto, cantidad) {
    const item = this.carrito.find(p => p.id_producto === idProducto);
    if (item) item.cantidad = Math.max(1, parseInt(cantidad));
    this.actualizarCarrito();
  },

  actualizarCarrito: function() {
    const tbody = document.getElementById('tabla-carrito')?.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    let subtotal = 0;

    this.carrito.forEach(item => {
      const itemSubtotal = item.precio * item.cantidad;
      subtotal += itemSubtotal;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.nombre_producto}</td>
        <td><input type="number" min="1" value="${item.cantidad}" onchange="window.restaurante.cambiarCantidad(${item.id_producto}, this.value)"></td>
        <td>${this.formatearDinero(item.precio)}</td>
        <td>${this.formatearDinero(itemSubtotal)}</td>
        <td><button class="btn btn-small btn-danger" onclick="window.restaurante.eliminarDelCarrito(${item.id_producto})">X</button></td>
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
  cargarClientes: async function() {
    try {
      const { data, error } = await window.supabaseClient.from('clientes').select('*').order('nombre');
      return error ? [] : data || [];
    } catch (e) {
      console.error('Error cargarClientes:', e);
      return [];
    }
  },

  crearCliente: async function(datos) {
    try {
      const { data, error } = await window.supabaseClient.from('clientes').insert([datos]).select();
      return error ? null : data?.[0];
    } catch (e) {
      console.error('Error crearCliente:', e);
      return null;
    }
  },

  actualizarCliente: async function(id, datos) {
    try {
      const { error } = await window.supabaseClient.from('clientes').update(datos).eq('id_cliente', id);
      return !error;
    } catch (e) {
      console.error('Error actualizarCliente:', e);
      return false;
    }
  },

  eliminarCliente: async function(id) {
    try {
      const { error } = await window.supabaseClient.from('clientes').delete().eq('id_cliente', id);
      return !error;
    } catch (e) {
      console.error('Error eliminarCliente:', e);
      return false;
    }
  },

  // ===== PRODUCTOS =====
  cargarProductos: async function() {
    try {
      const { data, error } = await window.supabaseClient.from('productos').select('*').eq('activo', true).order('nombre_producto');
      return error ? [] : data || [];
    } catch (e) {
      console.error('Error cargarProductos:', e);
      return [];
    }
  },

  crearProducto: async function(datos) {
    try {
      const { data, error } = await window.supabaseClient.from('productos').insert([datos]).select();
      return error ? null : data?.[0];
    } catch (e) {
      console.error('Error crearProducto:', e);
      return null;
    }
  },

  actualizarProducto: async function(id, datos) {
    try {
      const { error } = await window.supabaseClient.from('productos').update(datos).eq('id_producto', id);
      return !error;
    } catch (e) {
      console.error('Error actualizarProducto:', e);
      return false;
    }
  },

  eliminarProducto: async function(id) {
    try {
      const { error } = await window.supabaseClient.from('productos').update({ activo: false }).eq('id_producto', id);
      return !error;
    } catch (e) {
      console.error('Error eliminarProducto:', e);
      return false;
    }
  },

  // ===== MESAS =====
  cargarMesas: async function() {
    try {
      const { data, error } = await window.supabaseClient.from('mesas').select('*').order('numero_mesa');
      return error ? [] : data || [];
    } catch (e) {
      console.error('Error cargarMesas:', e);
      return [];
    }
  },

  // ===== USUARIOS =====
  cargarUsuarios: async function() {
    try {
      const { data, error } = await window.supabaseClient.from('usuarios').select('*').eq('activo', true).order('nombre_usuario');
      return error ? [] : data || [];
    } catch (e) {
      console.error('Error cargarUsuarios:', e);
      return [];
    }
  },

  crearUsuario: async function(datos) {
    try {
      const { data, error } = await window.supabaseClient.from('usuarios').insert([datos]).select();
      return error ? null : data?.[0];
    } catch (e) {
      console.error('Error crearUsuario:', e);
      return null;
    }
  },

  actualizarUsuario: async function(id, datos) {
    try {
      const { error } = await window.supabaseClient.from('usuarios').update(datos).eq('id_usuario', id);
      return !error;
    } catch (e) {
      console.error('Error actualizarUsuario:', e);
      return false;
    }
  },

  eliminarUsuario: async function(id) {
    try {
      const { error } = await window.supabaseClient.from('usuarios').update({ activo: false }).eq('id_usuario', id);
      return !error;
    } catch (e) {
      console.error('Error eliminarUsuario:', e);
      return false;
    }
  },

  // ===== VENTAS =====
  cargarVentas: async function() {
    try {
      const { data, error } = await window.supabaseClient
        .from('ventas')
        .select(`
          *,
          clientes(nombre),
          mesas(numero_mesa),
          metodos_pago(nombre_metodo)
        `)
        .order('fecha_venta', { ascending: false });
      return error ? [] : data || [];
    } catch (e) {
      console.error('Error cargarVentas:', e);
      return [];
    }
  },

  crearVenta: async function(venta, detalles) {
    try {
      // Insertar venta
      const { data: ventaData, error: ventaError } = await window.supabaseClient
        .from('ventas')
        .insert([venta])
        .select();

      if (ventaError || !ventaData) throw ventaError;

      const idVenta = ventaData[0].id_venta;

      // Insertar detalles
      const detallesConId = detalles.map(d => ({ ...d, id_venta: idVenta }));
      const { error: detalleError } = await window.supabaseClient.from('detalle_ventas').insert(detallesConId);

      if (detalleError) throw detalleError;

      return true;
    } catch (e) {
      console.error('Error crearVenta:', e);
      return false;
    }
  },

  actualizarVenta: async function(id, datos) {
    try {
      const { error } = await window.supabaseClient.from('ventas').update(datos).eq('id_venta', id);
      return !error;
    } catch (e) {
      console.error('Error actualizarVenta:', e);
      return false;
    }
  },

  eliminarVenta: async function(id) {
    try {
      // Eliminar detalles primero
      await window.supabaseClient.from('detalle_ventas').delete().eq('id_venta', id);
      // Luego eliminar venta
      const { error } = await window.supabaseClient.from('ventas').delete().eq('id_venta', id);
      return !error;
    } catch (e) {
      console.error('Error eliminarVenta:', e);
      return false;
    }
  },

  // ===== UTILIDADES =====
  formatearDinero: function(monto) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto);
  },

  formatearFecha: function(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-MX');
  }
};

// ===== CARRITO Y VENTAS =====
window.agregarProductoAlCarrito = async function() {
  const idProducto = document.getElementById('venta-producto').value;
  if (!idProducto) {
    alert('Selecciona un producto');
    return;
  }

  const productos = await restaurante.cargarProductos();
  const producto = productos.find(p => p.id_producto === parseInt(idProducto));
  if (producto) {
    restaurante.agregarAlCarrito(producto);
  }
};

window.registrarVenta = async function() {
  if (restaurante.carrito.length === 0) {
    alert('❌ Agregar productos al carrito');
    return;
  }

  const idCliente = document.getElementById('venta-cliente').value;
  const idMesa = document.getElementById('venta-mesa').value;

  const subtotal = restaurante.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const venta = {
    id_cliente: idCliente ? parseInt(idCliente) : null,
    id_mesa: idMesa ? parseInt(idMesa) : null,
    id_empleado: 1,
    id_metodo_pago: 1,
    fecha_venta: new Date().toISOString(),
    subtotal,
    iva,
    total,
    estatus: 'Pagada'
  };

  const detalles = restaurante.carrito.map(item => ({
    id_producto: item.id_producto,
    cantidad: item.cantidad,
    precio_unitario: item.precio,
    subtotal: item.precio * item.cantidad
  }));

  const result = await restaurante.crearVenta(venta, detalles);
  if (result) {
    alert('✅ Venta registrada');
    restaurante.carrito = [];
    restaurante.actualizarCarrito();
    document.getElementById('venta-cliente').value = '';
    document.getElementById('venta-mesa').value = '';
    window.cargarDatos();
  } else {
    alert('❌ Error al registrar venta');
  }
};

// ===== CRUD CLIENTES =====
window.crearCliente = async function() {
  const nombre = document.getElementById('form-cliente-nombre').value.trim();
  const telefono = document.getElementById('form-cliente-telefono').value.trim();
  const email = document.getElementById('form-cliente-email').value.trim();

  if (!nombre) {
    alert('❌ Nombre requerido');
    return;
  }

  const datos = { nombre, telefono, email, fecha_registro: new Date().toISOString() };
  const result = await restaurante.crearCliente(datos);

  if (result) {
    alert('✅ Cliente creado');
    document.getElementById('form-cliente-nombre').value = '';
    document.getElementById('form-cliente-telefono').value = '';
    document.getElementById('form-cliente-email').value = '';
    window.cargarDatos();
  } else {
    alert('❌ Error al crear cliente');
  }
};

window.eliminarCliente = async function(id) {
  if (!confirm('¿Eliminar este cliente?')) return;
  const result = await restaurante.eliminarCliente(id);
  if (result) {
    alert('✅ Cliente eliminado');
    window.cargarDatos();
  }
};

// ===== CRUD PRODUCTOS =====
window.crearProducto = async function() {
  const nombre = document.getElementById('form-producto-nombre').value.trim();
  const precio = parseFloat(document.getElementById('form-producto-precio').value || 0);
  const descripcion = document.getElementById('form-producto-desc').value.trim();

  if (!nombre || precio <= 0) {
    alert('❌ Completa los campos correctamente');
    return;
  }

  const datos = { nombre_producto: nombre, precio, descripcion, id_categoria: 1, activo: true };
  const result = await restaurante.crearProducto(datos);

  if (result) {
    alert('✅ Producto creado');
    document.getElementById('form-producto-nombre').value = '';
    document.getElementById('form-producto-precio').value = '';
    document.getElementById('form-producto-desc').value = '';
    window.cargarDatos();
  } else {
    alert('❌ Error al crear producto');
  }
};

window.eliminarProducto = async function(id) {
  if (!confirm('¿Eliminar este producto?')) return;
  const result = await restaurante.eliminarProducto(id);
  if (result) {
    alert('✅ Producto eliminado');
    window.cargarDatos();
  }
};

// ===== CRUD USUARIOS =====
window.crearUsuario = async function() {
  const nombre = document.getElementById('form-usuario-nombre').value.trim();
  const email = document.getElementById('form-usuario-email').value.trim();
  const password = document.getElementById('form-usuario-password').value;
  const rol = document.getElementById('form-usuario-rol').value;

  if (!nombre || !email || !password) {
    alert('❌ Completa todos los campos');
    return;
  }

  const datos = { nombre_usuario: nombre, email, password, rol, activo: true, fecha_creacion: new Date().toISOString() };
  const result = await restaurante.crearUsuario(datos);

  if (result) {
    alert('✅ Usuario creado');
    document.getElementById('form-usuario-nombre').value = '';
    document.getElementById('form-usuario-email').value = '';
    document.getElementById('form-usuario-password').value = '';
    window.cargarDatos();
  } else {
    alert('❌ Error al crear usuario');
  }
};

window.eliminarUsuario = async function(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  const result = await restaurante.eliminarUsuario(id);
  if (result) {
    alert('✅ Usuario eliminado');
    window.cargarDatos();
  }
};

// ===== CARGAR DATOS INICIALES =====
window.cargarDatos = async function() {
  try {
    // Cargar selectores
    const clientes = await restaurante.cargarClientes();
    const productos = await restaurante.cargarProductos();
    const mesas = await restaurante.cargarMesas();
    const usuarios = await restaurante.cargarUsuarios();
    const ventas = await restaurante.cargarVentas();

    // Selectores Ventas
    let clienteHtml = '<option value="">-- Mostrador --</option>';
    clientes.forEach(c => clienteHtml += `<option value="${c.id_cliente}">${c.nombre}</option>`);
    document.getElementById('venta-cliente').innerHTML = clienteHtml;

    let mesaHtml = '<option value="">-- Ninguna --</option>';
    mesas.forEach(m => mesaHtml += `<option value="${m.id_mesa}">Mesa ${m.numero_mesa}</option>`);
    document.getElementById('venta-mesa').innerHTML = mesaHtml;

    let productoHtml = '<option value="">-- Selecciona --</option>';
    productos.forEach(p => productoHtml += `<option value="${p.id_producto}">${p.nombre_producto} - ${restaurante.formatearDinero(p.precio)}</option>`);
    document.getElementById('venta-producto').innerHTML = productoHtml;

    // Tabla Clientes
    const tablaClientes = document.getElementById('tabla-clientes')?.querySelector('tbody');
    if (tablaClientes) {
      tablaClientes.innerHTML = '';
      clientes.forEach(c => {
        const tr = document.createElement('tr');
        tr.dataset.tipo = 'cliente';
        tr.dataset.id = c.id_cliente;
        tr.innerHTML = `
          <td>${c.nombre}</td>
          <td>${c.telefono || '-'}</td>
          <td>${c.email || '-'}</td>
          <td>
            <button class="btn btn-small btn-info" onclick="window.abrirEditarFila(this)">Editar</button>
            <button class="btn btn-small btn-danger" onclick="window.eliminarCliente(${c.id_cliente})">Eliminar</button>
          </td>
        `;
        tablaClientes.appendChild(tr);
      });
    }

    // Tabla Productos
    const tablaProductos = document.getElementById('tabla-productos')?.querySelector('tbody');
    if (tablaProductos) {
      tablaProductos.innerHTML = '';
      productos.forEach(p => {
        const tr = document.createElement('tr');
        tr.dataset.tipo = 'producto';
        tr.dataset.id = p.id_producto;
        tr.innerHTML = `
          <td>${p.nombre_producto}</td>
          <td>${restaurante.formatearDinero(p.precio)}</td>
          <td>${p.descripcion || '-'}</td>
          <td><span class="badge badge-success">Activo</span></td>
          <td>
            <button class="btn btn-small btn-info" onclick="window.abrirEditarFila(this)">Editar</button>
            <button class="btn btn-small btn-danger" onclick="window.eliminarProducto(${p.id_producto})">Eliminar</button>
          </td>
        `;
        tablaProductos.appendChild(tr);
      });
    }

    // Tabla Usuarios
    const tablaUsuarios = document.getElementById('tabla-usuarios')?.querySelector('tbody');
    if (tablaUsuarios) {
      tablaUsuarios.innerHTML = '';
      usuarios.forEach(u => {
        const tr = document.createElement('tr');
        tr.dataset.tipo = 'usuario';
        tr.dataset.id = u.id_usuario;
        tr.innerHTML = `
          <td>${u.nombre_usuario}</td>
          <td>${u.email}</td>
          <td>${u.rol}</td>
          <td>
            <button class="btn btn-small btn-info" onclick="window.abrirEditarFila(this)">Editar</button>
            <button class="btn btn-small btn-danger" onclick="window.eliminarUsuario(${u.id_usuario})">Eliminar</button>
          </td>
        `;
        tablaUsuarios.appendChild(tr);
      });
    }

    // Tabla Mesas
    const tablaMesas = document.getElementById('tabla-mesas')?.querySelector('tbody');
    if (tablaMesas) {
      tablaMesas.innerHTML = '';
      mesas.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${m.numero_mesa}</td><td>${m.capacidad}</td><td>${m.ubicacion || '-'}</td><td>Disponible</td>`;
        tablaMesas.appendChild(tr);
      });
    }

    // Tabla Ventas
    const tablaVentas = document.getElementById('tabla-ventas')?.querySelector('tbody');
    if (tablaVentas) {
      tablaVentas.innerHTML = '';
      ventas.slice(0, 10).forEach(v => {
        const tr = document.createElement('tr');
        tr.dataset.tipo = 'venta';
        tr.dataset.id = v.id_venta;
        tr.innerHTML = `
          <td>#${v.id_venta}</td>
          <td>${restaurante.formatearFecha(v.fecha_venta)}</td>
          <td>${v.clientes?.nombre || 'Mostrador'}</td>
          <td>${restaurante.formatearDinero(v.total)}</td>
          <td><span class="badge badge-success">${v.estatus}</span></td>
          <td>
            <button class="btn btn-small btn-danger" onclick="window.eliminarVenta(${v.id_venta})">Eliminar</button>
          </td>
        `;
        tablaVentas.appendChild(tr);
      });
    }

  } catch (e) {
    console.error('Error cargarDatos:', e);
  }
};

console.log('✅ app.js cargado correctamente');