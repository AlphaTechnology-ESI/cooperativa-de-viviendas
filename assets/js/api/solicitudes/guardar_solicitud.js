/* ============================================
   GUARDAR SOLICITUD DE VIVIENDA
   ============================================ */

/* ============================================
   FUNCIONES DE VALIDACIÓN
   ============================================ */

/* Validar cédula uruguaya (formato: 1.234.567-8) */
function validarCedulaUruguaya(cedula) {
    // Remover puntos y guiones
    const cedulaLimpia = cedula.replace(/[.\-]/g, '');
    
    // Debe tener entre 7 y 8 dígitos (incluyendo el verificador)
    if (!/^\d{7,8}$/.test(cedulaLimpia)) {
        return false;
    }
    
    // Algoritmo de validación de cédula uruguaya
    const digitoVerificador = parseInt(cedulaLimpia.charAt(cedulaLimpia.length - 1));
    const numero = cedulaLimpia.substring(0, cedulaLimpia.length - 1);
    
    // Rellenar con ceros a la izquierda si es necesario (hasta 7 dígitos)
    const numeroPadded = numero.padStart(7, '0');
    
    const multiplicadores = [2, 9, 8, 7, 6, 3, 4];
    let suma = 0;
    
    for (let i = 0; i < 7; i++) {
        suma += parseInt(numeroPadded.charAt(i)) * multiplicadores[i];
    }
    
    const resto = suma % 10;
    const digitoCalculado = resto === 0 ? 0 : 10 - resto;
    
    return digitoCalculado === digitoVerificador;
}

/* Validar teléfono uruguayo (9 dígitos) */
function validarTelefonoUruguayo(telefono) {
    // Remover espacios, guiones y paréntesis
    const telefonoLimpio = telefono.replace(/[\s\-()]/g, '');
    
    // Debe tener exactamente 9 dígitos y empezar con 09
    return /^09\d{7}$/.test(telefonoLimpio);
}

/* Validar fecha de nacimiento (mayor de 18 años) */
function validarEdadMinima(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    
    return edad >= 18;
}

/* Validar email */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/* Validar que solo contenga letras y espacios */
function validarSoloLetras(texto) {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(texto);
}

/* Mostrar mensaje de error en el campo */
function mostrarError(inputId, mensaje) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    // Remover error previo si existe
    const errorPrevio = input.parentElement.querySelector('.error-message');
    if (errorPrevio) {
        errorPrevio.remove();
    }
    
    // Agregar clase de error
    input.classList.add('input-error');
    
    // Crear mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'color: var(--error-color); font-size: 12px; margin-top: 5px;';
    errorDiv.textContent = mensaje;
    
    input.parentElement.appendChild(errorDiv);
    
    // Hacer scroll al primer error
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* Limpiar errores de un campo */
function limpiarError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    input.classList.remove('input-error');
    const errorMsg = input.parentElement.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

/* Formatear cédula mientras se escribe */
function formatearCedula(input) {
    let valor = input.value.replace(/[^\d]/g, '');
    
    if (valor.length > 7) {
        valor = valor.substring(0, 7) + '-' + valor.substring(7, 8);
    }
    
    if (valor.length > 3) {
        valor = valor.substring(0, 1) + '.' + valor.substring(1, 4) + '.' + valor.substring(4);
    }
    
    input.value = valor.substring(0, 12);
}

/* Formatear teléfono mientras se escribe */
function formatearTelefono(input) {
    let valor = input.value.replace(/[^\d]/g, '');
    
    if (valor.length > 3) {
        valor = valor.substring(0, 3) + ' ' + valor.substring(3, 6) + ' ' + valor.substring(6, 9);
    }
    
    input.value = valor.trim().substring(0, 11);
}

/* ============================================
   MANEJO DEL FORMULARIO
   ============================================ */

/* Manejo del formulario de solicitud */
document.getElementById("housing-request-form").addEventListener("submit", async function(e) {
    e.preventDefault();

    const form = e.target;
    let hayErrores = false;
    
    // Limpiar todos los errores previos
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.classList.remove('input-error');
        const errorMsg = input.parentElement.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    });
    
    // Obtener valores del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const fechaNacimiento = document.getElementById('fecha_nacimiento').value;
    const ocupacion = document.getElementById('ocupacion').value.trim();
    
    // Validar nombre (solo letras y espacios)
    if (!validarSoloLetras(nombre)) {
        mostrarError('nombre', 'El nombre solo debe contener letras');
        hayErrores = true;
    }
    
    // Validar cédula uruguaya
    if (!validarCedulaUruguaya(dni)) {
        mostrarError('dni', 'Cédula uruguaya inválida. Formato: 1.234.567-8');
        hayErrores = true;
    }
    
    // Validar email
    if (!validarEmail(email)) {
        mostrarError('email', 'Email inválido');
        hayErrores = true;
    }
    
    // Validar teléfono uruguayo
    if (!validarTelefonoUruguayo(telefono)) {
        mostrarError('telefono', 'Teléfono inválido. Debe tener 9 dígitos y empezar con 09');
        hayErrores = true;
    }
    
    // Validar fecha de nacimiento (mayor de 18 años)
    if (!fechaNacimiento) {
        mostrarError('fecha_nacimiento', 'Debe ingresar su fecha de nacimiento');
        hayErrores = true;
    } else if (!validarEdadMinima(fechaNacimiento)) {
        mostrarError('fecha_nacimiento', 'Debe ser mayor de 18 años');
        hayErrores = true;
    }
    
    // Validar ocupación (solo letras y espacios)
    if (!validarSoloLetras(ocupacion)) {
        mostrarError('ocupacion', 'La ocupación solo debe contener letras');
        hayErrores = true;
    }
    
    // Si hay errores, detener el envío
    if (hayErrores) {
        showToast('Por favor corrija los errores en el formulario', 'error');
        return;
    }

    // Deshabilitar botón de envío
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Limpiar cédula y teléfono antes de enviar (solo números)
    data.dni = data.dni.replace(/[.\-\s]/g, '');
    data.telefono = data.telefono.replace(/[\s\-()]/g, '');

    try {
        const response = await fetch(`${API_URL}/endpoint/solicitudes/guardar_solicitud.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const responseText = await response.text();
        const result = JSON.parse(responseText);

        if (result.estado === "ok") {
            showToast("¡Solicitud enviada correctamente! Nos pondremos en contacto pronto.", "success");
            form.reset();
        } else {
            showToast("Error: " + result.mensaje, "error");
        }
        
        // Reactivar botón
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        
    } catch (error) {
        showToast("Error al conectar con el servidor. Intente nuevamente.", "error");
        
        // Reactivar botón
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
});

/* ============================================
   EVENTOS DE FORMATEO EN TIEMPO REAL
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Formatear cédula en tiempo real
    const dniInput = document.getElementById('dni');
    if (dniInput) {
        dniInput.addEventListener('input', function() {
            formatearCedula(this);
            limpiarError('dni');
        });
    }
    
    // Formatear teléfono en tiempo real
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function() {
            formatearTelefono(this);
            limpiarError('telefono');
        });
    }
    
    // Limpiar errores al escribir en otros campos
    const camposValidar = ['nombre', 'email', 'fecha_nacimiento', 'ocupacion'];
    camposValidar.forEach(campo => {
        const input = document.getElementById(campo);
        if (input) {
            input.addEventListener('input', function() {
                limpiarError(campo);
            });
        }
    });
});