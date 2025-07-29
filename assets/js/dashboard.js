document.addEventListener('DOMContentLoaded', function() {
    if (!auth.requireAuth()) return;
    
    initializeDashboard();
});

function initializeDashboard() {
    loadUserInfo();
    setupNavigation();
    setupProfileForm();
    loadDashboardData();
}

function loadUserInfo() {
    const user = auth.getCurrentUser();
    document.getElementById('userName').textContent = user.nombre;
    document.getElementById('userAvatar').textContent = user.nombre.charAt(0).toUpperCase();
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active nav
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show section
            const sectionId = this.dataset.section + '-section';
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
        });
    });
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
        form.addEventListener('submit', function(e) {
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

function loadDashboardData() {
    // Simular carga de datos
    setTimeout(() => {
        document.getElementById('activeProjects').textContent = '2';
        document.getElementById('nextSchedule').textContent = '25 Ene - 09:00';
        document.getElementById('pendingPayments').textContent = '1';
        document.getElementById('overallProgress').textContent = '65%';
    }, 500);
}

function logout() {
    auth.logout();
}

function resetProfileForm() {
    document.getElementById('profileForm').reset();
    loadUserInfo();
}
