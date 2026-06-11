// ========================================
// APP.JS - SISTEMA DE GESTIÓN RESTAURANTE
// ========================================

let currentSection = 'dashboard';
const db = {
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

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ app.js cargado correctamente');
  
  // Verificar que Supabase está disponible
  if (!window.config || !window.config.supabaseClient) {
    console.error('❌ config.js no cargó correctamente');
    showError('Error: No se pudo inicializar Supabase. Revisa config.js');
    return;
  }
  
  testConnection();
  
  // Event listeners para navegación
  document.querySelectorAll('[data-section]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      switchSection(el.dataset.section);
    });
  });
});

// ========================================
// CONEXIÓN A SUPABASE
// ========================================

async function testConnection() {
  try {
    const client = window.config.supabaseClient;
    
    // Simple SELECT para verificar conexión
    const { data, error } = await client
      .from(db.productos)
      .select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    
    setConnectionStatus(true);
    console.log('✅ Conexión a Supabase exitosa');
    loadDashboard();
  } catch (err) {
    console.error('❌ Error de conexión:', err);
    setConnectionStatus(false, err.message);
  }
}

function setConnectionStatus(isConnected, errorMsg = '') {
  const statusEl = document.getElementById('connection-status');
  if (!statusEl) return;
  
  if (isConnected) {
    statusEl.innerHTML = '✅ Conectado a Supabase';
    statusEl.className = 'status-connected';
  } else {
    statusEl.innerHTML = `❌ Error: ${errorMsg}`;
    statusEl.className = 'status-error';
  }
}

// ========================================
// NAVEGACIÓN
// ========================================

function switchSection(section) {
  currentSection = section;
  
  // Actualizar menú activo
  document.querySelectorAll('[data-section]').forEach(el => {
    el.classList.remove('active');
    if (el.dataset.section === section) el.classList.add('active');
  });
  
  // Ocultar todas las secciones
  document.querySelectorAll('.page-section').forEach(el => {
    el.style.display = 'none';
  });
  
  // Mostrar sección seleccionada
  const sectionEl = document.getElementById(`section-${section}`);
  if (sectionEl) sectionEl.style.display = 'block';
  
  // Cargar datos específicos
  switch (section) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'ventas':
      loadVentasUI();
      break;
    case 'productos':
      loadProductosUI();
      break;
    case 'mesas':
      loadMesasUI();
      break;
    case 'clientes':
      loadClientesUI();
      break;
    case 'reportes':
      loadReportesUI();
      break;
    case 'empleados':
      loadEmpleadosUI();
      break;
  }
}

// ========================================
// DASHBOARD
// ========================================

async function loadDashboard() {
  try {
    const client = window.config.supabaseClient;
    
    // Obtener ventas de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const { data: ventasHoy } = await client
      .from(db.ventas)
      .select('monto')
      .gte('fecha_venta', hoy);
    
    const totalHoy = ventasHoy?.reduce((s, v) => s + (v.monto || 0), 0) || 0;
    
    // Obtener todas las ventas
    const { data: todasVentas } = await client
      .from(db.ventas)
      .select('monto');
    
    const totalVentas = todasVentas?.reduce((s, v) => s + (v.monto || 0), 0) || 0;
    const promedioVenta = todasVentas?.length ? (totalVentas / todasVentas.length).toFixed(2) : 0;
    
    // Obtener mesas ocupadas
    const { data: mesas } = await client
      .from(db.mesas)
      .select('estado');
    
    const mesasOcupadas = mesas?.filter(m => m.estado === 'ocupada').length || 0;
    
    // Actualizar UI
    document.getElementById('dashboard-hoy').textContent = `$${totalHoy.toFixed(2)}`;
    document.getElementById('dashboard-total').textContent = `$${totalVentas.toFixed(2)}`;
    document.getElementById('dashboard-promedio').textContent = `$${promedioVenta}`;
    document.getElementById('dashboard-mesas').textContent = mesasOcupadas;
    
    // Últimas ventas
    const { data: ultimasVentas } = await client
      .from(db.ventas)
      .select('*, clientes(nombre), mesas(numero)')
      .order('fecha_venta', { ascending: false })
      .limit(5);
    
    const listHTML = (ultimasVentas || [])
      .map(v => `<div class="venta-item"><strong>${v.clientes?.nombre || 'Cliente'}</strong> - Mesa ${v.mesas?.numero} - $${v.monto}</div>`)
      .join('');
    
    document.getElementById('dashboard-ultimas').innerHTML = listHTML || '<p style="color:#999;">Sin ventas</p>';
    
  } catch (err) {
    console.error('Error loading dashboard:', err);
    showError('Error al cargar dashboard: ' + err.message);
  }
}

