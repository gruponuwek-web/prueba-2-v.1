console.log('✅ app.js cargando...');

window.restaurante = {
  carrito: [],

  // ===== CRUD =====
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

  cargarMesas: async function() {
    try {
      const { data, error } = await window.supabaseClient.from('mesas').select('*').order('numero_mesa');
      return error ? [] : data || [];
    } catch (e) {
      console.error('Error cargarMesas:', e);
      return [];
    }
  },

  cargarEmpleados: async function() {
    try {
      const { data, error } = await window.supabaseClient.from('empleados').select('*').eq('activo', true).order('nombre');
      return error ? [] : data || [];
    } catch (e) {
      console.error('Error cargarEmpleados:', e);
      return [];
    }
  },

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

  cargarVentas: async function() {
    try {
      const { data, error } = await window.supabaseClient
        .from('ventas')
        .select(`*, clientes(nombre), mesas(numero_mesa), metodos_pago(nombre_metodo)`)
        .order('fecha_venta', { ascending: false });
      return error ? [] : data || [];
    } catch (e) {
      console.error('Error cargarVentas:', e);
      return [];
    }
  },

  crearVenta: async function(venta, detalles) {
    try {
      const { data: ventaData, error: ventaError } = await window.supabaseClient
        .from('ventas')
        .insert([venta])
        .select();

      if (ventaError || !ventaData) throw ventaError;

      const idVenta = ventaData[0].id_venta;
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
      await window.supabaseClient.from('detalle_ventas').delete().eq('id_venta', id);
      const { error } = await window.supabaseClient.from('ventas').delete().eq('id_venta', id);
      return !error;
    } catch (e) {
      console.error('Error eliminarVenta:', e);
      return false;
    }
  },

  formatearDinero: function(monto) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto);
  },

  formatearFecha: function(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-MX');
  }
};

// ===== CARRITO =====
window.restaurante.agregarAlCarrito = function(producto) {
  const existe = this.carrito.find(p => p.id_producto === producto.id_producto);
  if (existe) existe.cantidad++;
  else this.carrito.push({ ...producto, cantidad: 1 });
  this.actualizarCarrito();
};

window.restaurante.eliminarDelCarrito = function(idProducto) {
  this.carrito = this.carrito.filter(p => p.id_producto !== idProducto);
  this.actualizarCarrito();
};

window.restaurante.cambiarCantidad = function(idProducto, cantidad) {
  const item = this.carrito.find(p => p.id_producto === idProducto);
  if (item) item.cantidad = Math.max(1, parseInt(cantidad));
  this.actualizarCarrito();
};

window.restaurante.actualizarCarrito = function() {
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
};

// ===== FUNCIONES DE OPERACIÓN =====

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

// ===== MODAL EDITAR VENTA =====
window.ventaEnEdicion = null;

window.abrirEditarVenta = async function(id) {
  const ventas = await restaurante.cargarVentas();
  const venta = ventas.find(v => v.id_venta === id);
  
  if (!venta) {
    alert('❌ Venta no encontrada');
    return;
  }

  window.ventaEnEdicion = venta;

  const clientes = await restaurante.cargarClientes();
  const mesas = await restaurante.cargarMesas();

  let clienteHtml = '<option value="">-- Mostrador --</option>';
  clientes.forEach(c => clienteHtml += `<option value="${c.id_cliente}" ${venta.id_cliente === c.id_cliente ? 'selected' : ''}>${c.nombre}</option>`);
  document.getElementById('modal-venta-cliente').innerHTML = clienteHtml;

  let mesaHtml = '<option value="">-- Ninguna --</option>';
  mesas.forEach(m => mesaHtml += `<option value="${m.id_mesa}" ${venta.id_mesa === m.id_mesa ? 'selected' : ''}>Mesa ${m.numero_mesa}</option>`);
  document.getElementById('modal-venta-mesa').innerHTML = mesaHtml;

  document.getElementById('modal-venta-metodo').value = venta.id_metodo_pago || '1';
  document.getElementById('modal-venta-canal').value = '';
  document.getElementById('modal-venta-estado').value = venta.estatus || 'Pagada';
  document.getElementById('modal-venta-total').value = venta.total.toFixed(2);
  document.getElementById('modal-venta-obs').value = '';
  document.getElementById('modal-venta-fecha').value = venta.fecha_venta ? venta.fecha_venta.split('T')[0] : '';

  document.getElementById('modal-editar-venta').style.display = 'flex';
};

