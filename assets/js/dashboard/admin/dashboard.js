// Dashboard administrativo
document.addEventListener('DOMContentLoaded', function () { 
    initializeAdmin(); 
    initializeSolicitudes();
});

function initializeAdmin() { 
    loadAdminInfo(); 
    setupModals(); 
    loadDashboardStats(); 
}

function initializeSolicitudes() {
    loadSolicitudes();
}

// Cargar información del administrador
function loadAdminInfo() {
    const adminName = sessionStorage.getItem("nombreUsuario") || "Admin";
    document.getElementById('adminName').textContent = adminName;
    document.getElementById('adminAvatar').textContent = adminName.charAt(0).toUpperCase();
}

const api = {
    getSolicitudes: async () => {
        const response = await fetch(`${API_URL}/endpoint/solicitudes/obtener_solicitudes.php`);
        return await response.json();
    },
};

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

// Funciones de formato
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

// Funciones de UI
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

function loadDashboardStats() { 
    document.getElementById('total-viviendas').textContent = '6'; 
    document.getElementById('total-socios').textContent = '250'; 
    document.getElementById('viviendas-construccion').textContent = '4'; 
}

function setupModals() { 
    window.addEventListener('click', function (e) { 
        if (e.target.classList.contains('modal')) { 
            e.target.style.display = 'none'; 
        } 
    }); 
}

function actualizarBadgeSolicitudes(solicitudes) {
    const badge = document.getElementById('solicitudes-badge');
    if (!badge) return;

    const pendientes = solicitudes.filter(s => s.estado_solicitud === 'pendiente').length;

    badge.textContent = pendientes;
}

function loadSolicitudes() {
    showLoading("solicitudes-tbody");

    fetch(`${API_URL}/endpoint/solicitudes/obtener_solicitudes.php`)
        .then(res => res.json())
        .then(result => {
            if (result.estado === "ok" && Array.isArray(result.solicitudes)) {
                displaySolicitudes(result.solicitudes);
                actualizarContadoresPendientes(result.solicitudes);
            } else {
                showError("solicitudes-tbody", "No hay solicitudes");
                actualizarContadoresPendientes([]);
            }
        })
        .catch(error => {
            console.error("Error al cargar solicitudes:", error);
            showError("solicitudes-tbody", "Error al cargar las solicitudes");
            actualizarContadoresPendientes([]);
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

