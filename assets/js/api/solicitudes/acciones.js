/* ============================================
   ACCIONES SOBRE SOLICITUDES
   ============================================ */

/* ============================================
   APROBAR SOLICITUD
   ============================================ */

/* Aprobar una solicitud de vivienda */
async function aprobarSolicitud() {
    if (!solicitudActual) return;

    const idUsuario = solicitudActual.id_usuario;
    
    const btnAprobar = document.querySelector('#modal-solicitud .btn-success');
    const btnRevision = document.querySelector('#modal-solicitud .btn-warning');
    const btnRechazar = document.querySelector('#modal-solicitud .btn-error');
    
    btnAprobar.disabled = true;
    btnRevision.disabled = true;
    btnRechazar.disabled = true;
    btnAprobar.textContent = 'Aprobando...';

    try {
        const response = await fetch(`${API_URL}/endpoint/solicitudes/acciones/aprobar_solicitudes.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_usuario: idUsuario })
        });

        const result = await response.json();

        if (result.estado === "ok") {
            showToast("Solicitud aprobada correctamente", "success");
            cerrarModal('modal-solicitud');
            loadSolicitudes();
        } else {
            showToast("Error: " + result.mensaje, "error");
            btnAprobar.disabled = false;
            btnRevision.disabled = false;
            btnRechazar.disabled = false;
            btnAprobar.textContent = 'Aprobar';
        }
    } catch (error) {
        showToast("Error al conectar con el servidor", "error");
        btnAprobar.disabled = false;
        btnRevision.disabled = false;
        btnRechazar.disabled = false;
        btnAprobar.textContent = 'Aprobar';
    }
}

/* ============================================
   RECHAZAR SOLICITUD
   ============================================ */

/* Rechazar una solicitud de vivienda */
async function rechazarSolicitud() {
    if (!solicitudActual) return;

    const idUsuario = solicitudActual.id_usuario;
    
    const btnAprobar = document.querySelector('#modal-solicitud .btn-success');
    const btnRevision = document.querySelector('#modal-solicitud .btn-warning');
    const btnRechazar = document.querySelector('#modal-solicitud .btn-error');
    
    btnAprobar.disabled = true;
    btnRevision.disabled = true;
    btnRechazar.disabled = true;
    btnRechazar.textContent = 'Rechazando...';

    try {
        const response = await fetch(`${API_URL}/endpoint/solicitudes/acciones/rechazar_solicitudes.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_usuario: idUsuario })
        });

        const result = await response.json();

        if (result.estado === "ok") {
            showToast("Solicitud rechazada correctamente", "success");
            cerrarModal('modal-solicitud');
            loadSolicitudes();
        }
        else {
            showToast("Error: " + result.mensaje, "error");
            btnAprobar.disabled = false;
            btnRevision.disabled = false;
            btnRechazar.disabled = false;
            btnRechazar.textContent = 'Rechazar';
        }
    } catch (error) {
        showToast("Error al conectar con el servidor", "error");
        btnAprobar.disabled = false;
        btnRevision.disabled = false;
        btnRechazar.disabled = false;
        btnRechazar.textContent = 'Rechazar';
    }
}

/* ============================================
   REVISIÓN DE SOLICITUD
   ============================================ */

/* Poner solicitud en revisión */
async function ponerEnRevision() {
    if (!solicitudActual) return;

    const idUsuario = solicitudActual.id_usuario;
    
    const btnAprobar = document.querySelector('#modal-solicitud .btn-success');
    const btnRevision = document.querySelector('#modal-solicitud .btn-warning');
    const btnRechazar = document.querySelector('#modal-solicitud .btn-error');
    
    btnAprobar.disabled = true;
    btnRevision.disabled = true;
    btnRechazar.disabled = true;
    btnRevision.textContent = 'Procesando...';

    try {
        const response = await fetch(`${API_URL}/endpoint/solicitudes/acciones/revision_solicitudes.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_usuario: idUsuario })
        });

        const result = await response.json();

        if (result.estado === "ok") {
            showToast("Solicitud puesta en revisión", "success");
            cerrarModal('modal-solicitud');
            loadSolicitudes();
        } else {
            showToast("Error: " + result.mensaje, "error");
            btnAprobar.disabled = false;
            btnRevision.disabled = false;
            btnRechazar.disabled = false;
            btnRevision.textContent = 'En Revisión';
        }
    } catch (error) {
        showToast("Error al conectar con el servidor", "error");
        btnAprobar.disabled = false;
        btnRevision.disabled = false;
        btnRechazar.disabled = false;
        btnRevision.textContent = 'En Revisión';
    }
}

/* ============================================
   GESTIÓN DE MODALES
   ============================================ */

/* Cerrar modal de solicitud */
function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';

        /* Restaurar visibilidad y estado de botones de acción */
        const botonesAccion = modal.querySelectorAll('.btn-success, .btn-warning, .btn-error');
        botonesAccion.forEach(btn => {
            btn.style.display = 'inline-block';
            btn.disabled = false;
        });
        
        /* Restaurar textos originales */
        const btnAprobar = modal.querySelector('.btn-success');
        const btnRevision = modal.querySelector('.btn-warning');
        const btnRechazar = modal.querySelector('.btn-error');
        
        if (btnAprobar) btnAprobar.textContent = 'Aprobar';
        if (btnRevision) btnRevision.textContent = 'En Revisión';
        if (btnRechazar) btnRechazar.textContent = 'Rechazar';
    }
}

/* ============================================
   CONTROL DE BOTONES DE ACCIÓN
   ============================================ */

/* Ocultar botones de acción en el modal */
function ocultarBotonesAccion() {
    const modalFooter = document.querySelector("#modal-solicitud .modal-footer");
    if (!modalFooter) return;

    modalFooter.querySelectorAll("button").forEach(btn => {
        if (!btn.textContent.toLowerCase().includes("cerrar")) {
            btn.style.display = "none";
        }
    });
}
