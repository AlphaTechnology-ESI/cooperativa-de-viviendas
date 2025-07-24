// User Model - Maneja los datos del usuario
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

    // Validar datos del usuario
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

    // Validar email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validar cédula (formato básico)
    isValidCedula(cedula) {
        // Remover espacios y guiones
        const cleanCedula = cedula.replace(/[\s-]/g, '');
        // Verificar que solo contenga números y tenga entre 6 y 12 dígitos
        return /^\d{6,12}$/.test(cleanCedula);
    }

    // Validar teléfono
    isValidPhone(phone) {
        // Remover espacios, guiones y paréntesis
        const cleanPhone = phone.replace(/[\s\-$$$$]/g, '');
        // Verificar que tenga entre 8 y 15 dígitos
        return /^\d{8,15}$/.test(cleanPhone);
    }

    // Convertir a objeto para envío a API
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

    // Crear usuario desde datos de formulario
    static fromFormData(formData) {
        const data = {};
        
        // Extraer datos del FormData o objeto
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

    // Crear usuario desde respuesta de API
    static fromAPIResponse(apiData) {
        return new User(apiData);
    }

    // Obtener nombre de tipo de socio
    getTipoSocioLabel() {
        const tipos = {
            'fundador': 'Socio Fundador',
            'activo': 'Socio Activo',
            'colaborador': 'Socio Colaborador'
        };
        return tipos[this.tipoSocio] || this.tipoSocio;
    }

    // Obtener etiqueta de rango de ingresos
    getIngresosLabel() {
        const rangos = {
            'menos-500': 'Menos de $500',
            '500-1000': '$500 - $1,000',
            '1000-2000': '$1,000 - $2,000',
            '2000-mas': 'Más de $2,000'
        };
        return rangos[this.ingresos] || this.ingresos;
    }

    // Obtener estado con formato
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

    // Obtener color del estado
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

    // Verificar si el usuario puede acceder al dashboard
    canAccessDashboard() {
        return ['aprobado', 'activo'].includes(this.estado);
    }

    // Obtener iniciales para avatar
    getInitials() {
        const names = this.nombre.trim().split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return names[0] ? names[0][0].toUpperCase() : '?';
    }

    // Formatear fecha de registro
    getFormattedRegistrationDate() {
        if (!this.fechaRegistro) return '';
        
        const date = new Date(this.fechaRegistro);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Formatear fecha de ingreso
    getFormattedJoinDate() {
        if (!this.fechaIngreso) return 'No definida';
        
        const date = new Date(this.fechaIngreso);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Actualizar datos del usuario
    update(newData) {
        Object.keys(newData).forEach(key => {
            if (this.hasOwnProperty(key)) {
                this[key] = newData[key];
            }
        });
    }

    // Limpiar datos sensibles para almacenamiento local
    getSafeData() {
        const safeData = { ...this.toJSON() };
        // Remover datos sensibles si es necesario
        return safeData;
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = User;
}
