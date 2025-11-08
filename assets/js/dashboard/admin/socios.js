/* ============================================
   GESTIÓN DE SOCIOS - ADMINISTRADOR
   ============================================ */

/* Variables globales */
let sociosData = [];
let socioSeleccionado = null;

/* Inicialización */
document.addEventListener('DOMContentLoaded', function() {
    loadSocios();
    configurarFiltros();
});

/* ============================================
   CARGA DE SOCIOS
   ============================================ */

async function loadSocios() {
    document.getElementById('socios-tbody').innerHTML = `
        <tr>
            <td colspan="9" class="text-center">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i> 
                <span style="margin-left: 10px;">Cargando...</span>
            </td>
        </tr>
    `;
    
    try {
        const buscar = document.getElementById('filtro-buscar').value.trim();
        const estadoCivil = document.getElementById('filtro-estado-civil').value;
        const ingresos = document.getElementById('filtro-ingresos').value;
        
        const params = new URLSearchParams();
        if (buscar) params.append('buscar', buscar);
        if (estadoCivil) params.append('estado_civil', estadoCivil);
        if (ingresos) params.append('ingresos', ingresos);
        
        const url = `${API_URL}/endpoint/dashboard/admin/listar_socios.php?${params.toString()}`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.estado === "ok") {
            sociosData = result.socios;
            displaySociosWithIndicator(sociosData);
        } else {
            console.error('Error al cargar socios:', result.mensaje);
            document.getElementById('socios-tbody').innerHTML = `
                <tr>
                    <td colspan="9" class="text-center error">Error al cargar socios: ${result.mensaje}</td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error al cargar socios:', error);
        document.getElementById('socios-tbody').innerHTML = `
            <tr>
                <td colspan="9" class="text-center error">Error de conexión</td>
            </tr>
        `;
    }
}

/* ============================================
   VISUALIZACIÓN DE SOCIOS
   ============================================ */

function renderSociosTable(socios) {
    displaySociosWithIndicator(socios);
}

function displaySocios(socios) {
    const tbody = document.getElementById('socios-tbody');
    
    if (socios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">No se encontraron socios</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = socios.map(socio => `
        <tr>
            <td>${socio.id_usuario}</td>
            <td class="tooltip" data-tooltip="${socio.nom_usu}">${truncateText(socio.nom_usu, 20)}</td>
            <td>${socio.cedula}</td>
            <td class="tooltip" data-tooltip="${socio.correo}">${truncateText(socio.correo, 25)}</td>
            <td>${socio.telefono || 'N/A'}</td>
            <td><span class="estado-civil-badge ${socio.estado_civil}">${formatEstadoCivil(socio.estado_civil)}</span></td>
            <td class="tooltip" data-tooltip="${socio.ocupacion || 'N/A'}">${truncateText(socio.ocupacion || 'N/A', 25)}</td>
            <td><span class="ingresos-badge ${socio.ingresos}">${formatIngresos(socio.ingresos)}</span></td>
            <td>
                <button class="btn btn-small btn-primary" onclick="verSocio(${socio.id_usuario})">Ver</button>
            </td>
        </tr>
    `).join('');
}

/* ============================================
   DETALLE DEL SOCIO
   ============================================ */

async function verSocio(idUsuario) {
    const socio = sociosData.find(s => s.id_usuario == idUsuario);
    
    if (!socio) {
        console.error('Socio no encontrado');
        return;
    }
    
    socioSeleccionado = socio;
    
    const modalBody = document.getElementById('modal-socio-body');
    
    modalBody.innerHTML = `
        <div class="socio-detalle">
            <div class="detalle-row">
                <div class="detalle-item">
                    <strong>ID:</strong>
                    <span>${socio.id_usuario}</span>
                </div>
                <div class="detalle-item">
                    <strong>Nombre Completo:</strong>
                    <span>${socio.nom_usu}</span>
                </div>
            </div>
            
            <div class="detalle-row">
                <div class="detalle-item">
                    <strong>Cédula:</strong>
                    <span>${socio.cedula}</span>
                </div>
                <div class="detalle-item">
                    <strong>Correo:</strong>
                    <span>${socio.correo}</span>
                </div>
            </div>
            
            <div class="detalle-row">
                <div class="detalle-item">
                    <strong>Teléfono:</strong>
                    <span>${socio.telefono || 'No registrado'}</span>
                </div>
                <div class="detalle-item">
                    <strong>Fecha de Nacimiento:</strong>
                    <span>${socio.fecha_nacimiento ? formatDate(socio.fecha_nacimiento) : 'No registrada'}</span>
                </div>
            </div>
            
            <div class="detalle-row">
                <div class="detalle-item">
                    <strong>Estado Civil:</strong>
                    <span class="estado-civil-badge ${socio.estado_civil}">${formatEstadoCivil(socio.estado_civil)}</span>
                </div>
                <div class="detalle-item">
                    <strong>Ocupación:</strong>
                    <span>${socio.ocupacion || 'No registrada'}</span>
                </div>
            </div>
            
            <div class="detalle-row">
                <div class="detalle-item full-width">
                    <strong>Nivel de Ingresos:</strong>
                    <span class="ingresos-badge ${socio.ingresos}">${formatIngresos(socio.ingresos)}</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal-socio').style.display = 'flex';
}

/* ============================================
   CONFIGURACIÓN DE FILTROS
   ============================================ */

function configurarFiltros() {
    document.getElementById('filtro-buscar').addEventListener('input', debounce(loadSocios, 300));
    document.getElementById('filtro-estado-civil').addEventListener('change', loadSocios);
    document.getElementById('filtro-ingresos').addEventListener('change', loadSocios);
}

/* ============================================
   FUNCIONES DE FORMATO
   ============================================ */

function formatEstadoCivil(estadoCivil) {
    const estados = {
        'soltero': 'Soltero/a',
        'casado': 'Casado/a',
        'divorciado': 'Divorciado/a',
        'viudo': 'Viudo/a',
        'union_convivencial': 'Unión Convivencial'
    };
    return estados[estadoCivil] || estadoCivil;
}

function formatIngresos(ingresos) {
    const rangos = {
        'hasta_500000': 'Hasta $500.000',
        '500000_1000000': '$500.000 - $1.000.000',
        '1000000_1500000': '$1.000.000 - $1.500.000',
        '1500000_2000000': '$1.500.000 - $2.000.000',
        'mas_2000000': 'Más de $2.000.000'
    };
    return rangos[ingresos] || ingresos || 'No registrado';
}

function formatDate(dateString) {
    if (!dateString) return 'No registrada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/* ============================================
   GESTIÓN DE MODALES
   ============================================ */

function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    
    if (modalId === 'modal-socio') {
        socioSeleccionado = null;
        
        const btnEliminar = document.getElementById('btn-eliminar-socio');
        if (btnEliminar) {
            btnEliminar.disabled = false;
            btnEliminar.textContent = 'Eliminar Usuario';
        }
    }
}

function confirmarEliminacion() {
    document.getElementById('modal-confirmar-eliminacion').style.display = 'flex';
}

function cerrarModalConfirmacion() {
    document.getElementById('modal-confirmar-eliminacion').style.display = 'none';
}

function eliminarSocioConfirmado() {
    eliminarSocio();
    cerrarModalConfirmacion();
}

/* ============================================
   FUNCIONES DE UTILIDAD
   ============================================ */

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/* Verificar indicador de scroll en tabla */
function checkScrollIndicator() {
    const tableContainer = document.querySelector('.table-container');
    const table = document.getElementById('socios-table');
    
    if (tableContainer && table) {
        const hasHorizontalScroll = table.scrollWidth > tableContainer.clientWidth;
        
        const existingIndicator = document.querySelector('.table-scroll-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
    }
}

/* Mostrar socios con indicador de scroll */
function displaySociosWithIndicator(socios) {
    displaySocios(socios);
    setTimeout(checkScrollIndicator, 100);
}

/* ============================================
   EVENTOS GLOBALES
   ============================================ */

/* Cerrar modales al hacer clic fuera */
document.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            const modalId = modal.getAttribute('id');
            cerrarModal(modalId);
        }
    });
});