// ========================================
// VENTAS
// ========================================

async function loadVentasUI() {
  try {
    const client = window.config.supabaseClient;
    
    // Cargar selects
    const { data: clientes } = await client.from(db.clientes).select('id, nombre');
    const { data: mesas } = await client.from(db.mesas).select('id, numero');
    const { data: empleados } = await client.from(db.empleados).select('id, nombre');
    const { data: metodos } = await client.from(db.metodos_pago).select('id, nombre');
    
    // Poblar selects
    populateSelect('venta-cliente', clientes || []);
    populateSelect('venta-mesa', mesas || [], 'numero');
    populateSelect('venta-empleado', empleados || []);
    populateSelect('venta-metodo', metodos || []);
    
    // Historial de ventas
    await loadVentasHistorial();
    
  } catch (err) {
    console.error('Error loading ventas UI:', err);
    showError('Error al cargar ventas: ' + err.message);
  }
}

async function loadVentasHistorial() {
  try {
    const client = window.config.supabaseClient;
    
    const { data: ventas } = await client
      .from(db.ventas)
      .select('*, clientes(nombre), mesas(numero), empleados(nombre), metodos_pago(nombre)')
      .order('fecha_venta', { ascending: false })
      .limit(20);
    
    const html = (ventas || [])
      .map(v => `
        <tr>
          <td>${new Date(v.fecha_venta).toLocaleDateString()}</td>
          <td>${v.clientes?.nombre || '-'}</td>
          <td>${v.mesas?.numero || '-'}</td>
          <td>${v.empleados?.nombre || '-'}</td>
          <td>$${v.monto}</td>
          <td>${v.metodos_pago?.nombre || '-'}</td>
        </tr>
      `)
      .join('');
    
    document.getElementById('ventas-tabla').innerHTML = html || '<tr><td colspan="6">Sin ventas</td></tr>';
    
  } catch (err) {
    console.error('Error loading ventas:', err);
    showError('Error al cargar historial: ' + err.message);
  }
}

async function saveVenta() {
  try {
    const cliente_id = document.getElementById('venta-cliente')?.value;
    const mesa_id = document.getElementById('venta-mesa')?.value;
    const empleado_id = document.getElementById('venta-empleado')?.value;
    const metodo_id = document.getElementById('venta-metodo')?.value;
    const monto = parseFloat(document.getElementById('venta-monto')?.value || 0);
    
    if (!cliente_id || !mesa_id || !monto) {
      showError('Llena todos los campos');
      return;
    }
    
    const client = window.config.supabaseClient;
    
    const { error } = await client
      .from(db.ventas)
      .insert({
        cliente_id,
        mesa_id,
        empleado_id,
        metodo_pago_id: metodo_id,
        monto,
        fecha_venta: new Date().toISOString()
      });
    
    if (error) throw error;
    
    showSuccess('Venta registrada exitosamente');
    document.getElementById('venta-form')?.reset();
    await loadVentasHistorial();
    
  } catch (err) {
    console.error('Error saving venta:', err);
    showError('Error al guardar venta: ' + err.message);
  }
}

// ========================================
// PRODUCTOS
// ========================================

async function loadProductosUI() {
  try {
    const client = window.config.supabaseClient;
    
    const { data: categorias } = await client.from(db.categorias).select('id, nombre_categoria');
    populateSelect('producto-categoria', categorias || [], 'nombre_categoria');
    
    await loadProductosLista();
    
  } catch (err) {
    console.error('Error loading productos UI:', err);
    showError('Error al cargar productos: ' + err.message);
  }
}

