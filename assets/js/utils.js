// Utilidades generales 

fetch("http://localhost/cooperativa-de-viviendas-apis/laravel/config/db.php")

// Verificar si el usuario está logueado y su rol
const paginasProtegidas = {
  "user/dashboard.html": "usuario",
  "admin/dashboard.html": "admins"
};

const rutaActual = window.location.pathname;
const partes = rutaActual.split("/").filter(Boolean);
const paginaActual = partes.slice(-2).join("/"); // "user/dashboard.html" o "admin/dashboard.html"

const usuarioLogueado = sessionStorage.getItem("usuarioLogueado") === "true";
const rolUsuario = sessionStorage.getItem("rol");

// Si no está logueado y la página es protegida
if (paginasProtegidas[paginaActual] && !usuarioLogueado) {
  alert("Debes iniciar sesión para acceder al dashboard.");
  window.location.href = "../login.html";
}

// Si está logueado pero no tiene rol adecuado
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


function showToast(message, type = 'success') {
    // Remover toasts existentes
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

// Smooth scrolling
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

// Validación de formularios
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

// Manejo de errores de API
function handleApiError(error, defaultMessage = 'Ha ocurrido un error') {
    console.error('API Error:', error);

    if (error.message) {
        showToast(error.message, 'error');
    } else {
        showToast(defaultMessage, 'error');
    }
}

// Debounce function
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

// Loading state para botones
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

// Formatear números
function formatNumber(num) {
    return new Intl.NumberFormat('es-AR').format(num);
}

// Capitalizar primera letra
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