window.cerrarModalVenta = function() {
  document.getElementById('modal-editar-venta').style.display = 'none';
  window.ventaEnEdicion = null;
};

window.guardarEditarVentaModal = async function() {
  if (!window.ventaEnEdicion) return;

  const id = window.ventaEnEdicion.id_venta;
  const idCliente = document.getElementById('modal-venta-cliente').value;
  const idMesa = document.getElementById('modal-venta-mesa').value;
  const estado = document.getElementById('modal-venta-estado').value;

  const datos = {
    id_cliente: idCliente ? parseInt(idCliente) : null,
    id_mesa: idMesa ? parseInt(idMesa) : null,
    estatus: estado
  };

  const result = await restaurante.actualizarVenta(id, datos);
  if (result) {
    alert('✅ Venta actualizada');
    window.cerrarModalVenta();
    window.cargarDatos();
  } else {
    alert('❌ Error al actualizar');
  }
};

// ===== EDICIÓN INLINE =====
window.abrirEditarFila = function(btn) {
  const tr = btn.closest('tr');
  if (tr.classList.contains('edit-mode')) return;
  
  tr.classList.add('edit-mode');
  const celdas = tr.querySelectorAll('td');
  
  tr.dataset.original = JSON.stringify(Array.from(celdas).slice(0, -1).map(td => td.innerHTML));
  
  for (let i = 0; i < celdas.length - 1; i++) {
    const celda = celdas[i];
    const valor = celda.textContent.trim();
    celda.classList.add('cell-edit');
    celda.innerHTML = `<input type="text" value="${valor}">`;
  }
  
  const ultima = celdas[celdas.length - 1];
  ultima.innerHTML = `
    <button class="btn-save-inline" onclick="window.guardarEditarFila(event)">✅ Guardar</button>
    <button class="btn-cancel-inline" onclick="window.cancelarEditarFila(event)">❌ Cancelar</button>
  `;
};

window.guardarEditarFila = async function(event) {
  const btn = event.target;
  const tr = btn.closest('tr');
  const tipo = tr.dataset.tipo;
  const id = parseInt(tr.dataset.id);
  const inputs = tr.querySelectorAll('input');

  try {
    let datos = {};

    if (tipo === 'cliente') {
      datos = { nombre: inputs[0]?.value, telefono: inputs[1]?.value, email: inputs[2]?.value };
      if (!datos.nombre) { alert('❌ Nombre requerido'); return; }
      await restaurante.actualizarCliente(id, datos);
    } 
    else if (tipo === 'producto') {
      datos = { nombre_producto: inputs[0]?.value, precio: parseFloat(inputs[1]?.value || 0), descripcion: inputs[2]?.value };
      if (!datos.nombre_producto || datos.precio <= 0) { alert('❌ Datos inválidos'); return; }
      await restaurante.actualizarProducto(id, datos);
    }
    else if (tipo === 'usuario') {
      datos = { nombre_usuario: inputs[0]?.value, email: inputs[1]?.value, rol: inputs[2]?.value };
      if (!datos.nombre_usuario) { alert('❌ Usuario requerido'); return; }
      await restaurante.actualizarUsuario(id, datos);
    }

    alert('✅ Actualizado correctamente');
    window.cargarDatos();
  } catch (e) {
    console.error('Error guardar:', e);
    alert('❌ Error al guardar');
  }
};

