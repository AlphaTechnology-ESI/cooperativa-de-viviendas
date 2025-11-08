/* ============================================
   DASHBOARD ADMINISTRATIVO
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    const nombreAdmin = sessionStorage.getItem("nombreUsuario") || "Admin";

    // Actualizar información del administrador en el encabezado
    document.getElementById('adminName').textContent = nombreAdmin;

    // Actualizar información del administrador en la barra lateral
    const adminName2 = document.getElementById('adminName2');
    if (adminName2) {
        adminName2.textContent = nombreAdmin;
    }

    // Actualizar avatar con iniciales
    const iniciales = nombreAdmin.charAt(0).toUpperCase();
    document.getElementById('adminAvatar').textContent = iniciales;

    const adminAvatar2 = document.getElementById('adminAvatar2');
    if (adminAvatar2) {
        adminAvatar2.textContent = iniciales;
    }

    setupModals();
    cargarEstadisticas();
    loadSolicitudes();
});

/* ============================================
   CONFIGURACIÓN DE MODALES
   ============================================ */

function displaySolicitudes(solicitudes) {
    const tbody = document.getElementById('solicitudes-tbody'); if (!tbody) return;

    if (solicitudes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay solicitudes</td></tr>';
        return;
    }
    console.log('Solicitudes:', solicitudes);
    tbody.innerHTML = solicitudes.map(s => `
    <tr>
        <td>${formatDate(s.fecha_solicitud)}</td>
        <td>${s.nom_usu}</td>
        <td>${s.cedula}</td>
        <td>${s.Vivienda_Seleccionada}</td>
        <td>${formatCurrency(s.Monto_Inicial)}</td>
        <td><span class="badge badge-${s.estado_solicitud}">${getEstadoLabel(s.estado_solicitud)}</span></td>
        <td><button class="btn btn-small btn-primary" onclick="verSolicitud(${s.id_usuario})">Ver</button></td>
    </tr>
`).join('');

}

/* ============================================
   FUNCIONES DE FORMATO
   ============================================ */

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-UY');
}

function formatDateTime(dateStr) {
    const d = new Date(dateStr);
    const options = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    };
    return d.toLocaleString('es-UY', options);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency: 'UYU'
    }).format(value);
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

/* ============================================
   FUNCIONES DE INTERFAZ
   ============================================ */

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

/* ============================================
   CONFIGURACIÓN DE MODALES
   ============================================ */

function setupModals() {
    window.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

/* ============================================
   GESTIÓN DE BADGES Y CONTADORES
   ============================================ */

function actualizarBadgeSolicitudes(solicitudes) {
    const badge = document.getElementById('solicitudes-badge');
    if (!badge) return;

    const pendientes = solicitudes.filter(s => s.estado_solicitud === 'pendiente').length;

    badge.textContent = pendientes;
}

/* ============================================
   CARGA DE SOLICITUDES
   ============================================ */

function loadSolicitudes() {
    showLoading("solicitudes-tbody");

    fetch(`${API_URL}/endpoint/solicitudes/obtener_solicitudes.php`)
        .then(res => res.json())
        .then(result => {
            if (result.estado === "ok" && Array.isArray(result.solicitudes)) {
                displaySolicitudes(result.solicitudes);
                actualizarContadoresPendientes(result.solicitudes);
                actualizarBadgeSolicitudes(result.solicitudes);
            } else {
                showError("solicitudes-tbody", "No hay solicitudes");
                actualizarContadoresPendientes([]);
                actualizarBadgeSolicitudes([]);
            }
        })
        .catch(error => {
            console.error("Error al cargar solicitudes:", error);
            showError("solicitudes-tbody", "Error al cargar las solicitudes");
            actualizarContadoresPendientes([]);
            actualizarBadgeSolicitudes([]);
        });
}

function actualizarContadoresPendientes(solicitudes) {
    const pendientes = solicitudes.filter(s => s.estado_solicitud === 'pendiente');
    const cantidad = pendientes.length;

    const badge = document.getElementById("solicitudes-badge");
    const total = document.getElementById("total-solicitudes");

    if (badge) badge.textContent = cantidad;
    if (total) total.textContent = cantidad;
}

/* ============================================
   CARGAR ESTADÍSTICAS
   ============================================ */

async function cargarEstadisticas() {
    console.log('Iniciando carga de estadísticas...');

    // Mostrar spinner en lugar de números
    const elementosConSpinner = ['total-viviendas', 'total-socios', 'viviendas-construccion', 'total-solicitudes'];

    elementosConSpinner.forEach(id => {
        const elemento = document.getElementById(id);
        console.log(`Buscando elemento: ${id}`, elemento);
        if (elemento) {
            elemento.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: var(--primary-color);"></i>';
            console.log(`Spinner agregado a: ${id}`);
        }
    });

    // Mostrar spinner en el badge también
    const badge = document.getElementById('solicitudes-badge');
    if (badge) {
        badge.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size: 10px;"></i>';
        console.log('Spinner agregado al badge');
    }

    try {
        console.log('Haciendo fetch a:', `${API_URL}/endpoint/dashboard/admin/estadisticas.php`);
        const response = await fetch(`${API_URL}/endpoint/dashboard/admin/estadisticas.php`);
        const result = await response.json();
        console.log('Resultado recibido:', result);

        if (result.estado === "ok") {
            const elementos = {
                'total-viviendas': result.total_viviendas || '0',
                'total-socios': result.total_socios || '0',
                'viviendas-construccion': result.viviendas_construccion || '0',
                'total-solicitudes': result.solicitudes_pendientes || '0'
            };

            Object.keys(elementos).forEach(id => {
                const elemento = document.getElementById(id);
                if (elemento) {
                    elemento.textContent = elementos[id];
                    console.log(`Actualizado ${id} con valor:`, elementos[id]);
                }
            });

            if (badge) {
                badge.textContent = result.solicitudes_pendientes || '0';
                console.log('Badge actualizado con:', result.solicitudes_pendientes);
            }
        } else {
            console.error('Error en respuesta:', result);
        }
    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        // Si hay error, mostrar 0 en lugar del spinner
        elementosConSpinner.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = '0';
            }
        });
        if (badge) {
            badge.textContent = '0';
        }
    }
}

