/* ============================================
   UTILIDADES GLOBALES
   ============================================ */

/* Configuración de URL de la API */
const API_URL = window.CONFIG && window.CONFIG.API_URL ? window.CONFIG.API_URL : "http://localhost/cooperativa-de-viviendas-apis";

/* ============================================
   CONTROL DE AUTENTICACIÓN Y AUTORIZACIÓN
   ============================================ */

/* Páginas protegidas por rol */
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

/* Cerrar sesión del usuario */
function logout() {
  sessionStorage.clear();
  window.location.href = "../index.html";
}

/* ============================================
   SISTEMA DE NOTIFICACIONES
   ============================================ */

/* Mostrar notificación toast */
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

/* ============================================
   FORMATO DE DATOS
   ============================================ */

/* Formatear fecha a formato local */
function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/* Formatear moneda */
function formatCurrency(amount) {
    if (!amount) return '$0';

    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/* Alternar visibilidad de contraseña */
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

/* ============================================
   NAVEGACIÓN Y SCROLL
   ============================================ */

/* Desplazamiento suave a elemento */
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

/* ============================================
   VALIDACIONES
   ============================================ */

/* Validar formato de email */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/* Validar campos requeridos de formulario */
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

/* ============================================
   CONTROL DE ERRORES
   ============================================ */

/* Manejar errores de API */
function handleApiError(error, defaultMessage = 'Ha ocurrido un error') {
    if (error.message) {
        showToast(error.message, 'error');
    } else {
        showToast(defaultMessage, 'error');
    }
}

/* ============================================
   OPTIMIZACIÓN DE RENDIMIENTO
   ============================================ */

/* Función debounce para limitar ejecución */
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

/* ============================================
   ESTADOS DE INTERFAZ
   ============================================ */

/* Establecer estado de carga en botón */
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

/* Formatear número con separadores de miles */
function formatNumber(num) {
    return new Intl.NumberFormat('es-AR').format(num);
}

/* Capitalizar primera letra de texto */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ============================================
   GESTIÓN DE TEMAS (CLARO/OSCURO)
   ============================================ */

/* Alternar entre tema claro y oscuro */
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    const themeIcon2 = document.querySelector('#themeToggle2 i');
    
    if (themeIcon) {
        themeIcon.style.transform = 'rotate(180deg) scale(0.8)';
        themeIcon.style.opacity = '0.5';
    }
    
    if (themeIcon2) {
        themeIcon2.style.transform = 'rotate(180deg) scale(0.8)';
        themeIcon2.style.opacity = '0.5';
    }
        
    setTimeout(() => {
        if (body.classList.contains('light-mode')) {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            
            if (themeIcon) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
            if (themeIcon2) {
                themeIcon2.classList.remove('fa-sun');
                themeIcon2.classList.add('fa-moon');
            }
            
            localStorage.setItem('theme', 'dark');
            updatePoweredByImage('dark');
            updateCoopTrackImages('dark');
            updateThemeColor(true);
            document.documentElement.style.scrollbarColor = 'var(--dark-gray) var(--black)';
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
            if (themeIcon2) {
                themeIcon2.classList.remove('fa-moon');
                themeIcon2.classList.add('fa-sun');
            }
            
            localStorage.setItem('theme', 'light');
            updatePoweredByImage('light');
            updateCoopTrackImages('light');
            updateThemeColor(false);
            document.documentElement.style.scrollbarColor = 'var(--gray) var(--bg-tertiary)';
        }
        
        if (themeIcon) {
            themeIcon.style.transform = 'rotate(0deg) scale(1.1)';
            themeIcon.style.opacity = '1';
            setTimeout(() => {
                themeIcon.style.transform = 'rotate(0deg) scale(1)';
            }, 150);
        }
        
        if (themeIcon2) {
            themeIcon2.style.transform = 'rotate(0deg) scale(1.1)';
            themeIcon2.style.opacity = '1';
            setTimeout(() => {
                themeIcon2.style.transform = 'rotate(0deg) scale(1)';
            }, 150);
        }
        
    }, 200);
}