window.cancelarEditarFila = function(event) {
  const btn = event.target;
  const tr = btn.closest('tr');
  const original = JSON.parse(tr.dataset.original);
  const celdas = tr.querySelectorAll('td');
  const tipo = tr.dataset.tipo;
  const id = tr.dataset.id;

  for (let i = 0; i < original.length; i++) {
    celdas[i].innerHTML = original[i];
    celdas[i].classList.remove('cell-edit');
  }

  const ultima = celdas[celdas.length - 1];
  if (tipo === 'cliente') {
    ultima.innerHTML = `<button class="btn btn-small btn-info" onclick="window.abrirEditarFila(this)">Editar</button> <button class="btn btn-small btn-danger" onclick="window.eliminarCliente(${id})">Eliminar</button>`;
  } else if (tipo === 'producto') {
    ultima.innerHTML = `<button class="btn btn-small btn-info" onclick="window.abrirEditarFila(this)">Editar</button> <button class="btn btn-small btn-danger" onclick="window.eliminarProducto(${id})">Eliminar</button>`;
  } else if (tipo === 'usuario') {
    ultima.innerHTML = `<button class="btn btn-small btn-info" onclick="window.abrirEditarFila(this)">Editar</button> <button class="btn btn-small btn-danger" onclick="window.eliminarUsuario(${id})">Eliminar</button>`;
  }

  tr.classList.remove('edit-mode');
};

