// JavaScript para admin.html - MEJORADO
document.addEventListener('DOMContentLoaded', function() {
    if (!auth.requireAdmin()) return;
    
    initializeAdmin();
});

function initializeAdmin() {
    setupNavigation();
    loadSolicitudes();
    setupModals();
    loadDashboardStats();
}

function setupNavigation() {
    const menuItems = document.querySelectorAll('.admin-menu-item');
    const sections = document.querySelectorAll('.admin-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = this.dataset.section;
            
            // Update active menu
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Show section
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(section + '-section').classList.add('active');
            
            if (section === 'solicitudes') {
                loadSolicitudes();
            }
        });
    });
}

async function loadSolicitudes() {
    try {
        showLoading('solicitudes-tbody');
        
        const response = await api.getSolicitudes();
        
        if (response.success) {
            displaySolicitudes(response.data);
            updateStats(response.data);
            updateDashboardSolicitudes(response.data);
        } else {
            showError('solicitudes-tbody', response.message);
        }
    } catch (error) {
        console.error('Error loading solicitudes:', error);
        showError('solicitudes-tbody', 'Error de conexión');
    }
}

function displaySolicitudes(solicitudes) {
    const tbody = document.getElementById('solicitudes-tbody');
    
    if (!tbody) return;
    
    if (solicitudes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay solicitudes</td></tr>';
        return;
    }
    
    tbody.innerHTML = solicitudes.map(s => `
        <tr>
            <td>${formatDate(s.fecha_solicitud)}</td>
            <td>${s.nombre}</td>
            <td>${s.dni}</td>
            <td>${s.vivienda_seleccionada}</td>
            <td>${formatCurrency(s.monto_inicial)}</td>
            <td><span class="badge badge-${s.estado_solicitud}">${getEstadoLabel(s.estado_solicitud)}</span></td>
            <td>
                <button class="btn btn-small btn-primary" onclick="verSolicitud(${s.id})">Ver</button>
            </td>
        </tr>
    `).join('');
}

function updateStats(solicitudes) {
    const pendientes = solicitudes.filter(s => s.estado_solicitud === 'pendiente').length;
    const aprobadas = solicitudes.filter(s => s.estado_solicitud === 'aprobada').length;
    const rechazadas = solicitudes.filter(s => s.estado_solicitud === 'rechazada').length;
    const enRevision = solicitudes.filter(s => s.estado_solicitud === 'en_revision').length;
    
    document.getElementById('total-solicitudes').textContent = pendientes;
    document.getElementById('solicitudes-badge').textContent = pendientes;
}

function updateDashboardSolicitudes(solicitudes) {
    const container = document.getElementById('solicitudes-recientes');
    if (!container) return;
    
    const recientes = solicitudes.slice(0, 5);
    
    if (recientes.length === 0) {
        container.innerHTML = '<p>No hay solicitudes recientes</p>';
        return;
    }
    
    container.innerHTML = recientes.map(s => `
        <div class="solicitud-item">
            <strong>${s.nombre}</strong>
            <span class="solicitud-vivienda">${s.vivienda_seleccionada}</span>
            <span class="badge badge-${s.estado_solicitud}">${getEstadoLabel(s.estado_solicitud)}</span>
        </div>
    `).join('');
}

function loadDashboardStats() {
    // Cargar estadísticas del dashboard
    setTimeout(() => {
        document.getElementById('total-viviendas').textContent = '6';
        document.getElementById('total-socios').textContent = '250';
        document.getElementById('viviendas-construccion').textContent = '4';
    }, 500);
}