/* ============================================
   ELIMINACIÓN DE SOCIOS
   ============================================ */

async function eliminarSocio() {
    if (!socioSeleccionado) {
        showToast('No hay socio seleccionado', 'error');
        return;
    }
    
    try {
        const btnEliminar = document.getElementById('btn-eliminar-socio');
        btnEliminar.disabled = true;
        btnEliminar.textContent = 'Eliminando...';
        
        const response = await fetch(`${API_URL}/endpoint/dashboard/admin/eliminar_socio.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario: socioSeleccionado.id_usuario
            })
        });
        
        const result = await response.json();
        
        if (result.estado === 'ok') {
            showToast(`Usuario "${result.usuario_eliminado.nombre}" eliminado exitosamente`, 'success');
            
            cerrarModal('modal-socio');
            await loadSocios();
            socioSeleccionado = null;
            
        } else {
            throw new Error(result.mensaje || 'Error desconocido al eliminar usuario');
        }
        
    } catch (error) {
        console.error('Error al eliminar socio:', error);
        showToast('Error al eliminar usuario: ' + error.message, 'error');
        
        const btnEliminar = document.getElementById('btn-eliminar-socio');
        btnEliminar.disabled = false;
        btnEliminar.textContent = 'Eliminar Usuario';
    }
}
