async function aprobarSolicitud() {
    if (!solicitudActual) return;

    const idUsuario = solicitudActual.id_usuario;

    try {
        const response = await fetch(`http://localhost/cooperativa-de-viviendas-apis/laravel/endpoint/solicitudes/acciones/aprobar_solicitudes.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_usuario: idUsuario })
        });

        const result = await response.json();

        if (result.estado === "ok") {
            alert("Solicitud aprobada correctamente");
            document.getElementById('modal-solicitud').style.display = 'none';
            loadSolicitudes();
        } else {
            alert("Error: " + result.mensaje);
        }
    } catch (error) {
        console.error("Error al aprobar solicitud:", error);
        alert("Error al conectar con el servidor");
    }
}

async function rechazarSolicitud() {
    if (!solicitudActual) return;

    const idUsuario = solicitudActual.id_usuario;

    try {
        const response = await fetch(`http://localhost/cooperativa-de-viviendas-apis/laravel/endpoint/solicitudes/acciones/rechazar_solicitudes.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_usuario: idUsuario })
        });

        const result = await response.json();

        if (result.estado === "ok") {
            alert("Solicitud rechazada correctamente");
            ocultarBotonesAccion();

            loadSolicitudes();
        }
        else {
            alert("Error: " + result.mensaje);
        }
    } catch (error) {
        console.error("Error al rechazar solicitud:", error);
        alert("Error al conectar con el servidor");
    }
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';

        const botonesAccion = modal.querySelectorAll('.btn-success, .btn-warning, .btn-error');
        botonesAccion.forEach(btn => btn.style.display = 'inline-block');
    }
}


function ocultarBotonesAccion() {
    const modalFooter = document.querySelector("#modal-solicitud .modal-footer");
    if (!modalFooter) return;

    modalFooter.querySelectorAll("button").forEach(btn => {
        if (!btn.textContent.toLowerCase().includes("cerrar")) {
            btn.style.display = "none";
        }
    });
}
