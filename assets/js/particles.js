// Sistema de partículas dinámico y texto infinito
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.particleContainer = null;
        this.maxParticles = 10;
        this.backgroundTextWords = [
            'COOPTRACK', 'COOVISUR', 'CONTROLÁ TU HOGAR', 
            'GESTIÓN INTELIGENTE', 'COOPERATIVA DE VIVIENDA'
        ];
        this.init();
    }

    init() {
        this.createContainers();
        this.generateInfiniteText();
        this.createParticles();
        this.animate();
        this.handleResize();
        
        setTimeout(() => {
            this.verifyTextGeneration();
        }, 1000);
    }
    
    verifyTextGeneration() {
        const backgroundTextElement = document.getElementById('backgroundText');
        if (!backgroundTextElement || !backgroundTextElement.textContent.trim()) {
            this.generateInfiniteText();
        }
    }

    createContainers() {
        this.particleContainer = document.createElement('div');
        this.particleContainer.className = 'particles-container';
        this.particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;
        document.body.appendChild(this.particleContainer);
    }

    generateInfiniteText() {
        const backgroundTextElement = document.getElementById('backgroundText');
        if (!backgroundTextElement) {
            setTimeout(() => this.generateInfiniteText(), 100);
            return;
        }

        let textContent = '';
        const repetitions = 100;
        
        for (let i = 0; i < repetitions; i++) {
            const wordIndex = i % this.backgroundTextWords.length;
            textContent += this.backgroundTextWords[wordIndex] + '   •   ';
        }
        
        backgroundTextElement.textContent = textContent;
    }

    createParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'dynamic-particle';
        
        const size = Math.random() * 4 + 3;
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        const speedX = (Math.random() - 0.5) * 1.2;
        const speedY = (Math.random() - 0.5) * 1.2;
        const opacity = Math.random() * 0.4 + 0.3;
        const lifespan = Math.random() * 15000 + 10000;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(74, 144, 226, ${opacity});
            border-radius: 50%;
            left: ${startX}px;
            top: ${startY}px;
            transition: all 0.1s linear;
            box-shadow: 0 0 ${size * 2}px rgba(74, 144, 226, ${opacity * 0.6});
            opacity: 0;
        `;

        particle.dataset.speedX = speedX;
        particle.dataset.speedY = speedY;
        particle.dataset.maxOpacity = opacity;
        particle.dataset.birthTime = Date.now();
        particle.dataset.lifespan = lifespan;

        setTimeout(() => {
            particle.style.opacity = opacity;
            particle.style.transition = 'all 0.1s linear, opacity 2s ease-in-out';
        }, 100);

        this.particleContainer.appendChild(particle);
        this.particles.push(particle);
        setTimeout(() => {
            this.removeParticle(particle);
        }, lifespan);
    }

    removeParticle(particle) {
        if (particle && particle.parentNode) {
            particle.style.opacity = '0';
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
                const index = this.particles.indexOf(particle);
                if (index > -1) {
                    this.particles.splice(index, 1);
                }
                this.createParticle();
            }, 2000);
        }
    }



    animate() {
        this.particles.forEach((particle) => {
            const rect = particle.getBoundingClientRect();
            const speedX = parseFloat(particle.dataset.speedX);
            const speedY = parseFloat(particle.dataset.speedY);
            
            let newX = rect.left + speedX;
            let newY = rect.top + speedY;

            if (newX <= 0 || newX >= window.innerWidth) {
                particle.dataset.speedX = -speedX;
                newX = rect.left - speedX;
            }
            if (newY <= 0 || newY >= window.innerHeight) {
                particle.dataset.speedY = -speedY;
                newY = rect.top - speedY;
            }

            particle.style.left = newX + 'px';
            particle.style.top = newY + 'px';
        });

        requestAnimationFrame(() => this.animate());
    }

    handleResize() {
        window.addEventListener('resize', () => {
            this.particles.forEach(particle => {
                const rect = particle.getBoundingClientRect();
                if (rect.left > window.innerWidth || rect.top > window.innerHeight) {
                    particle.style.left = Math.random() * window.innerWidth + 'px';
                    particle.style.top = Math.random() * window.innerHeight + 'px';
                }
            });
        });
    }


}

// Inicialización del sistema
function initializeParticleSystem() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeParticleSystem);
        return;
    }
    
    setTimeout(() => {
        new ParticleSystem();
    }, 50);
}
initializeParticleSystem();