async function loadProductosLista() {
  try {
    const client = window.config.supabaseClient;
    
    const { data: productos } = await client
      .from(db.productos)
      .select('*, categorias(nombre_categoria)')
      .order('nombre', { ascending: true });
    
    const html = (productos || [])
      .map(p => `
        <tr>
          <td>${p.nombre}</td>
          <td>${p.categorias?.nombre_categoria || '-'}</td>
          <td>$${p.precio}</td>
          <td>${p.cantidad_disponible}</td>
          <td>
            <button onclick="editProducto(${p.id})">Editar</button>
            <button onclick="deleteProducto(${p.id})">Eliminar</button>
          </td>
        </tr>
      `)
      .join('');
    
    document.getElementById('productos-tabla').innerHTML = html || '<tr><td colspan="5">Sin productos</td></tr>';
    
  } catch (err) {
    console.error('Error loading productos:', err);
    showError('Error al cargar productos: ' + err.message);
  }
}

async function saveProducto() {
  try {
    const nombre = document.getElementById('producto-nombre')?.value;
    const categoria_id = document.getElementById('producto-categoria')?.value;
    const precio = parseFloat(document.getElementById('producto-precio')?.value || 0);
    const cantidad = parseInt(document.getElementById('producto-cantidad')?.value || 0);
    
    if (!nombre || !categoria_id || !precio) {
      showError('Llena todos los campos');
      return;
    }
    
    const client = window.config.supabaseClient;
    
    const { error } = await client
      .from(db.productos)
      .insert({
        nombre,
        categoria_id,
        precio,
        cantidad_disponible: cantidad
      });
    
    if (error) throw error;
    
    showSuccess('Producto agregado');
    document.getElementById('producto-form')?.reset();
    await loadProductosLista();
    
  } catch (err) {
    console.error('Error saving producto:', err);
    showError('Error: ' + err.message);
  }
}

async function deleteProducto(id) {
  if (!confirm('¿Eliminar este producto?')) return;
  
  try {
    const client = window.config.supabaseClient;
    const { error } = await client.from(db.productos).delete().eq('id', id);
    if (error) throw error;
    
    showSuccess('Producto eliminado');
    await loadProductosLista();
  } catch (err) {
    showError('Error: ' + err.message);
  }
}

// ========================================
// MESAS
// ========================================

async function loadMesasUI() {
  try {
    const client = window.config.supabaseClient;
    
    const { data: mesas } = await client.from(db.mesas).select('*').order('numero');
    
    const html = (mesas || [])
      .map(m => `
        <div class="mesa-card ${m.estado}" onclick="toggleMesa(${m.id}, '${m.estado}')">
          <strong>Mesa ${m.numero}</strong><br>
          <small>${m.estado}</small>
        </div>
      `)
      .join('');
    
    document.getElementById('mesas-grid').innerHTML = html || '<p>Sin mesas</p>';
    
  } catch (err) {
    console.error('Error loading mesas:', err);
    showError('Error al cargar mesas: ' + err.message);
  }
}

async function toggleMesa(id, estadoActual) {
  try {
    const nuevoEstado = estadoActual === 'disponible' ? 'ocupada' : 'disponible';
    const client = window.config.supabaseClient;
    
    const { error } = await client
      .from(db.mesas)
      .update({ estado: nuevoEstado })
      .eq('id', id);
    
    if (error) throw error;
    await loadMesasUI();
  } catch (err) {
    showError('Error: ' + err.message);
  }
}

// ========================================
// CLIENTES
// ========================================

async function loadClientesUI() {
  try {
    const client = window.config.supabaseClient;
    
    const { data: clientes } = await client
      .from(db.clientes)
      .select('*')
      .order('nombre');
    
    const html = (clientes || [])
      .map(c => `
        <tr>
          <td>${c.nombre}</td>
          <td>${c.telefono || '-'}</td>
          <td>${c.email || '-'}</td>
          <td>
            <button onclick="editCliente(${c.id})">Editar</button>
            <button onclick="deleteCliente(${c.id})">Eliminar</button>
          </td>
        </tr>
      `)
      .join('');
    
    document.getElementById('clientes-tabla').innerHTML = html || '<tr><td colspan="4">Sin clientes</td></tr>';
    
  } catch (err) {
    console.error('Error loading clientes:', err);
    showError('Error al cargar clientes: ' + err.message);
  }
}

