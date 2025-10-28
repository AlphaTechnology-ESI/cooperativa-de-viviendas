let sociosData = [];
let socioSeleccionado = null;

// Cargar socios al inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    loadSocios();
    configurarFiltros();
});

// Función para cargar socios
async function loadSocios() {
    try {
        const buscar = document.getElementById('filtro-buscar').value.trim();
        const estadoCivil = document.getElementById('filtro-estado-civil').value;
        const ingresos = document.getElementById('filtro-ingresos').value;
        
        // Construir URL con parámetros
        const params = new URLSearchParams();
        if (buscar) params.append('buscar', buscar);
        if (estadoCivil) params.append('estado_civil', estadoCivil);
        if (ingresos) params.append('ingresos', ingresos);
        
        const url = `http://localhost/cooperativa-de-viviendas-apis/endpoint/dashboard/admin/listar_socios.php?${params.toString()}`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.estado === "ok") {
            sociosData = result.socios;
            displaySociosWithIndicator(sociosData);
        } else {
            console.error('Error al cargar socios:', result.mensaje);
            document.getElementById('socios-tbody').innerHTML = `
                <tr>
                    <td colspan="9" class="text-center error">Error al cargar socios: ${result.mensaje}</td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error al cargar socios:', error);
        document.getElementById('socios-tbody').innerHTML = `
            <tr>
                <td colspan="9" class="text-center error">Error de conexión</td>
            </tr>
        `;
    }
}

// Función para renderizar la tabla de socios
function renderSociosTable(socios) {
    displaySociosWithIndicator(socios);
}

function displaySocios(socios) {
    const tbody = document.getElementById('socios-tbody');
    
    if (socios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">No se encontraron socios</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = socios.map(socio => `
        <tr>
            <td>${socio.id_usuario}</td>
            <td class="tooltip" data-tooltip="${socio.nom_usu}">${truncateText(socio.nom_usu, 20)}</td>
            <td>${socio.cedula}</td>
            <td class="tooltip" data-tooltip="${socio.correo}">${truncateText(socio.correo, 25)}</td>
            <td>${socio.telefono || 'N/A'}</td>
            <td><span class="estado-civil-badge ${socio.estado_civil}">${formatEstadoCivil(socio.estado_civil)}</span></td>
            <td class="tooltip" data-tooltip="${socio.ocupacion || 'N/A'}">${truncateText(socio.ocupacion || 'N/A', 25)}</td>
            <td><span class="ingresos-badge ${socio.ingresos}">${formatIngresos(socio.ingresos)}</span></td>
            <td>
                <button class="btn btn-small btn-primary" onclick="verSocio(${socio.id_usuario})">Ver</button>
            </td>
        </tr>
    `).join('');
}

// Función para ver detalles del socio
async function verSocio(idUsuario) {
    const socio = sociosData.find(s => s.id_usuario == idUsuario);
    
    if (!socio) {
        console.error('Socio no encontrado');
        return;
    }
    
    // Guardar referencia del socio seleccionado
    socioSeleccionado = socio;
    
    const modalBody = document.getElementById('modal-socio-body');
    
    modalBody.innerHTML = `
        <div class="socio-detalle">
            <div class="detalle-row">
                <div class="detalle-item">
                    <strong>ID:</strong>
                    <span>${socio.id_usuario}</span>
                </div>
                <div class="detalle-item">
                    <strong>Nombre Completo:</strong>
                    <span>${socio.nom_usu}</span>
                </div>
            </div>
            
            <div class="detalle-row">
                <div class="detalle-item">
                    <strong>Cédula:</strong>
                    <span>${socio.cedula}</span>
                </div>
                <div class="detalle-item">
                    <strong>Correo:</strong>
                    <span>${socio.correo}</span>
                </div>
            </div>
            
            <div class="detalle-row">
                <div class="detalle-item">
                    <strong>Teléfono:</strong>
                    <span>${socio.telefono || 'No registrado'}</span>
                </div>
                <div class="detalle-item">
                    <strong>Fecha de Nacimiento:</strong>
                    <span>${socio.fecha_nacimiento ? formatDate(socio.fecha_nacimiento) : 'No registrada'}</span>
                </div>
            </div>
            
            <div class="detalle-row">
                <div class="detalle-item">
                    <strong>Estado Civil:</strong>
                    <span class="estado-civil-badge ${socio.estado_civil}">${formatEstadoCivil(socio.estado_civil)}</span>
                </div>
                <div class="detalle-item">
                    <strong>Ocupación:</strong>
                    <span>${socio.ocupacion || 'No registrada'}</span>
                </div>
            </div>
            
            <div class="detalle-row">
                <div class="detalle-item full-width">
                    <strong>Nivel de Ingresos:</strong>
                    <span class="ingresos-badge ${socio.ingresos}">${formatIngresos(socio.ingresos)}</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal-socio').style.display = 'flex';
}

// Función para configurar los filtros
function configurarFiltros() {
    // Filtro de búsqueda en tiempo real
    document.getElementById('filtro-buscar').addEventListener('input', debounce(loadSocios, 300));
    
    // Filtros de select
    document.getElementById('filtro-estado-civil').addEventListener('change', loadSocios);
    document.getElementById('filtro-ingresos').addEventListener('change', loadSocios);
}

// Funciones de formateo
function formatEstadoCivil(estadoCivil) {
    const estados = {
        'soltero': 'Soltero/a',
        'casado': 'Casado/a',
        'divorciado': 'Divorciado/a',
        'viudo': 'Viudo/a',
        'union_convivencial': 'Unión Convivencial'
    };
    return estados[estadoCivil] || estadoCivil;
}

function formatIngresos(ingresos) {
    const rangos = {
        'hasta_500000': 'Hasta $500.000',
        '500000_1000000': '$500.000 - $1.000.000',
        '1000000_1500000': '$1.000.000 - $1.500.000',
        '1500000_2000000': '$1.500.000 - $2.000.000',
        'mas_2000000': 'Más de $2.000.000'
    };
    return rangos[ingresos] || ingresos || 'No registrado';
}

function formatDate(dateString) {
    if (!dateString) return 'No registrada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Función para cerrar modal
function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    
    // Limpiar referencia del socio seleccionado cuando se cierre el modal de socio
    if (modalId === 'modal-socio') {
        socioSeleccionado = null;
        
        // Rehabilitar botón de eliminar si estaba deshabilitado
        const btnEliminar = document.getElementById('btn-eliminar-socio');
        if (btnEliminar) {
            btnEliminar.disabled = false;
            btnEliminar.textContent = 'Eliminar Usuario';
        }
    }
}

// Función debounce para optimizar búsquedas
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

// Función para truncar texto largo
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Función para mostrar indicador de scroll horizontal si es necesario
function checkScrollIndicator() {
    const tableContainer = document.querySelector('.table-container');
    const table = document.getElementById('socios-table');
    
    if (tableContainer && table) {
        const hasHorizontalScroll = table.scrollWidth > tableContainer.clientWidth;
        
        // Remover indicador existente
        const existingIndicator = document.querySelector('.table-scroll-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
    }
}

// Llamar al indicador después de cargar los datos
function displaySociosWithIndicator(socios) {
    displaySocios(socios);
    // Usar setTimeout para asegurar que el DOM se haya actualizado
    setTimeout(checkScrollIndicator, 100);
}

// Cerrar modal al hacer clic fuera de él
document.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            const modalId = modal.getAttribute('id');
            cerrarModal(modalId);
        }
    });
});

