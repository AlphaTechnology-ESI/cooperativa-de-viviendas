/* ============================================
   DASHBOARD DE USUARIO
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    const nombreUsuario = sessionStorage.getItem("nombreUsuario") || "Usuario";

    /* Actualizar información del usuario en encabezado */
    document.getElementById('userName').textContent = nombreUsuario;

    /* Actualizar información del usuario en la barra lateral */
    const userName2 = document.getElementById('userName2');
    if (userName2) {
        userName2.textContent = nombreUsuario;
    }

    /* Actualizar avatar con iniciales del usuario */
    const iniciales = nombreUsuario.charAt(0).toUpperCase();
    document.getElementById('userAvatar').textContent = iniciales;

    const userAvatar2 = document.getElementById('userAvatar2');
    if (userAvatar2) {
        userAvatar2.textContent = iniciales;
    }

    setupProfileForm();
    setupHorasForm();
    loadDashboardData();
});

/* ============================================
   FORMULARIO DE PERFIL
   ============================================ */

function setupProfileForm() {
    const form = document.getElementById('profileForm');
    const user = auth.getCurrentUser();
    if (form && user) {
        document.getElementById('profileNombre').value = user.nombre || '';
        document.getElementById('profileEmail').value = user.email || '';
        document.getElementById('profileTipoSocio').value = user.tipo || '';
        document.getElementById('profileEstado').value = 'Activo';
        document.getElementById('profileFechaIngreso').value = '';
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

/* ============================================
   FORMULARIO DE HORAS
   ============================================ */

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

/* ============================================
   CARGA DE DATOS DEL DASHBOARD
   ============================================ */

function loadDashboardData() {
    setTimeout(() => {
        document.getElementById('activeProjects').textContent = '2';
        document.getElementById('nextSchedule').textContent = '25 Ene - 09:00';
        document.getElementById('pendingPayments').textContent = '1';
        document.getElementById('overallProgress').textContent = '65%';
    }, 500);
}

/* ============================================
   FUNCIONES DE UTILIDAD
   ============================================ */

function resetProfileForm() {
    document.getElementById('profileForm').reset();
    loadUserInfo();
}
