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
            loadSolicitudes(); // recarga la tabla
        } else {
            alert("Error: " + result.mensaje);
        }
    } catch (error) {
        console.error("Error al aprobar solicitud:", error);
        alert("Error al conectar con el servidor");
    }
}
