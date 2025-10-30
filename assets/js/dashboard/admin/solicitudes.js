

let solicitudActual = null;

async function verSolicitud(id) {
    try {
        const response = await fetch(`${API_URL}/endpoint/solicitudes/obtener_solicitudes.php?id=` + id);
        const result = await response.json();

        if (result.estado === "ok") {
            solicitudActual = result.solicitudes.find(s => s.id_usuario == id);

            if (solicitudActual) {
                const modalBody = document.getElementById('modal-solicitud-body');

                modalBody.innerHTML = `
                    <div class="solicitud-detalle">
                        <p><strong>Nombre:</strong> ${solicitudActual.nom_usu}</p>
                        <p><strong>Cédula:</strong> ${solicitudActual.cedula}</p>
                        <p><strong>Correo:</strong> ${solicitudActual.correo}</p>
                        <p><strong>Teléfono:</strong> ${solicitudActual.telefono}</p>
                        <p><strong>Fecha de Nacimiento:</strong> ${formatDate(solicitudActual.fecha_nacimiento)}</p>
                        <p><strong>Estado Civil:</strong> ${solicitudActual.estado_civil}</p>
                        <p><strong>Ocupación:</strong> ${solicitudActual.ocupacion}</p>
                        <p><strong>Ingresos:</strong> ${solicitudActual.ingresos}</p>
                        <hr>
                        <p><strong>Vivienda:</strong> ${solicitudActual.Vivienda_Seleccionada}</p>
                        <p><strong>Monto Inicial:</strong> ${formatCurrency(solicitudActual.Monto_Inicial)}</p>
                        <p><strong>Forma de Pago:</strong> ${solicitudActual.Forma_Pago}</p>
                        ${solicitudActual.Grupo_Familiar ? `<p><strong>Grupo Familiar:</strong> ${solicitudActual.Grupo_Familiar}</p>` : ''}
                        ${solicitudActual.Comentarios ? `<p><strong>Comentarios:</strong> ${solicitudActual.Comentarios}</p>` : ''}
                        <p><strong>Estado:</strong> ${getEstadoLabel(solicitudActual.estado_solicitud)}</p>
                        ${solicitudActual.fecha_evaluacion ? `<p><strong>Fecha de Evaluación:</strong> ${formatDateTime(solicitudActual.fecha_evaluacion)}</p>` : ''}
                    </div>
                `;

                document.getElementById('modal-solicitud').style.display = 'flex';

                const acciones = document.querySelectorAll('#modal-solicitud .btn-success, #modal-solicitud .btn-warning, #modal-solicitud .btn-error');
                if (['aprobada', 'rechazada', 'en_revision'].includes(solicitudActual.estado_solicitud)) {
                    acciones.forEach(btn => btn.style.display = 'none');
                } else {
                    acciones.forEach(btn => btn.style.display = 'inline-block');
                }
            }
        }
    } catch (error) {
        console.error('Error al cargar la solicitud:', error);
    }
}