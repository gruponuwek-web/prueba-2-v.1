console.log('✅ app.js cargando...');

window.restaurante = {
  carrito: [],
  formatearDinero: function(monto) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto);
  },
  formatearFecha: function(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-MX');
  },
  cargarClientes: async function() {
    try {
      const { data, error } = await window.supabaseClient.from('clientes').select('*').order('nombre');
      return error ? [] : (data || []);
    } catch (e) {
      console.error('Error cargarClientes:', e);
      return [];
    }
  },
  cargarProductos: async function() {
    try {
      const { data, error } = await window.supabaseClient.from('productos').select('*').eq('activo', true).order('nombre_producto');
      return error ? [] : (data || []);
    } catch (e) {
      console.error('Error cargarProductos:', e);
      return [];
    }
  },
  cargarMesas: async function() {
    try {
      const { data, error } = await window.supabaseClient.from('mesas').select('*').order('numero_mesa');
      return error ? [] : (data || []);
    } catch (e) {
      console.error('Error cargarMesas:', e);
      return [];
    }
  },
  cargarEmpleados: async function() {
    try {
      const { data, error } = await window.supabaseClient.from('empleados').select('*').eq('activo', true).order('nombre');
      return error ? [] : (data || []);
    } catch (e) {
      console.error('Error cargarEmpleados:', e);
      return [];
    }
  },
  cargarUsuarios: async function() {
    try {
      const { data, error } = await window.supabaseClient.from('usuarios').select('*').eq('activo', true).order('nombre_usuario');
      return error ? [] : (data || []);
    } catch (e) {
      console.error('Error cargarUsuarios:', e);
      return [];
    }
  },
  cargarVentas: async function() {
    try {
      const { data, error } = await window.supabaseClient
        .from('ventas')
        .select('*, clientes(nombre), mesas(numero_mesa), metodos_pago(nombre_metodo)')
        .order('fecha_venta', { ascending: false });
      return error ? [] : (data || []);
    } catch (e) {
      console.error('Error cargarVentas:', e);
      return [];
    }
  },
  crearCliente: async function(datos) {
    try {
      const { data, error } = await window.supabaseClient.from('clientes').insert([datos]).select();
      return error ? null : (data?.[0] || null);
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
  crearProducto: async function(datos) {
    try {
      const { data, error } = await window.supabaseClient.from('productos').insert([datos]).select();
      return error ? null : (data?.[0] || null);
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
  actualizarMesa: async function(id, datos) {
    try {
      const { error } = await window.supabaseClient.from('mesas').update(datos).eq('id_mesa', id);
      return !error;
    } catch (e) {
      console.error('Error actualizarMesa:', e);
      return false;
    }
  },
  crearUsuario: async function(datos) {
    try {
      const { data, error } = await window.supabaseClient.from('usuarios').insert([datos]).select();
      return error ? null : (data?.[0] || null);
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
  crearVenta: async function(venta, detalles) {
    try {
      const { data: ventaData, error: ventaError } = await window.supabaseClient.from('ventas').insert([venta]).select();
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
  }
};

window.cargarDatos = async function() {
  try {
    console.log('📊 Cargando datos...');
    const clientes = await restaurante.cargarClientes();
    const productos = await restaurante.cargarProductos();
    const mesas = await restaurante.cargarMesas();
    const usuarios = await restaurante.cargarUsuarios();
    const ventas = await restaurante.cargarVentas();
    console.log('✅ Datos cargados');

    // Selectores
    let clienteHtml = '<option value="">-- Mostrador --</option>';
    clientes.forEach(c => clienteHtml += `<option value="${c.id_cliente}">${c.nombre}</option>`);
    const el = document.getElementById('venta-cliente');
    if (el) el.innerHTML = clienteHtml;

    let mesaHtml = '<option value="">-- Ninguna --</option>';
    mesas.forEach(m => mesaHtml += `<option value="${m.id_mesa}">Mesa ${m.numero_mesa}</option>`);
    const el2 = document.getElementById('venta-mesa');
    if (el2) el2.innerHTML = mesaHtml;

    let productoHtml = '<option value="">-- Selecciona --</option>';
    productos.forEach(p => productoHtml += `<option value="${p.id_producto}">${p.nombre_producto} - ${restaurante.formatearDinero(p.precio)}</option>`);
    const el3 = document.getElementById('venta-producto');
    if (el3) el3.innerHTML = productoHtml;

    // CLIENTES
    const tbClientes = document.getElementById('tabla-clientes')?.querySelector('tbody');
    if (tbClientes) {
      tbClientes.innerHTML = '';
      if (clientes.length === 0) {
        tbClientes.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:2rem;">Sin datos</td></tr>';
      } else {
        clientes.forEach(c => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${c.nombre}</td><td>${c.telefono || '-'}</td><td>${c.email || '-'}</td><td><button class="btn btn-small btn-info" onclick="window.abrirEditarCliente(${c.id_cliente})">Editar</button> <button class="btn btn-small btn-danger" onclick="window.eliminarClienteConfirm(${c.id_cliente})">Eliminar</button></td>`;
          tbClientes.appendChild(tr);
        });
      }
    }

    // PRODUCTOS
    const tbProductos = document.getElementById('tabla-productos')?.querySelector('tbody');
    if (tbProductos) {
      tbProductos.innerHTML = '';
      if (productos.length === 0) {
        tbProductos.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:2rem;">Sin datos</td></tr>';
      } else {
        productos.forEach(p => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${p.nombre_producto}</td><td>${restaurante.formatearDinero(p.precio)}</td><td>${p.descripcion || '-'}</td><td><span class="badge badge-success">Activo</span></td><td><button class="btn btn-small btn-info" onclick="window.abrirEditarProducto(${p.id_producto})">Editar</button> <button class="btn btn-small btn-danger" onclick="window.eliminarProductoConfirm(${p.id_producto})">Eliminar</button></td>`;
          tbProductos.appendChild(tr);
        });
      }
    }

    // USUARIOS
    const tbUsuarios = document.getElementById('tabla-usuarios')?.querySelector('tbody');
    if (tbUsuarios) {
      tbUsuarios.innerHTML = '';
      if (usuarios.length === 0) {
        tbUsuarios.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:2rem;">Sin datos</td></tr>';
      } else {
        usuarios.forEach(u => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${u.nombre_usuario}</td><td>${u.email}</td><td>${u.rol}</td><td><button class="btn btn-small btn-info" onclick="window.abrirEditarUsuario(${u.id_usuario})">Editar</button> <button class="btn btn-small btn-danger" onclick="window.eliminarUsuarioConfirm(${u.id_usuario})">Eliminar</button></td>`;
          tbUsuarios.appendChild(tr);
        });
      }
    }

    // MESAS
    const tbMesas = document.getElementById('tabla-mesas')?.querySelector('tbody');
    if (tbMesas) {
      tbMesas.innerHTML = '';
      if (mesas.length === 0) {
        tbMesas.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:2rem;">Sin datos</td></tr>';
      } else {
        mesas.forEach(m => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${m.numero_mesa}</td><td>${m.capacidad}</td><td>${m.ubicacion || '-'}</td><td><button class="btn btn-small btn-info" onclick="window.abrirEditarMesa(${m.id_mesa})">Editar</button></td>`;
          tbMesas.appendChild(tr);
        });
      }
    }

    // VENTAS
    const tbVentas = document.getElementById('tabla-ventas')?.querySelector('tbody');
    if (tbVentas) {
      tbVentas.innerHTML = '';
      if (ventas.length === 0) {
        tbVentas.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:2rem;">Sin datos</td></tr>';
      } else {
        ventas.slice(0, 20).forEach(v => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>#${v.id_venta}</td><td>${restaurante.formatearFecha(v.fecha_venta)}</td><td>${v.clientes?.nombre || 'Mostrador'}</td><td>${restaurante.formatearDinero(v.total)}</td><td><span class="badge badge-success">${v.estatus}</span></td><td><button class="btn btn-small btn-info" onclick="window.abrirEditarVenta(${v.id_venta})">Editar</button> <button class="btn btn-small btn-danger" onclick="window.eliminarVentaConfirm(${v.id_venta})">Eliminar</button></td>`;
          tbVentas.appendChild(tr);
        });
      }
    }

    // DASHBOARD
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

    const tbUltimas = document.getElementById('tabla-ultimas-ventas')?.querySelector('tbody');
    if (tbUltimas) {
      tbUltimas.innerHTML = '';
      ventas.slice(0, 5).forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>#${v.id_venta}</td><td>${restaurante.formatearFecha(v.fecha_venta)}</td><td>${v.clientes?.nombre || 'Mostrador'}</td><td>${restaurante.formatearDinero(v.total)}</td><td><span class="badge badge-success">${v.estatus}</span></td>`;
        tbUltimas.appendChild(tr);
      });
    }

  } catch (e) {
    console.error('❌ Error cargarDatos:', e);
  }
};

// ===== CRUD CLIENTES =====
window.crearCliente = async function() {
  const nombre = document.getElementById('form-cliente-nombre').value.trim();
  const telefono = document.getElementById('form-cliente-telefono').value.trim();
  const email = document.getElementById('form-cliente-email').value.trim();
  if (!nombre) { alert('❌ Nombre requerido'); return; }
  const result = await restaurante.crearCliente({ nombre, telefono, email, fecha_registro: new Date().toISOString() });
  if (result) { alert('✅ Cliente creado'); document.getElementById('form-cliente-nombre').value = ''; document.getElementById('form-cliente-telefono').value = ''; document.getElementById('form-cliente-email').value = ''; window.cargarDatos(); }
  else alert('❌ Error');
};

window.abrirEditarCliente = async function(id) {
  const clientes = await restaurante.cargarClientes();
  const cliente = clientes.find(c => c.id_cliente === id);
  if (!cliente) return;
  window.clienteEnEdicion = cliente;
  document.getElementById('modal-cliente-nombre').value = cliente.nombre;
  document.getElementById('modal-cliente-telefono').value = cliente.telefono || '';
  document.getElementById('modal-cliente-email').value = cliente.email || '';
  document.getElementById('modal-editar-cliente').style.display = 'flex';
};

window.cerrarModalCliente = function() {
  document.getElementById('modal-editar-cliente').style.display = 'none';
  window.clienteEnEdicion = null;
};

window.guardarEditarClienteModal = async function() {
  if (!window.clienteEnEdicion) return;
  const nombre = document.getElementById('modal-cliente-nombre').value.trim();
  const telefono = document.getElementById('modal-cliente-telefono').value.trim();
  const email = document.getElementById('modal-cliente-email').value.trim();
  if (!nombre) { alert('❌ Nombre requerido'); return; }
  if (await restaurante.actualizarCliente(window.clienteEnEdicion.id_cliente, { nombre, telefono, email })) {
    alert('✅ Cliente actualizado');
    window.cerrarModalCliente();
    window.cargarDatos();
  } else alert('❌ Error');
};

window.eliminarClienteConfirm = async function(id) {
  if (!confirm('¿Eliminar cliente?')) return;
  if (await restaurante.eliminarCliente(id)) { alert('✅ Eliminado'); window.cargarDatos(); }
};

// ===== CRUD PRODUCTOS =====
window.crearProducto = async function() {
  const nombre = document.getElementById('form-producto-nombre').value.trim();
  const precio = parseFloat(document.getElementById('form-producto-precio').value || 0);
  const descripcion = document.getElementById('form-producto-desc').value.trim();
  if (!nombre || precio <= 0) { alert('❌ Datos inválidos'); return; }
  const result = await restaurante.crearProducto({ nombre_producto: nombre, precio, descripcion, id_categoria: 1, activo: true });
  if (result) { alert('✅ Producto creado'); document.getElementById('form-producto-nombre').value = ''; document.getElementById('form-producto-precio').value = ''; document.getElementById('form-producto-desc').value = ''; window.cargarDatos(); }
  else alert('❌ Error');
};

window.abrirEditarProducto = async function(id) {
  const productos = await restaurante.cargarProductos();
  const producto = productos.find(p => p.id_producto === id);
  if (!producto) return;
  window.productoEnEdicion = producto;
  document.getElementById('modal-producto-nombre').value = producto.nombre_producto;
  document.getElementById('modal-producto-precio').value = producto.precio;
  document.getElementById('modal-producto-desc').value = producto.descripcion || '';
  document.getElementById('modal-editar-producto').style.display = 'flex';
};

window.cerrarModalProducto = function() {
  document.getElementById('modal-editar-producto').style.display = 'none';
  window.productoEnEdicion = null;
};

window.guardarEditarProductoModal = async function() {
  if (!window.productoEnEdicion) return;
  const nombre = document.getElementById('modal-producto-nombre').value.trim();
  const precio = parseFloat(document.getElementById('modal-producto-precio').value || 0);
  const descripcion = document.getElementById('modal-producto-desc').value.trim();
  if (!nombre || precio <= 0) { alert('❌ Datos inválidos'); return; }
  if (await restaurante.actualizarProducto(window.productoEnEdicion.id_producto, { nombre_producto: nombre, precio, descripcion })) {
    alert('✅ Producto actualizado');
    window.cerrarModalProducto();
    window.cargarDatos();
  } else alert('❌ Error');
};

window.eliminarProductoConfirm = async function(id) {
  if (!confirm('¿Eliminar producto?')) return;
  if (await restaurante.eliminarProducto(id)) { alert('✅ Eliminado'); window.cargarDatos(); }
};

// ===== CRUD USUARIOS =====
window.crearUsuario = async function() {
  const nombre = document.getElementById('form-usuario-nombre').value.trim();
  const email = document.getElementById('form-usuario-email').value.trim();
  const password = document.getElementById('form-usuario-password').value;
  const rol = document.getElementById('form-usuario-rol').value;
  if (!nombre || !email || !password) { alert('❌ Completa campos'); return; }
  const result = await restaurante.crearUsuario({ nombre_usuario: nombre, email, password, rol, activo: true, fecha_creacion: new Date().toISOString() });
  if (result) { alert('✅ Usuario creado'); document.getElementById('form-usuario-nombre').value = ''; document.getElementById('form-usuario-email').value = ''; document.getElementById('form-usuario-password').value = ''; window.cargarDatos(); }
  else alert('❌ Error');
};

window.abrirEditarUsuario = async function(id) {
  const usuarios = await restaurante.cargarUsuarios();
  const usuario = usuarios.find(u => u.id_usuario === id);
  if (!usuario) return;
  window.usuarioEnEdicion = usuario;
  document.getElementById('modal-usuario-nombre').value = usuario.nombre_usuario;
  document.getElementById('modal-usuario-email').value = usuario.email;
  document.getElementById('modal-usuario-rol').value = usuario.rol;
  document.getElementById('modal-editar-usuario').style.display = 'flex';
};

window.cerrarModalUsuario = function() {
  document.getElementById('modal-editar-usuario').style.display = 'none';
  window.usuarioEnEdicion = null;
};

window.guardarEditarUsuarioModal = async function() {
  if (!window.usuarioEnEdicion) return;
  const nombre = document.getElementById('modal-usuario-nombre').value.trim();
  const email = document.getElementById('modal-usuario-email').value.trim();
  const rol = document.getElementById('modal-usuario-rol').value;
  if (!nombre || !email) { alert('❌ Campos requeridos'); return; }
  if (await restaurante.actualizarUsuario(window.usuarioEnEdicion.id_usuario, { nombre_usuario: nombre, email, rol })) {
    alert('✅ Usuario actualizado');
    window.cerrarModalUsuario();
    window.cargarDatos();
  } else alert('❌ Error');
};

window.eliminarUsuarioConfirm = async function(id) {
  if (!confirm('¿Eliminar usuario?')) return;
  if (await restaurante.eliminarUsuario(id)) { alert('✅ Eliminado'); window.cargarDatos(); }
};

// ===== CRUD MESAS =====
window.abrirEditarMesa = async function(id) {
  const mesas = await restaurante.cargarMesas();
  const mesa = mesas.find(m => m.id_mesa === id);
  if (!mesa) return;
  window.mesaEnEdicion = mesa;
  document.getElementById('modal-mesa-numero').value = mesa.numero_mesa;
  document.getElementById('modal-mesa-capacidad').value = mesa.capacidad;
  document.getElementById('modal-mesa-ubicacion').value = mesa.ubicacion || '';
  document.getElementById('modal-editar-mesa').style.display = 'flex';
};

window.cerrarModalMesa = function() {
  document.getElementById('modal-editar-mesa').style.display = 'none';
  window.mesaEnEdicion = null;
};

window.guardarEditarMesaModal = async function() {
  if (!window.mesaEnEdicion) return;
  const numero = parseInt(document.getElementById('modal-mesa-numero').value);
  const capacidad = parseInt(document.getElementById('modal-mesa-capacidad').value);
  const ubicacion = document.getElementById('modal-mesa-ubicacion').value.trim();
  if (!numero || !capacidad) { alert('❌ Campos requeridos'); return; }
  if (await restaurante.actualizarMesa(window.mesaEnEdicion.id_mesa, { numero_mesa: numero, capacidad, ubicacion })) {
    alert('✅ Mesa actualizada');
    window.cerrarModalMesa();
    window.cargarDatos();
  } else alert('❌ Error');
};

// ===== CRUD VENTAS =====
window.detallesVentaEnEdicion = [];

window.cargarDetallesVenta = async function(idVenta) {
  try {
    const { data, error } = await window.supabaseClient
      .from('detalle_ventas')
      .select('*, productos(nombre_producto, precio)')
      .eq('id_venta', idVenta);
    
    if (error) return [];
    window.detallesVentaEnEdicion = data || [];
    return data || [];
  } catch (e) {
    console.error('Error cargarDetallesVenta:', e);
    return [];
  }
};

window.mostrarDetallesVenta = function() {
  const detallesHtml = window.detallesVentaEnEdicion.map((d, idx) => `
    <div style="padding: 0.5rem; background: white; border-radius: 3px; margin-bottom: 0.3rem; display: flex; justify-content: space-between; align-items: center;">
      <span><strong>${d.productos?.nombre_producto || 'Producto'}</strong> - Cant: ${d.cantidad} × ${restaurante.formatearDinero(d.precio_unitario)}</span>
      <button class="btn btn-small btn-danger" onclick="window.eliminarProductoDeVenta(${idx})" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">X</button>
    </div>
  `).join('');
  
  document.getElementById('modal-venta-detalles').innerHTML = detallesHtml || '<p style="color: #999; font-size: 0.9rem;">Sin productos</p>';
};

window.agregarProductoAVenta = async function() {
  const idProducto = document.getElementById('modal-venta-producto-agregar').value;
  if (!idProducto) { alert('Selecciona un producto'); return; }
  
  const productos = await restaurante.cargarProductos();
  const producto = productos.find(p => p.id_producto === parseInt(idProducto));
  
  if (producto) {
    const existe = window.detallesVentaEnEdicion.find(d => d.id_producto === producto.id_producto);
    
    if (existe) {
      existe.cantidad++;
      existe.subtotal = existe.cantidad * existe.precio_unitario;
    } else {
      window.detallesVentaEnEdicion.push({
        id_producto: producto.id_producto,
        cantidad: 1,
        precio_unitario: producto.precio,
        subtotal: producto.precio,
        productos: { nombre_producto: producto.nombre_producto, precio: producto.precio }
      });
    }
    
    window.mostrarDetallesVenta();
    document.getElementById('modal-venta-producto-agregar').value = '';
    window.actualizarTotalVentaModal();
  }
};

window.eliminarProductoDeVenta = function(idx) {
  if (!confirm('¿Eliminar producto?')) return;
  window.detallesVentaEnEdicion.splice(idx, 1);
  window.mostrarDetallesVenta();
  window.actualizarTotalVentaModal();
};

window.actualizarTotalVentaModal = function() {
  const subtotal = window.detallesVentaEnEdicion.reduce((sum, d) => sum + (d.subtotal || 0), 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  document.getElementById('modal-venta-total').value = total.toFixed(2);
};

window.abrirEditarVenta = async function(id) {
  const ventas = await restaurante.cargarVentas();
  const venta = ventas.find(v => v.id_venta === id);
  if (!venta) { alert('No encontrada'); return; }
  
  window.ventaEnEdicion = venta;
  await window.cargarDetallesVenta(id);
  
  const clientes = await restaurante.cargarClientes();
  const mesas = await restaurante.cargarMesas();
  const productos = await restaurante.cargarProductos();
  
  let clienteHtml = '<option value="">-- Mostrador --</option>';
  clientes.forEach(c => clienteHtml += `<option value="${c.id_cliente}" ${venta.id_cliente === c.id_cliente ? 'selected' : ''}>${c.nombre}</option>`);
  document.getElementById('modal-venta-cliente').innerHTML = clienteHtml;
  
  let mesaHtml = '<option value="">-- Ninguna --</option>';
  mesas.forEach(m => mesaHtml += `<option value="${m.id_mesa}" ${venta.id_mesa === m.id_mesa ? 'selected' : ''}>Mesa ${m.numero_mesa}</option>`);
  document.getElementById('modal-venta-mesa').innerHTML = mesaHtml;
  
  let productoHtml = '<option value="">-- Agregar producto --</option>';
  productos.forEach(p => productoHtml += `<option value="${p.id_producto}">${p.nombre_producto} - ${restaurante.formatearDinero(p.precio)}</option>`);
  document.getElementById('modal-venta-producto-agregar').innerHTML = productoHtml;
  
  document.getElementById('modal-venta-metodo').value = venta.id_metodo_pago || '1';
  document.getElementById('modal-venta-estado').value = venta.estatus || 'Pagada';
  document.getElementById('modal-venta-total').value = venta.total.toFixed(2);
  document.getElementById('modal-venta-fecha').value = venta.fecha_venta ? venta.fecha_venta.split('T')[0] : '';
  
  window.mostrarDetallesVenta();
  document.getElementById('modal-editar-venta').style.display = 'flex';
};

window.cerrarModalVenta = function() {
  document.getElementById('modal-editar-venta').style.display = 'none';
  window.ventaEnEdicion = null;
};

window.guardarEditarVentaModal = async function() {
  if (!window.ventaEnEdicion) return;
  if (window.detallesVentaEnEdicion.length === 0) { alert('❌ Agregar al menos un producto'); return; }
  
  const id = window.ventaEnEdicion.id_venta;
  const idCliente = document.getElementById('modal-venta-cliente').value;
  const idMesa = document.getElementById('modal-venta-mesa').value;
  const estado = document.getElementById('modal-venta-estado').value;
  const total = parseFloat(document.getElementById('modal-venta-total').value);
  
  const subtotal = total / 1.16;
  const iva = total - subtotal;
  
  const datos = { 
    id_cliente: idCliente ? parseInt(idCliente) : null, 
    id_mesa: idMesa ? parseInt(idMesa) : null, 
    estatus: estado,
    subtotal: subtotal,
    iva: iva,
    total: total
  };
  
  try {
    // Actualizar venta
    if (!await restaurante.actualizarVenta(id, datos)) {
      alert('❌ Error al actualizar venta');
      return;
    }
    
    // Eliminar detalles antiguos
    await window.supabaseClient.from('detalle_ventas').delete().eq('id_venta', id);
    
    // Insertar nuevos detalles
    const detalles = window.detallesVentaEnEdicion.map(d => ({
      id_venta: id,
      id_producto: d.id_producto,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      subtotal: d.subtotal
    }));
    
    const { error } = await window.supabaseClient.from('detalle_ventas').insert(detalles);
    
    if (error) {
      alert('❌ Error al guardar productos');
      return;
    }
    
    alert('✅ Venta actualizada correctamente');
    window.cerrarModalVenta();
    window.cargarDatos();
  } catch (e) {
    console.error('Error guardar venta:', e);
    alert('❌ Error al guardar');
  }
};

window.eliminarVentaConfirm = async function(id) {
  if (!confirm('¿Eliminar venta?')) return;
  if (await restaurante.eliminarVenta(id)) { alert('✅ Eliminada'); window.cargarDatos(); }
};

// ===== CARRITO =====
window.agregarProductoAlCarrito = async function() {
  const idProducto = document.getElementById('venta-producto').value;
  if (!idProducto) { alert('Selecciona producto'); return; }
  const productos = await restaurante.cargarProductos();
  const producto = productos.find(p => p.id_producto === parseInt(idProducto));
  if (producto) {
    const existe = restaurante.carrito.find(p => p.id_producto === producto.id_producto);
    if (existe) {
      existe.cantidad++;
    } else {
      restaurante.carrito.push({ ...producto, cantidad: 1 });
    }
    window.actualizarTablaCarrito();
    document.getElementById('venta-producto').value = '';
  }
};

window.actualizarTablaCarrito = function() {
  const tbody = document.getElementById('tabla-carrito')?.querySelector('tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  let subtotal = 0;

  restaurante.carrito.forEach((item, idx) => {
    const itemSubtotal = item.precio * item.cantidad;
    subtotal += itemSubtotal;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nombre_producto}</td>
      <td><input type="number" min="1" value="${item.cantidad}" onchange="window.cambiarCantidadCarrito(${idx}, this.value)" style="width: 60px;"></td>
      <td>${restaurante.formatearDinero(item.precio)}</td>
      <td>${restaurante.formatearDinero(itemSubtotal)}</td>
      <td><button class="btn btn-small btn-danger" onclick="window.eliminarDelCarrito(${idx})">X</button></td>
    `;
    tbody.appendChild(tr);
  });

  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  document.getElementById('venta-subtotal').textContent = restaurante.formatearDinero(subtotal);
  document.getElementById('venta-iva').textContent = restaurante.formatearDinero(iva);
  document.getElementById('venta-total').textContent = restaurante.formatearDinero(total);
};

window.cambiarCantidadCarrito = function(idx, cantidad) {
  restaurante.carrito[idx].cantidad = Math.max(1, parseInt(cantidad));
  window.actualizarTablaCarrito();
};

window.eliminarDelCarrito = function(idx) {
  restaurante.carrito.splice(idx, 1);
  window.actualizarTablaCarrito();
};

window.registrarVenta = async function() {
  if (restaurante.carrito.length === 0) { alert('❌ Agregar productos'); return; }
  const idCliente = document.getElementById('venta-cliente').value;
  const idMesa = document.getElementById('venta-mesa').value;
  const subtotal = restaurante.carrito.reduce((s, item) => s + (item.precio * item.cantidad), 0);
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
  if (await restaurante.crearVenta(venta, detalles)) { 
    alert('✅ Venta registrada'); 
    restaurante.carrito = []; 
    window.actualizarTablaCarrito();
    document.getElementById('venta-cliente').value = '';
    document.getElementById('venta-mesa').value = '';
    window.cargarDatos(); 
  } else alert('❌ Error');
};

console.log('✅ app.js cargado correctamente');