async function saveCliente() {
  try {
    const nombre = document.getElementById('cliente-nombre')?.value;
    const telefono = document.getElementById('cliente-telefono')?.value;
    const email = document.getElementById('cliente-email')?.value;
    
    if (!nombre) {
      showError('El nombre es requerido');
      return;
    }
    
    const client = window.config.supabaseClient;
    
    const { error } = await client
      .from(db.clientes)
      .insert({ nombre, telefono, email });
    
    if (error) throw error;
    
    showSuccess('Cliente agregado');
    document.getElementById('cliente-form')?.reset();
    await loadClientesUI();
    
  } catch (err) {
    showError('Error: ' + err.message);
  }
}

async function deleteCliente(id) {
  if (!confirm('¿Eliminar este cliente?')) return;
  
  try {
    const client = window.config.supabaseClient;
    const { error } = await client.from(db.clientes).delete().eq('id', id);
    if (error) throw error;
    
    showSuccess('Cliente eliminado');
    await loadClientesUI();
  } catch (err) {
    showError('Error: ' + err.message);
  }
}

// ========================================
// REPORTES
// ========================================

async function loadReportesUI() {
  const dateInput = document.getElementById('reporte-fecha');
  if (dateInput) {
    dateInput.valueAsDate = new Date();
    dateInput.addEventListener('change', generateReporte);
  }
  await generateReporte();
}

async function generateReporte() {
  try {
    const fecha = document.getElementById('reporte-fecha')?.value;
    if (!fecha) return;
    
    const client = window.config.supabaseClient;
    
    const { data: ventas } = await client
      .from(db.ventas)
      .select('*, clientes(nombre), mesas(numero), empleados(nombre)')
      .gte('fecha_venta', fecha + 'T00:00:00')
      .lt('fecha_venta', fecha + 'T23:59:59')
      .order('fecha_venta');
    
    const total = ventas?.reduce((s, v) => s + (v.monto || 0), 0) || 0;
    
    const html = (ventas || [])
      .map(v => `
        <tr>
          <td>${new Date(v.fecha_venta).toLocaleTimeString()}</td>
          <td>${v.clientes?.nombre || '-'}</td>
          <td>Mesa ${v.mesas?.numero || '-'}</td>
          <td>${v.empleados?.nombre || '-'}</td>
          <td>$${v.monto}</td>
        </tr>
      `)
      .join('');
    
    document.getElementById('reporte-tabla').innerHTML = html || '<tr><td colspan="5">Sin ventas</td></tr>';
    document.getElementById('reporte-total').textContent = `Total: $${total.toFixed(2)}`;
    
  } catch (err) {
    showError('Error: ' + err.message);
  }
}

// ========================================
// EMPLEADOS
// ========================================

async function loadEmpleadosUI() {
  try {
    const client = window.config.supabaseClient;
    
    const { data: empleados } = await client
      .from(db.empleados)
      .select('*')
      .order('nombre');
    
    const html = (empleados || [])
      .map(e => `
        <tr>
          <td>${e.nombre}</td>
          <td>${e.puesto || '-'}</td>
          <td>${e.telefono || '-'}</td>
          <td>${e.email || '-'}</td>
        </tr>
      `)
      .join('');
    
    document.getElementById('empleados-tabla').innerHTML = html || '<tr><td colspan="4">Sin empleados</td></tr>';
    
  } catch (err) {
    console.error('Error loading empleados:', err);
    showError('Error: ' + err.message);
  }
}

// ========================================
// UTILIDADES
// ========================================

function populateSelect(selectId, data = [], fieldToShow = 'nombre') {
  const select = document.getElementById(selectId);
  if (!select) return;
  
  select.innerHTML = '<option value="">-- Selecciona --</option>';
  data.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = item[fieldToShow];
    select.appendChild(opt);
  });
}

function showError(msg) {
  console.error('❌', msg);
  alert('❌ ' + msg);
}

function showSuccess(msg) {
  console.log('✅', msg);
  alert('✅ ' + msg);
}