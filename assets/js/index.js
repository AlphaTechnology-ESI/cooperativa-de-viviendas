/* ============================================
   PÁGINA DE INICIO - INDEX
   ============================================ */

/* Inicialización de la página */
document.addEventListener('DOMContentLoaded', function() {
    initializeIndex();
});

/* ============================================
   CONFIGURACIÓN INICIAL
   ============================================ */

function initializeIndex() {
    setupNavigation();
    setupFilters();
    setupForms();
    setupAnimations();
}

/* ============================================
   CONFIGURACIÓN DE NAVEGACIÓN
   ============================================ */

function setupNavigation() {
    /* Menú móvil - Botón hamburguesa */
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            /* Efecto de animación en el botón */
            navToggle.style.animation = 'none';
            navToggle.offsetHeight; /* Forzar reflow */
            navToggle.style.animation = 'menuButtonClick 0.3s ease-out';
        });
    }

    /* Cerrar menú al hacer clic en un enlace */
    const navLinksItems = navLinks.querySelectorAll('.nav-link');
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    /* Cerrar menú al hacer clic fuera */
    document.addEventListener('click', function(event) {
        if (!navToggle.contains(event.target) && !navLinks.contains(event.target)) {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });

    /* Desplazamiento suave a secciones */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* Efecto de scroll en el encabezado */
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });
}

/* ============================================
   CONFIGURACIÓN DE FILTROS
   ============================================ */

function setupFilters() {
    const filterSelects = document.querySelectorAll('.filter-select');
    const housingCards = document.querySelectorAll('.housing-card');

    filterSelects.forEach(select => {
        select.addEventListener('change', () => {
            const filters = {
                tipo: document.getElementById('tipo-vivienda')?.value || '',
                estado: document.getElementById('estado-construccion')?.value || '',
                habitaciones: document.getElementById('habitaciones')?.value || '',
                barrio: document.getElementById('barrio')?.value || ''
            };

            housingCards.forEach(card => {
                let show = true;

                if (filters.tipo && card.dataset.tipo !== filters.tipo) show = false;
                if (filters.estado && card.dataset.estado !== filters.estado) show = false;
                if (filters.barrio && card.dataset.barrio !== filters.barrio) show = false;
                
                if (filters.habitaciones) {
                    const cardHab = parseInt(card.dataset.habitaciones);
                    const filterHab = filters.habitaciones.replace('+', '');
                    
                    if (filters.habitaciones.includes('+')) {
                        if (cardHab < parseInt(filterHab)) show = false;
                    } else {
                        if (cardHab !== parseInt(filterHab)) show = false;
                    }
                }

                card.style.display = show ? 'block' : 'none';
            });
        });
    });
}

/* ============================================
   CONFIGURACIÓN DE ANIMACIONES
   ============================================ */

function setupAnimations() {
    /* Intersection Observer para animaciones */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.stat-item, .about-card, .service-card').forEach(el => {
        observer.observe(el);
    });

    /* Animación de barras de progreso */
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const width = progressBar.style.width;
                progressBar.style.width = '0%';
                setTimeout(() => {
                    progressBar.style.width = width;
                }, 200);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.progress-fill').forEach(bar => {
        progressObserver.observe(bar);
    });
}

/* ============================================
   ESTILOS Y ANIMACIONES CSS
   ============================================ */

/* Agregar animación CSS para el botón del menú */
const style = document.createElement('style');
style.textContent = `
    @keyframes menuButtonClick {
        0% { transform: scale(1); }
        50% { transform: scale(1.15) rotate(180deg); }
        100% { transform: scale(1) rotate(180deg); }
    }
`;
document.head.appendChild(style);
