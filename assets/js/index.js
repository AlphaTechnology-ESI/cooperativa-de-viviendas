// JavaScript para index.html
document.addEventListener('DOMContentLoaded', function() {
    initializeIndex();
});

function initializeIndex() {
    setupNavigation();
    setupFilters();
    setupForms();
    setupAnimations();
}

function setupNavigation() {
    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Header scroll effect
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

function setupForms() {
    const form = document.getElementById('housing-request-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const btn = this.querySelector('button[type="submit"]');
            btn.classList.add('loading');
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await api.createSolicitud(data);
                
                if (response.success) {
                    showToast('¡Solicitud enviada exitosamente! Te contactaremos pronto.', 'success');
                    this.reset();
                } else {
                    showToast(response.message || 'Error al enviar la solicitud', 'error');
                }
            } catch (error) {
                showToast('Error de conexión. Inténtalo nuevamente.', 'error');
            } finally {
                btn.classList.remove('loading');
            }
        });
    }
}

function setupAnimations() {
    // Intersection Observer para animaciones
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

    // Progress bars
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
