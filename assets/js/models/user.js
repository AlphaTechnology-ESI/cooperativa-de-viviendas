// Modelo de usuario
class User {
    constructor(data = {}) {
        this.id = data.id || null;
        this.nombre = data.nombre || '';
        this.cedula = data.cedula || '';
        this.email = data.email || '';
        this.telefono = data.telefono || '';
        this.direccion = data.direccion || '';
        this.tipoSocio = data.tipoSocio || '';
        this.ingresos = data.ingresos || '';
        this.motivacion = data.motivacion || '';
        this.estado = data.estado || 'pendiente';
        this.fechaRegistro = data.fechaRegistro || new Date().toISOString();
        this.fechaIngreso = data.fechaIngreso || null;
        this.terminos = data.terminos || false;
        this.newsletter = data.newsletter || false;
    }

    // Validación
    validate() {
        const errors = [];

        if (!this.nombre || this.nombre.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        if (!this.cedula || this.cedula.trim().length < 6) {
            errors.push('La cédula debe tener al menos 6 caracteres');
        }

        if (!this.email || !this.isValidEmail(this.email)) {
            errors.push('El email no es válido');
        }

        if (!this.telefono || this.telefono.trim().length < 8) {
            errors.push('El teléfono debe tener al menos 8 caracteres');
        }

        if (!this.direccion || this.direccion.trim().length < 10) {
            errors.push('La dirección debe tener al menos 10 caracteres');
        }

        if (!this.tipoSocio) {
            errors.push('Debe seleccionar un tipo de socio');
        }

        if (!this.ingresos) {
            errors.push('Debe seleccionar un rango de ingresos');
        }

        if (!this.terminos) {
            errors.push('Debe aceptar los términos y condiciones');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    isValidCedula(cedula) {
        const cleanCedula = cedula.replace(/[\s-]/g, '');
        return /^\d{6,12}$/.test(cleanCedula);
    }
    isValidPhone(phone) {
        const cleanPhone = phone.replace(/[\s\-$$$$]/g, '');
        return /^\d{8,15}$/.test(cleanPhone);
    }

    // Serialización
    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre.trim(),
            cedula: this.cedula.trim(),
            email: this.email.trim().toLowerCase(),
            telefono: this.telefono.trim(),
            direccion: this.direccion.trim(),
            tipoSocio: this.tipoSocio,
            ingresos: this.ingresos,
            motivacion: this.motivacion.trim(),
            estado: this.estado,
            fechaRegistro: this.fechaRegistro,
            fechaIngreso: this.fechaIngreso,
            terminos: this.terminos,
            newsletter: this.newsletter
        };
    }

    // Métodos estáticos
    static fromFormData(formData) {
        const data = {};
        
        if (formData instanceof FormData) {
            for (let [key, value] of formData.entries()) {
                if (key === 'terminos' || key === 'newsletter') {
                    data[key] = value === 'on' || value === true;
                } else {
                    data[key] = value;
                }
            }
        } else {
            Object.assign(data, formData);
        }

        return new User(data);
    }
    static fromAPIResponse(apiData) {
        return new User(apiData);
    }

    // Métodos de presentación
    getTipoSocioLabel() {
        const tipos = {
            'fundador': 'Socio Fundador',
            'activo': 'Socio Activo',
            'colaborador': 'Socio Colaborador'
        };
        return tipos[this.tipoSocio] || this.tipoSocio;
    }
    getIngresosLabel() {
        const rangos = {
            'menos-500': 'Menos de $500',
            '500-1000': '$500 - $1,000',
            '1000-2000': '$1,000 - $2,000',
            '2000-mas': 'Más de $2,000'
        };
        return rangos[this.ingresos] || this.ingresos;
    }
    getEstadoLabel() {
        const estados = {
            'pendiente': 'Pendiente de Aprobación',
            'aprobado': 'Aprobado',
            'activo': 'Activo',
            'suspendido': 'Suspendido',
            'rechazado': 'Rechazado'
        };
        return estados[this.estado] || this.estado;
    }
    getEstadoColor() {
        const colores = {
            'pendiente': '#ffc107',
            'aprobado': '#28a745',
            'activo': '#17a2b8',
            'suspendido': '#dc3545',
            'rechazado': '#6c757d'
        };
        return colores[this.estado] || '#6c757d';
    }

    // Control de acceso
    canAccessDashboard() {
        return ['aprobado', 'activo'].includes(this.estado);
    }
    getInitials() {
        const names = this.nombre.trim().split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return names[0] ? names[0][0].toUpperCase() : '?';
    }
    getFormattedRegistrationDate() {
        if (!this.fechaRegistro) return '';
        
        const date = new Date(this.fechaRegistro);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    getFormattedJoinDate() {
        if (!this.fechaIngreso) return 'No definida';
        
        const date = new Date(this.fechaIngreso);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Métodos de manipulación
    update(newData) {
        Object.keys(newData).forEach(key => {
            if (this.hasOwnProperty(key)) {
                this[key] = newData[key];
            }
        });
    }
    getSafeData() {
        const safeData = { ...this.toJSON() };
        return safeData;
    }
}

// Exportación
if (typeof module !== 'undefined' && module.exports) {
    module.exports = User;
}