/* Actualizar color de tema en meta tag para móviles */
function updateThemeColor(isDark) {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
        themeColorMeta.setAttribute('content', isDark ? '#1a1a1a' : '#ffffff');
    }
}

/* Actualizar imagen del logo según el tema */
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

/* Actualizar imágenes de CoopTrack según el tema */
function updateCoopTrackImages(theme) {
    const coopTrackImages = document.querySelectorAll('img[src*="cooptrack"], .auth-logo, .nav-logo-img, .hero-logo-img, .footer-logo-img, .header-logo');
    coopTrackImages.forEach(img => {
        /* Detectar si estamos en una subcarpeta */
        const isInSubfolder = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/user/');
        const basePath = isInSubfolder ? '../img/' : 'img/';
        
        if (theme === 'light') {
            img.src = basePath + 'cooptrack_blanco.png';
        } else {
            img.src = basePath + 'cooptrack.png';
        }
    });
}

/* Cargar tema guardado al inicializar */
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    const themeIcon2 = document.querySelector('#themeToggle2 i');
    
    if (savedTheme === 'light') {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
        if (themeIcon2) {
            themeIcon2.classList.remove('fa-moon');
            themeIcon2.classList.add('fa-sun');
        }
        updatePoweredByImage('light');
        updateCoopTrackImages('light');
        updateThemeColor(false);
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        if (themeIcon2) {
            themeIcon2.classList.remove('fa-sun');
            themeIcon2.classList.add('fa-moon');
        }
        updatePoweredByImage('dark');
        updateCoopTrackImages('dark');
        updateThemeColor(true);
    }
}

/* ============================================
   INICIALIZACIÓN DE TEMA
   ============================================ */

/* Inicializar funcionalidad del tema al cargar la página */
document.addEventListener('DOMContentLoaded', function() {
    /* Cargar tema guardado */
    loadSavedTheme();
    
    /* Configurar evento del botón principal */
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            toggleTheme();
        });
    }
    
    /* Soporte para segundo botón de tema */
    const themeToggle2 = document.getElementById('themeToggle2');
    if (themeToggle2) {
        themeToggle2.addEventListener('click', function() {
            toggleTheme();
        });
    }
});

/* ============================================
   MENÚ HAMBURGUESA Y NAVEGACIÓN
   ============================================ */

/* Configuración del menú móvil */
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('navToggle');

    const sidebar = document.querySelector('.sidebar');
    const body = document.body;

    /* Alternar estado del menú */
    function toggleMenu() {
        navToggle.classList.toggle('active');
        sidebar.classList.toggle('active');
        
        /* Bloquear/desbloquear scroll del body */
        if (sidebar.classList.contains('active')) {
            body.classList.add('menu-open', 'menu-active');
            document.documentElement.style.overflow = 'hidden';
        } else {
            body.classList.remove('menu-open', 'menu-active');
            document.documentElement.style.overflow = '';
        }
    }

    /* Evento del botón hamburguesa */
    navToggle.addEventListener('click', toggleMenu);

    /* Cerrar menú al hacer clic en un enlace */
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            sidebar.classList.remove('active');
            body.classList.remove('menu-open', 'menu-active');
            document.documentElement.style.overflow = '';
        });
    });

    /* Cerrar menú al hacer clic fuera (solo en desktop) */
    document.addEventListener('click', function(e) {
        if (window.innerWidth > 768 && 
            !navToggle.contains(e.target) && 
            !sidebar.contains(e.target) &&
            sidebar.classList.contains('active')) {
            toggleMenu();
        }
    });

    /* Manejar cambio de tamaño de ventana */
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            /* Resetear estado en pantallas grandes */
            navToggle.classList.remove('active');
            sidebar.classList.remove('active');
            body.classList.remove('menu-open', 'menu-active');
            document.documentElement.style.overflow = '';
        }
    });

    /* Prevenir scroll cuando el menú está abierto en móviles */
    document.addEventListener('touchmove', function(e) {
        if (body.classList.contains('menu-open')) {
            e.preventDefault();
        }
    }, { passive: false });
});