function setupModals() {
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

let solicitudActual = null;

async function verSolicitud(id) {
    try {
        const response = await api.getSolicitudes();
        
        if (response.success) {
            solicitudActual = response.data.find(s => s.id == id);
            
            if (solicitudActual) {
                const modalBody = document.getElementById('modal-solicitud-body');
                modalBody.innerHTML = `
                    <div class="solicitud-detalle">
                        <div class="detalle-section">
                            <h4>Datos Personales</h4>
                            <p><strong>Nombre:</strong> ${solicitudActual.nombre}</p>
                            <p><strong>DNI:</strong> ${solicitudActual.dni}</p>
                            <p><strong>Email:</strong> ${solicitudActual.email}</p>
                            <p><strong>Teléfono:</strong> ${solicitudActual.telefono}</p>
                            <p><strong>Fecha de Nacimiento:</strong> ${formatDate(solicitudActual.fecha_nacimiento)}</p>
                            <p><strong>Estado Civil:</strong> ${solicitudActual.estado_civil}</p>
                        </div>
                        <div class="detalle-section">
                            <h4>Información Laboral</h4>
                            <p><strong>Ocupación:</strong> ${solicitudActual.ocupacion}</p>
                            <p><strong>Ingresos:</strong> ${getIngresosLabel(solicitudActual.ingresos)}</p>
                        </div>
                        <div class="detalle-section">
                            <h4>Vivienda Solicitada</h4>
                            <p><strong>Vivienda:</strong> ${solicitudActual.vivienda_seleccionada}</p>
                            <p><strong>Monto Inicial:</strong> ${formatCurrency(solicitudActual.monto_inicial)}</p>
                            <p><strong>Forma de Pago:</strong> ${solicitudActual.forma_pago}</p>
                        </div>
                        ${solicitudActual.grupo_familiar ? `
                            <div class="detalle-section">
                                <h4>Grupo Familiar</h4>
                                <p>${solicitudActual.grupo_familiar}</p>
                            </div>
                        ` : ''}
                        ${solicitudActual.comentarios ? `
                            <div class="detalle-section">
                                <h4>Comentarios</h4>
                                <p>${solicitudActual.comentarios}</p>
                            </div>
                        ` : ''}
                        ${solicitudActual.comentarios_admin ? `
                            <div class="detalle-section">
                                <h4>Comentarios del Administrador</h4>
                                <p>${solicitudActual.comentarios_admin}</p>
                            </div>
                        ` : ''}
                        <div class="detalle-section">
                            <h4>Estado Actual</h4>
                            <p><span class="badge badge-${solicitudActual.estado_solicitud}">${getEstadoLabel(solicitudActual.estado_solicitud)}</span></p>
                            <p><strong>Fecha de Solicitud:</strong> ${formatDate(solicitudActual.fecha_solicitud)}</p>
                            ${solicitudActual.fecha_evaluacion ? `<p><strong>Fecha de Evaluación:</strong> ${formatDate(solicitudActual.fecha_evaluacion)}</p>` : ''}
                        </div>
                    </div>
                `;
                
                document.getElementById('modal-solicitud').style.display = 'flex';
            }
        }
    } catch (error) {
        showToast('Error al cargar la solicitud', 'error');
    }
}

async function aprobarSolicitud() {
    if (!solicitudActual) return;
    
    try {
        const response = await api.updateSolicitud(
            solicitudActual.id, 
            'aprobada', 
            'Solicitud aprobada por el administrador'
        );
        
        if (response.success) {
            showToast('Solicitud aprobada correctamente', 'success');
            cerrarModal('modal-solicitud');
            loadSolicitudes();
        } else {
            showToast('Error al aprobar solicitud: ' + response.message, 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

async function rechazarSolicitud() {
    if (!solicitudActual) return;
    
    try {
        const response = await api.updateSolicitud(
            solicitudActual.id, 
            'rechazada', 
            'Solicitud rechazada por el administrador'
        );
        
        if (response.success) {
            showToast('Solicitud rechazada', 'error');
            cerrarModal('modal-solicitud');
            loadSolicitudes();
        } else {
            showToast('Error al rechazar solicitud: ' + response.message, 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

async function ponerEnRevision() {
    if (!solicitudActual) return;
    
    try {
        const response = await api.updateSolicitud(
            solicitudActual.id, 
            'en_revision', 
            'Solicitud puesta en revisión'
        );
        
        if (response.success) {
            showToast('Solicitud puesta en revisión', 'warning');
            cerrarModal('modal-solicitud');
            loadSolicitudes();
        } else {
            showToast('Error al poner en revisión: ' + response.message, 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    solicitudActual = null;
}

function logout() {
    auth.logout();
}

// Funciones auxiliares
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<tr><td colspan="7" class="text-center">Cargando...</td></tr>';
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<tr><td colspan="7" class="text-center">Error: ${message}</td></tr>`;
    }
}

function getEstadoLabel(estado) {
    const labels = {
        'pendiente': 'Pendiente',
        'aprobada': 'Aprobada',
        'rechazada': 'Rechazada',
        'en_revision': 'En Revisión'
    };
    return labels[estado] || estado;
}

function getIngresosLabel(ingresos) {
    const labels = {
        'hasta_500000': 'Hasta $500.000',
        '500000_1000000': '$500.000 - $1.000.000',
        '1000000_1500000': '$1.000.000 - $1.500.000',
        '1500000_2000000': '$1.500.000 - $2.000.000',
        'mas_2000000': 'Más de $2.000.000'
    };
    return labels[ingresos] || ingresos;
}

// Filtros
document.addEventListener('DOMContentLoaded', function() {
    const filtroEstado = document.getElementById('filtro-estado');
    if (filtroEstado) {
        filtroEstado.addEventListener('change', function() {
            // Implementar filtrado por estado si es necesario
            loadSolicitudes();
        });
    }
});
