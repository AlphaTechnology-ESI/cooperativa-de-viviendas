/* ============================================
   GESTIÓN DE PAGOS - ADMINISTRADOR
   ============================================ */

/* Variables globales */
let pagoActual = null;

/* Inicialización */
document.addEventListener("DOMContentLoaded", function() {
    cargarPagos();
});

/* ============================================
   CARGA DE PAGOS
   ============================================ */

async function cargarPagos() {
    const tbody = document.getElementById("pagos-tbody");
    const filtroEstado = document.getElementById("filtro-estado").value;
    const filtroTipo = document.getElementById("filtro-tipo").value;

    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/endpoint/dashboard/admin/pagos_admin.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                accion: "listar",
                filtro_estado: filtroEstado,
                filtro_tipo: filtroTipo
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Respuesta pagos admin:", result);

        if (result.estado === "ok" && result.pagos) {
            tbody.innerHTML = "";
            
            if (result.pagos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay pagos registrados</td></tr>';
                return;
            }

            result.pagos.forEach(pago => {
                const tr = document.createElement("tr");
                
                const tipo = pago.tipo === 'aporte_inicial' ? 'Aporte Inicial' : 'Cuota Mensual';
                const monto = pago.tipo === 'aporte_inicial' ? '$500.000' : '$150.000';
                const fechaEnvio = pago.fecha_envio ? formatDate(pago.fecha_envio) : "Sin enviar";
                
                let estadoBadge = "";
                if (pago.estado === "aprobado" || pago.estado === "aprobada" || pago.estado === "pagado") {
                    estadoBadge = '<span class="badge badge-aprobada">Aprobado</span>';
                } else if (pago.estado === "pendiente") {
                    estadoBadge = '<span class="badge badge-pendiente">Pendiente</span>';
                } else if (pago.estado === "rechazado" || pago.estado === "rechazada") {
                    estadoBadge = '<span class="badge badge-rechazada">Rechazado</span>';
                }

                tr.innerHTML = `
                    <td>${pago.nom_usu || 'Usuario desconocido'}</td>
                    <td>${tipo}</td>
                    <td>${monto}</td>
                    <td>${fechaEnvio}</td>
                    <td>${estadoBadge}</td>
                    <td>
                        <button class="btn btn-small btn-primary" onclick='verDetalle(${JSON.stringify(pago).replace(/'/g, "&apos;")})'>
                            Ver Detalle
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">${result.mensaje || "Error al cargar pagos"}</td></tr>`;
        }
    } catch (error) {
        console.error("Error al cargar pagos:", error);
        console.error("Error completo:", error.message);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Error al cargar los pagos: ${error.message}</td></tr>`;
    }
}

/* ============================================
   DETALLE DEL PAGO
   ============================================ */

async function verDetalle(pago) {
    pagoActual = pago;
    const modal = document.getElementById("modal-pago");
    const modalBody = document.getElementById("modal-body");

    const tipo = pago.tipo === 'aporte_inicial' ? 'Aporte Inicial' : 'Cuota Mensual';
    const monto = pago.tipo === 'aporte_inicial' ? '$500.000' : '$150.000';
    const fechaEnvio = pago.fecha_envio ? formatDate(pago.fecha_envio) : "Sin enviar";

    let estadoTexto = "";
    if (pago.estado === "aprobado" || pago.estado === "aprobada" || pago.estado === "pagado") {
        estadoTexto = '<span class="badge badge-aprobada">Aprobado</span>';
    } else if (pago.estado === "pendiente") {
        estadoTexto = '<span class="badge badge-pendiente">Pendiente</span>';
    } else if (pago.estado === "rechazado" || pago.estado === "rechazada") {
        estadoTexto = '<span class="badge badge-rechazada">Rechazado</span>';
    }

    let comprobanteHTML = '<div class="detail-item full-width"><strong>Comprobante:</strong><span style="color: var(--text-muted);">No disponible</span></div>';
    
    if (pago.tiene_comprobante) {
        try {
            const response = await fetch(`${API_URL}/endpoint/dashboard/admin/pagos_admin.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accion: "obtener_comprobante",
                    tipo: pago.tipo,
                    id_pago: pago.id_pago || 0,
                    id_aporte: pago.id_aporte || 0
                })
            });

            const result = await response.json();

            if (result.estado === "ok" && result.comprobante) {
                const isPDF = result.comprobante.startsWith('JVBER');
                
                if (isPDF) {
                    comprobanteHTML = `
                        <div class="detail-item full-width">
                            <strong>Comprobante (PDF):</strong>
                            <div style="margin-top: 10px;">
                                <embed src="data:application/pdf;base64,${result.comprobante}" type="application/pdf" width="100%" height="500px" />
                                <button class="btn btn-small btn-primary" onclick="descargarComprobante('${result.comprobante}', 'comprobante.pdf')" style="margin-top: 10px;">
                                    <i class="fas fa-download"></i> Descargar PDF
                                </button>
                            </div>
                        </div>
                    `;
                } else {
                    comprobanteHTML = `
                        <div class="detail-item full-width">
                            <strong>Comprobante:</strong>
                            <div style="margin-top: 10px;">
                                <img src="data:image/jpeg;base64,${result.comprobante}" alt="Comprobante" style="max-width: 100%; height: auto; border: 1px solid var(--border-color); border-radius: 8px;" />
                                <button class="btn btn-small btn-primary" onclick="descargarComprobante('${result.comprobante}', 'comprobante.jpg')" style="margin-top: 10px;">
                                    <i class="fas fa-download"></i> Descargar Imagen
                                </button>
                            </div>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error("Error al cargar comprobante:", error);
        }
    }

    modalBody.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <strong>Usuario:</strong>
                <span>${pago.nom_usu || 'Usuario desconocido'}</span>
            </div>
            <div class="detail-item">
                <strong>Tipo de Pago:</strong>
                <span>${tipo}</span>
            </div>
            <div class="detail-item">
                <strong>Monto:</strong>
                <span>${monto}</span>
            </div>
            <div class="detail-item">
                <strong>Fecha de Envío:</strong>
                <span>${fechaEnvio}</span>
            </div>
            <div class="detail-item">
                <strong>Estado:</strong>
                ${estadoTexto}
            </div>
            ${comprobanteHTML}
        </div>
    `;

    // Actualizar botones del footer según el estado
    const modalFooter = document.querySelector('#modal-pago .modal-footer');
    if (modalFooter) {
        if (!pago.fecha_envio || pago.fecha_envio === null) {
            // Si no hay fecha de envío, solo mostrar botón de cerrar
            modalFooter.innerHTML = `
                <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
            `;
        } else {
            // Si hay fecha de envío, mostrar botones de aprobar/rechazar
            modalFooter.innerHTML = `
                <button class="btn btn-success" onclick="actualizarEstado('aprobado')">Aprobar</button>
                <button class="btn btn-error" onclick="actualizarEstado('rechazado')">Rechazar</button>
                <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
            `;
        }
    }

    modal.style.display = "flex";
}

/* ============================================
   GESTIÓN DE MODALES
   ============================================ */

function cerrarModal() {
    const modal = document.getElementById("modal-pago");
    modal.style.display = "none";
    pagoActual = null;
}

/* ============================================
   ACTUALIZACIÓN DE ESTADO
   ============================================ */

async function actualizarEstado(nuevoEstado) {
    if (!pagoActual) {
        showToast("No hay pago seleccionado", "error");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/endpoint/dashboard/admin/pagos_admin.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                accion: "actualizar_estado",
                id_pago: pagoActual.id_pago,
                id_aporte: pagoActual.id_aporte,
                tipo: pagoActual.tipo,
                estado: nuevoEstado
            })
        });

        const result = await response.json();

        if (result.estado === "ok") {
            showToast(`Pago ${nuevoEstado} correctamente`, "success");
            cerrarModal();
            cargarPagos();
        } else {
            showToast(result.mensaje || "Error al actualizar el pago", "error");
        }
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        showToast("Error al conectar con el servidor", "error");
    }
}

/* ============================================
   DESCARGA DE COMPROBANTES
   ============================================ */

function descargarComprobante(base64Data, nombreArchivo) {
    const isPDF = base64Data.startsWith('JVBER');
    const mimeType = isPDF ? 'application/pdf' : 'image/jpeg';
    
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
}

/* ============================================
   EVENTOS Y LISTENERS
   ============================================ */

/* Actualizar lista al cambiar filtros */
document.getElementById("filtro-estado").addEventListener("change", cargarPagos);
document.getElementById("filtro-tipo").addEventListener("change", cargarPagos);

/* Cerrar modal al hacer clic fuera */
window.onclick = function(event) {
    const modal = document.getElementById("modal-pago");
    if (event.target === modal) {
        cerrarModal();
    }
}