// ===== CARGAR DATOS =====
window.cargarDatos = async function() {
  try {
    console.log('📊 Cargando datos...');
    
    const clientes = await restaurante.cargarClientes();
    const productos = await restaurante.cargarProductos();
    const mesas = await restaurante.cargarMesas();
    const usuarios = await restaurante.cargarUsuarios();
    const ventas = await restaurante.cargarVentas();

    console.log('✅ Datos cargados correctamente');

    // Selectores
    let clienteHtml = '<option value="">-- Mostrador --</option>';
    clientes.forEach(c => clienteHtml += `<option value="${c.id_cliente}">${c.nombre}</option>`);
    const el1 = document.getElementById('venta-cliente');
    if (el1) el1.innerHTML = clienteHtml;

    let mesaHtml = '<option value="">-- Ninguna --</option>';
    mesas.forEach(m => mesaHtml += `<option value="${m.id_mesa}">Mesa ${m.numero_mesa}</option>`);
    const el2 = document.getElementById('venta-mesa');
    if (el2) el2.innerHTML = mesaHtml;

    let productoHtml = '<option value="">-- Selecciona --</option>';
    productos.forEach(p => productoHtml += `<option value="${p.id_producto}">${p.nombre_producto} - ${restaurante.formatearDinero(p.precio)}</option>`);
    const el3 = document.getElementById('venta-producto');
    if (el3) el3.innerHTML = productoHtml;

    // Tablas
    ['clientes', 'productos', 'usuarios', 'mesas', 'ventas'].forEach(tabla => {
      const tbody = document.getElementById(`tabla-${tabla}`)?.querySelector('tbody');
      if (!tbody) return;

      let data = [];
      if (tabla === 'clientes') {
        data = clientes;
        tbody.innerHTML = clientes.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:#999;padding:2rem;">Sin datos</td></tr>' : '';
        clientes.forEach(c => {
          const tr = document.createElement('tr');
          tr.dataset.tipo = 'cliente';
          tr.dataset.id = c.id_cliente;
          tr.innerHTML = `<td>${c.nombre}</td><td>${c.telefono || '-'}</td><td>${c.email || '-'}</td><td><button class="btn btn-small btn-info" onclick="window.abrirEditarFila(this)">Editar</button> <button class="btn btn-small btn-danger" onclick="window.eliminarCliente(${c.id_cliente})">Eliminar</button></td>`;
          tbody.appendChild(tr);
        });
      }
      else if (tabla === 'productos') {
        data = productos;
        tbody.innerHTML = productos.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:#999;padding:2rem;">Sin datos</td></tr>' : '';
        productos.forEach(p => {
          const tr = document.createElement('tr');
          tr.dataset.tipo = 'producto';
          tr.dataset.id = p.id_producto;
          tr.innerHTML = `<td>${p.nombre_producto}</td><td>${restaurante.formatearDinero(p.precio)}</td><td>${p.descripcion || '-'}</td><td><span class="badge badge-success">Activo</span></td><td><button class="btn btn-small btn-info" onclick="window.abrirEditarFila(this)">Editar</button> <button class="btn btn-small btn-danger" onclick="window.eliminarProducto(${p.id_producto})">Eliminar</button></td>`;
          tbody.appendChild(tr);
        });
      }
      else if (tabla === 'usuarios') {
        data = usuarios;
        tbody.innerHTML = usuarios.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:#999;padding:2rem;">Sin datos</td></tr>' : '';
        usuarios.forEach(u => {
          const tr = document.createElement('tr');
          tr.dataset.tipo = 'usuario';
          tr.dataset.id = u.id_usuario;
          tr.innerHTML = `<td>${u.nombre_usuario}</td><td>${u.email}</td><td>${u.rol}</td><td><button class="btn btn-small btn-info" onclick="window.abrirEditarFila(this)">Editar</button> <button class="btn btn-small btn-danger" onclick="window.eliminarUsuario(${u.id_usuario})">Eliminar</button></td>`;
          tbody.appendChild(tr);
        });
      }
      else if (tabla === 'mesas') {
        data = mesas;
        tbody.innerHTML = mesas.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:#999;padding:2rem;">Sin datos</td></tr>' : '';
        mesas.forEach(m => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${m.numero_mesa}</td><td>${m.capacidad}</td><td>${m.ubicacion || '-'}</td><td>Disponible</td>`;
          tbody.appendChild(tr);
        });
      }
      else if (tabla === 'ventas') {
        tbody.innerHTML = ventas.length === 0 ? '<tr><td colspan="6" style="text-align:center;color:#999;padding:2rem;">Sin datos</td></tr>' : '';
        ventas.slice(0, 20).forEach(v => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>#${v.id_venta}</td><td>${restaurante.formatearFecha(v.fecha_venta)}</td><td>${v.clientes?.nombre || 'Mostrador'}</td><td>${restaurante.formatearDinero(v.total)}</td><td><span class="badge badge-success">${v.estatus}</span></td><td><button class="btn btn-small btn-info" onclick="window.abrirEditarVenta(${v.id_venta})">Editar</button> <button class="btn btn-small btn-danger" onclick="window.eliminarVenta(${v.id_venta})">Eliminar</button></td>`;
          tbody.appendChild(tr);
        });
      }
    });

    // Dashboard
    const gridStats = document.getElementById('stats-grid');
    if (gridStats) {
      const totalVentas = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
      const promedio = ventas.length > 0 ? totalVentas / ventas.length : 0;
      gridStats.innerHTML = `
        <div class="stat-card"><div class="stat-label">Ventas Hoy</div><div class="stat-value">${ventas.length}</div></div>
        <div class="stat-card"><div class="stat-label">Total Hoy</div><div class="stat-value">${restaurante.formatearDinero(totalVentas)}</div></div>
        <div class="stat-card"><div class="stat-label">Promedio por Venta</div><div class="stat-value">${restaurante.formatearDinero(promedio)}</div></div>
        <div class="stat-card"><div class="stat-label">Mesas Ocupadas</div><div class="stat-value">0/${mesas.length}</div></div>
      `;
    }

    const tablaUltimas = document.getElementById('tabla-ultimas-ventas')?.querySelector('tbody');
    if (tablaUltimas) {
      tablaUltimas.innerHTML = '';
      ventas.slice(0, 5).forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>#${v.id_venta}</td><td>${restaurante.formatearFecha(v.fecha_venta)}</td><td>${v.clientes?.nombre || 'Mostrador'}</td><td>${restaurante.formatearDinero(v.total)}</td><td><span class="badge badge-success">${v.estatus}</span></td>`;
        tablaUltimas.appendChild(tr);
      });
    }

  } catch (e) {
    console.error('❌ Error cargarDatos:', e);
  }
};

console.log('✅ app.js cargado correctamente');