// Función para eliminar socio
async function eliminarSocio() {
    if (!socioSeleccionado) {
        alert('No hay socio seleccionado');
        return;
    }
    
    // Confirmación de eliminación
    const confirmacion = confirm(
        `¿Estás seguro de que deseas eliminar al usuario "${socioSeleccionado.nom_usu}"?\n\n` +
        `Esta acción eliminará:\n` +
        `- El usuario y toda su información personal\n` +
        `- Sus horas trabajadas registradas\n` +
        `- Sus solicitudes realizadas\n\n` +
        `Esta acción NO se puede deshacer.`
    );
    
    if (!confirmacion) {
        return;
    }
    
    try {
        // Deshabilitar botón mientras se procesa
        const btnEliminar = document.getElementById('btn-eliminar-socio');
        btnEliminar.disabled = true;
        btnEliminar.textContent = 'Eliminando...';
        
        const response = await fetch('http://localhost/cooperativa-de-viviendas-apis/endpoint/dashboard/admin/eliminar_socio.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario: socioSeleccionado.id_usuario
            })
        });
        
        const result = await response.json();
        
        if (result.estado === 'ok') {
            // Mostrar mensaje de éxito
            alert(`Usuario "${result.usuario_eliminado.nombre}" eliminado exitosamente`);
            
            // Cerrar modal
            cerrarModal('modal-socio');
            
            // Recargar la lista de socios
            await loadSocios();
            
            // Limpiar referencia del socio seleccionado
            socioSeleccionado = null;
            
        } else {
            throw new Error(result.mensaje || 'Error desconocido al eliminar usuario');
        }
        
    } catch (error) {
        console.error('Error al eliminar socio:', error);
        alert('Error al eliminar usuario: ' + error.message);
        
        // Rehabilitar botón
        const btnEliminar = document.getElementById('btn-eliminar-socio');
        btnEliminar.disabled = false;
        btnEliminar.textContent = 'Eliminar Usuario';
    }
}
