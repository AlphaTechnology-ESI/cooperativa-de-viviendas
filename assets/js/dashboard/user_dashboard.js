document.addEventListener('DOMContentLoaded', function () { initializeDashboard(); });

function initializeDashboard() {
    loadUserInfo();
    setupNavigation();
    setupProfileForm();
    setupHorasForm();
    loadDashboardData();
}

function loadUserInfo() {
    const userName = sessionStorage.getItem("nombreUsuario") || "Usuario";
    document.getElementById('userName').textContent = userName;
    document.getElementById('userAvatar').textContent = userName.charAt(0).toUpperCase();
}

function setupProfileForm() {
    const form = document.getElementById('profileForm');
    const user = auth.getCurrentUser();

    // Llenar formulario con datos del usuario
    if (form && user) {
        document.getElementById('profileNombre').value = user.nombre || '';
        document.getElementById('profileEmail').value = user.email || '';
        document.getElementById('profileTipoSocio').value = user.tipo || '';
        document.getElementById('profileEstado').value = 'Activo';
        document.getElementById('profileFechaIngreso').value = '15 de Enero, 2024';
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const btn = document.getElementById('saveProfileBtn');
            btn.classList.add('loading');

            setTimeout(() => {
                btn.classList.remove('loading');
                showToast('Perfil actualizado exitosamente', 'success');
            }, 1500);
        });
    }
}

function setupHorasForm() {
    const form = document.getElementById('horasForm');
    const listaHoras = document.getElementById('listaHoras');
    if (!form || !listaHoras) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const fecha = document.getElementById('fechaTrabajo').value;
        const horas = document.getElementById('horasTrabajo').value;
        const fileInput = document.getElementById('comprobantePago');
        const fileName = fileInput && fileInput.files[0] ? fileInput.files[0].name : 'Sin archivo';

        const item = document.createElement('div');
        item.classList.add('activity-item');
        item.innerHTML = `
          <div class="activity-icon">⏱️</div>
          <div class="activity-content">
            <p>${horas} horas - ${fecha}</p>
            <small>Comprobante: ${fileName}</small>
          </div>
        `;
        listaHoras.prepend(item);
        form.reset();
    });
}

function loadDashboardData() {
    // Simular carga de datos
    setTimeout(() => {
        document.getElementById('activeProjects').textContent = '2';
        document.getElementById('nextSchedule').textContent = '25 Ene - 09:00';
        document.getElementById('pendingPayments').textContent = '1';
        document.getElementById('overallProgress').textContent = '65%';
    }, 500);
}

function resetProfileForm() {
    document.getElementById('profileForm').reset();
    loadUserInfo();
}
