// Utilidades generales

const API_URL = "http://10.210.27.216:8080";
// const API_URL = "http://localhost/cooperativa-de-viviendas-apis" 

// Control de autenticación y autorización
const paginasProtegidas = {
  "user/dashboard.html": "usuario",
  "admin/dashboard.html": "admins"
};

const rutaActual = window.location.pathname;
const partes = rutaActual.split("/").filter(Boolean);
const paginaActual = partes.slice(-2).join("/");

const usuarioLogueado = sessionStorage.getItem("usuarioLogueado") === "true";
const rolUsuario = sessionStorage.getItem("rol");

if (paginasProtegidas[paginaActual] && !usuarioLogueado) {
  alert("Debes iniciar sesión para acceder al dashboard.");
  window.location.href = "../login.html";
}
if (paginasProtegidas[paginaActual]) {
  const rolRequerido = paginasProtegidas[paginaActual];

  if (rolUsuario !== rolRequerido) {
    alert("No tienes permiso para acceder a esta página.");
    if (rolUsuario === "admins") {
      window.location.href = "/admin/dashboard.html";
    } else if (rolUsuario === "usuario") {
      window.location.href = "/user/dashboard.html";
    } else {
      window.location.href = "../login.html";
    }
  }
}

function logout() {
  sessionStorage.clear();
  window.location.href = "../index.html";
}

// Notificaciones
function showToast(message, type = 'success') {
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : '⚠'}</span>
        <span class="toast-text">${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// Formateo de datos
function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    if (!amount) return '$0';

    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');

    if (passwordInput && toggleIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggleIcon.textContent = '👁️';
        }
    }
}

// Navegación y scroll
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

// Validaciones
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateForm(formData, requiredFields) {
    const errors = [];

    requiredFields.forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
            errors.push(`El campo ${field} es requerido`);
        }
    });

    if (formData.email && !validateEmail(formData.email)) {
        errors.push('El email no es válido');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Control de errores
function handleApiError(error, defaultMessage = 'Ha ocurrido un error') {
    console.error('API Error:', error);

    if (error.message) {
        showToast(error.message, 'error');
    } else {
        showToast(defaultMessage, 'error');
    }
}

// Optimización de rendimiento
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

// Estados de UI
function setButtonLoading(button, loading = true) {
    if (!button) return;

    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}
function formatNumber(num) {
    return new Intl.NumberFormat('es-AR').format(num);
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Alternar tema completo (oscuro/claro) con efectos
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (themeIcon) {
        // Añadir efecto de rotación y escala antes del cambio
        themeIcon.style.transform = 'rotate(180deg) scale(0.8)';
        themeIcon.style.opacity = '0.5';
        
        // Esperar a que termine la animación antes de cambiar el tema
        setTimeout(() => {
            // Cambiar tema
            if (body.classList.contains('light-mode')) {
                // Cambiar a modo oscuro
                body.classList.remove('light-mode');
                body.classList.add('dark-mode');
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                localStorage.setItem('theme', 'dark');
                updatePoweredByImage('dark');
                updateCoopTrackImages('dark');
            } else {
                // Cambiar a modo claro
                body.classList.remove('dark-mode');
                body.classList.add('light-mode');
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                localStorage.setItem('theme', 'light');
                updatePoweredByImage('light');
                updateCoopTrackImages('light');
            }
            
            // Restaurar el icono con efecto de aparición
            themeIcon.style.transform = 'rotate(0deg) scale(1.1)';
            themeIcon.style.opacity = '1';
            
            // Volver al tamaño normal después de un momento
            setTimeout(() => {
                themeIcon.style.transform = 'rotate(0deg) scale(1)';
            }, 150);
            
        }, 200);
    }
}

// Actualizar imagen del powered by según el tema
function updatePoweredByImage(theme) {
    const poweredByImg = document.querySelector('.powered-by img');
    if (poweredByImg) {
        if (theme === 'light') {
            poweredByImg.src = 'img/aTech.webp';
        } else {
            poweredByImg.src = 'img/aTech_blanco.png';
        }
    }
}

// Actualizar imagen de CoopTrack según el tema
function updateCoopTrackImages(theme) {
    const coopTrackImages = document.querySelectorAll('img[src*="cooptrack"], .auth-logo, .nav-logo-img, .hero-logo-img, .footer-logo-img, .header-logo');
    coopTrackImages.forEach(img => {
        // Detectar si estamos en una subcarpeta (admin, user, etc.)
        const isInSubfolder = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/user/');
        const basePath = isInSubfolder ? '../img/' : 'img/';
        
        if (theme === 'light') {
            img.src = basePath + 'cooptrack_blanco.png';
        } else {
            img.src = basePath + 'cooptrack.png';
        }
    });
}

// Cargar tema guardado al inicializar la página
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (savedTheme === 'light') {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
        updatePoweredByImage('light');
        updateCoopTrackImages('light');
    } else {
        // Por defecto modo oscuro
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        updatePoweredByImage('dark');
        updateCoopTrackImages('dark');
    }
}

// Inicializar funcionalidad del botón de cambio de tema
document.addEventListener('DOMContentLoaded', function() {
    // Cargar tema guardado primero
    loadSavedTheme();
    
    // Configurar evento del botón
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            toggleTheme();
        });
    }
});
