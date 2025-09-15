document.addEventListener('DOMContentLoaded', function () { initializeAdmin(); });

function initializeAdmin() { setupNavigation(); loadSolicitudes(); setupModals(); loadDashboardStats(); }

function setupNavigation() {
    const menuItems = document.querySelectorAll('.admin-menu-item'); const sections = document.querySelectorAll('.admin-section');

    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            const section = this.dataset.section;

            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(section + '-section').classList.add('active');

            if (section === 'solicitudes') {
                loadSolicitudes();
            }
        });
    });

}
const api = {
    getSolicitudes: async () => {
        const response = await fetch("http://localhost/cooperativa-de-viviendas-apis/laravel/endpoint/solicitudes/obtener_solicitudes.php");
        return await response.json();
    },
};

function loadSolicitudes() {
    console.log("Cargando solicitudes...");

    fetch("http://localhost/cooperativa-de-viviendas-apis/laravel/endpoint/solicitudes/obtener_solicitudes.php")
        .then(res => {
            return res.json();
        })
        .then(result => {

            if (result.estado === "ok" && Array.isArray(result.solicitudes)) {
                displaySolicitudes(result.solicitudes);
            } else {
                showError("solicitudes-tbody", "No hay solicitudes");
            }
        })
        .catch(error => {
            showError("solicitudes-tbody", "Error al cargar las solicitudes");
        });
}

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

function formatDate(dateStr) { const d = new Date(dateStr); return d.toLocaleDateString('es-UY'); }

function formatCurrency(value) { return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(value); }

function getEstadoLabel(estado) { const labels = { 'pendiente': 'Pendiente', 'aprobada': 'Aprobada', 'rechazada': 'Rechazada', 'en_revision': 'En Revisión' }; return labels[estado] || estado; }

function showLoading(elementId) { const element = document.getElementById(elementId); if (element) { element.innerHTML = '<tr><td colspan="7" class="text-center">Cargando...</td></tr>'; } }

function showError(elementId, message) { const element = document.getElementById(elementId); if (element) { element.innerHTML = `<tr><td colspan="7" class="text-center">Error: ${message}</td></tr>`; } }

function loadDashboardStats() { document.getElementById('total-viviendas').textContent = '6'; document.getElementById('total-socios').textContent = '250'; document.getElementById('viviendas-construccion').textContent = '4'; }

function setupModals() { window.addEventListener('click', function (e) { if (e.target.classList.contains('modal')) { e.target.style.display = 'none'; } }); }

let solicitudActual = null;

async function verSolicitud(id) {
    try {
        const response = await fetch("http://localhost/cooperativa-de-viviendas-apis/laravel/endpoint/solicitudes/obtener_solicitudes.php?id=" + id);
        const result = await response.json();

        if (result.estado === "ok") {
            solicitudActual = result.solicitudes.find(s => s.id_usuario == id);

            if (solicitudActual) {
                const modalBody = document.getElementById('modal-solicitud-body');
                modalBody.innerHTML = `
                <div class="solicitud-detalle">
                    <p><strong>Nombre:</strong> ${solicitudActual.nom_usu}</p>
                    <p><strong>Cédula:</strong> ${solicitudActual.cedula}</p>
                    <p><strong>Correo:</strong> ${solicitudActual.correo}</p>
                    <p><strong>Teléfono:</strong> ${solicitudActual.telefono}</p>
                    <p><strong>Fecha de Nacimiento:</strong> ${formatDate(solicitudActual.fecha_nacimiento)}</p>
                    <p><strong>Estado Civil:</strong> ${solicitudActual.estado_civil}</p>
                    <p><strong>Ocupación:</strong> ${solicitudActual.ocupacion}</p>
                    <p><strong>Ingresos:</strong> ${solicitudActual.ingresos}</p>
                    <hr>
                    <p><strong>Vivienda:</strong> ${solicitudActual.Vivienda_Seleccionada}</p>
                    <p><strong>Monto Inicial:</strong> ${formatCurrency(solicitudActual.Monto_Inicial)}</p>
                    <p><strong>Forma de Pago:</strong> ${solicitudActual.Forma_Pago}</p>
                    ${solicitudActual.Grupo_Familiar ? `<p><strong>Grupo Familiar:</strong> ${solicitudActual.Grupo_Familiar}</p>` : ''}
                    ${solicitudActual.Comentarios ? `<p><strong>Comentarios:</strong> ${solicitudActual.Comentarios}</p>` : ''}
                    <p><strong>Estado:</strong> ${getEstadoLabel(solicitudActual.estado_solicitud)}</p>
                </div>
            `;
                document.getElementById('modal-solicitud').style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('Error al cargar la solicitud:', error);
    }

}

