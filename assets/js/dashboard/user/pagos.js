/* ============================================
   GESTIÓN DE PAGOS - USUARIO
   ============================================ */

/* Inicialización del módulo de pagos */
document.addEventListener("DOMContentLoaded", async function() {
    await cargarPagos();
});

/* ============================================
   CARGA DE PAGOS
   ============================================ */

async function cargarPagos() {
    const idUsuario = sessionStorage.getItem("idUsuario");
    const tbody = document.getElementById("paymentsTableBody");

    if (!idUsuario) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--danger-color);">
                    Error: Usuario no identificado
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i> <span style="margin-left: 10px;">Cargando...</span></td></tr>';

    try {
        const url = `${API_URL}/endpoint/dashboard/user/pagos.php`;
        const requestBody = { id_usuario: idUsuario, accion: "listar" };
        
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.estado === "ok") {
            tbody.innerHTML = "";
            
            if (!result.pagos || result.pagos.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                            No hay pagos registrados
                        </td>
                    </tr>
                `;
                return;
            }

            result.pagos.forEach(pago => {
                const tr = document.createElement("tr");
                const fecha = pago.fecha ? formatDate(pago.fecha) : "Pendiente";
                const monto = pago.tipo === 'aporte_inicial' ? "$500.000" : "$150.000";
                const concepto = pago.tipo === 'aporte_inicial' ? "Aporte Inicial" : "Cuota Mensual";
                
                let estadoBadge = "";
                let accionBtn = "";

                if (pago.estado_pago === "pagado" || pago.estado_pago === "aprobado" || pago.estado_pago === "aprobada") {
                    estadoBadge = `<span class="badge badge-aprobada">Pagado</span>`;
                    accionBtn = pago.tiene_comprobante ? 
                        `<button class="btn btn-small" onclick="verComprobante('${pago.id_pago}', '${pago.tipo}', '${pago.id_aporte || 0}')">Ver Comprobante</button>` :
                        `<span style="color: var(--text-muted);">Sin comprobante</span>`;
                } else if (pago.estado_pago === "pendiente") {
                    estadoBadge = `<span class="badge badge-pendiente">Pendiente</span>`;
                    accionBtn = pago.tiene_comprobante ? 
                        `<span class="badge badge-pendiente">En revisión</span>` :
                        `<button class="btn btn-small btn-primary" onclick="abrirModalPago('${pago.id_pago}', '${monto}', '${concepto}', '${pago.tipo}')">Pagar</button>`;
                } else if (pago.estado_pago === "rechazado" || pago.estado_pago === "rechazada") {
                    estadoBadge = `<span class="badge badge-rechazada">Rechazado</span>`;
                    accionBtn = `<button class="btn btn-small btn-primary" onclick="abrirModalPago('${pago.id_pago}', '${monto}', '${concepto}', '${pago.tipo}')">Reintentar</button>`;
                } else {
                    estadoBadge = `<span class="badge badge-pendiente">Sin pagar</span>`;
                    accionBtn = `<button class="btn btn-small btn-primary" onclick="abrirModalPago('${pago.id_pago}', '${monto}', '${concepto}', '${pago.tipo}')">Pagar</button>`;
                }

                tr.innerHTML = `
                    <td>${fecha}</td>
                    <td>${concepto}</td>
                    <td>${monto}</td>
                    <td>${estadoBadge}</td>
                    <td>${accionBtn}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        ${result.mensaje || "Error al cargar pagos"}
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--danger-color);">
                    Error al cargar los pagos. Verifica la conexión.
                </td>
            </tr>
        `;
    }
}

/* ============================================
   GESTIÓN DE MODAL DE PAGO
   ============================================ */

/* Abrir modal para realizar pago */
function abrirModalPago(idPago, monto, concepto, tipo) {
    const modal = document.getElementById("pagoModal");
    document.getElementById("pagoIdPago").value = idPago;
    document.getElementById("pagoConcepto").value = concepto;
    document.getElementById("pagoMonto").value = monto;
    document.getElementById("pagoComprobante").value = "";
    
    // Guardar el tipo de pago en un campo oculto o data attribute
    const form = document.getElementById("pagoForm");
    form.dataset.tipoPago = tipo;
    
    modal.style.display = "flex";
}

/* Cerrar modal de pago */
function cerrarModalPago() {
    const modal = document.getElementById("pagoModal");
    modal.style.display = "none";
    document.getElementById("pagoForm").reset();
}

/* ============================================
   ENVÍO DE PAGO
   ============================================ */

document.getElementById("pagoForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const idUsuario = sessionStorage.getItem("idUsuario");
    const idPago = document.getElementById("pagoIdPago").value;
    const comprobante = document.getElementById("pagoComprobante").files[0];

    if (!comprobante) {
        showAlert("Por favor selecciona un comprobante", "warning");
        return;
    }

    /* Validar tamaño del archivo (5MB) */
    if (comprobante.size > 5 * 1024 * 1024) {
        showAlert("El archivo no debe superar los 5MB", "warning");
        return;
    }

    const formData = new FormData();
    formData.append("id_usuario", idUsuario);
    formData.append("id_pago", idPago);
    formData.append("comprobante", comprobante);
    formData.append("accion", "registrar_pago");
    formData.append("tipo_pago", e.target.dataset.tipoPago || "mensual");

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const textoOriginal = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
        const response = await fetch(`${API_URL}/endpoint/dashboard/user/pagos.php`, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.estado === "ok") {
            showAlert("Pago registrado correctamente", "success");
            cerrarModalPago();
            await cargarPagos();
        } else {
            showAlert(result.mensaje || "Error al registrar el pago", "error");
        }
    } catch (error) {
        showAlert("Error al conectar con el servidor", "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = textoOriginal;
    }
});

/* ============================================
   VISUALIZACIÓN DE COMPROBANTE
   ============================================ */

async function verComprobante(idPago, tipo, idAporte) {
    const idUsuario = sessionStorage.getItem("idUsuario");
    
    try {
        const response = await fetch(`${API_URL}/endpoint/dashboard/user/pagos.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                id_usuario: idUsuario, 
                id_pago: tipo === 'aporte_inicial' ? 0 : idPago,
                id_aporte: tipo === 'aporte_inicial' ? idAporte : 0,
                tipo: tipo,
                accion: "ver_comprobante" 
            })
        });

        const result = await response.json();

        if (result.estado === "ok" && result.comprobante) {
            const modal = document.getElementById("comprobanteModal");
            const viewer = document.getElementById("comprobanteViewer");
            
            const isPDF = result.comprobante.startsWith('JVBER');
            
            if (isPDF) {
                viewer.innerHTML = `
                    <embed src="data:application/pdf;base64,${result.comprobante}" 
                           type="application/pdf" 
                           width="100%" 
                           height="600px" />
                    <button class="btn btn-small btn-primary" onclick="descargarComprobante('${result.comprobante}', 'comprobante.pdf')" style="margin-top: 10px;">
                        <i class="fas fa-download"></i> Descargar PDF
                    </button>
                `;
            } else {
                viewer.innerHTML = `
                    <img src="data:image/jpeg;base64,${result.comprobante}" 
                         alt="Comprobante" 
                         style="max-width: 100%; height: auto;" />
                    <button class="btn btn-small btn-primary" onclick="descargarComprobante('${result.comprobante}', 'comprobante.jpg')" style="margin-top: 10px;">
                        <i class="fas fa-download"></i> Descargar Imagen
                    </button>
                `;
            }
            
            modal.style.display = "flex";
        } else {
            showAlert("No se pudo cargar el comprobante", "error");
        }
    } catch (error) {
        showAlert("Error al cargar el comprobante", "error");
    }
}

/* Cerrar modal de comprobante */
function cerrarModalComprobante() {
    const modal = document.getElementById("comprobanteModal");
    modal.style.display = "none";
}

/* Descargar comprobante */
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
   EVENTOS GLOBALES
   ============================================ */

/* Cerrar modales al hacer clic fuera */
window.onclick = function(event) {
    const pagoModal = document.getElementById("pagoModal");
    const comprobanteModal = document.getElementById("comprobanteModal");
    
    if (event.target === pagoModal) {
        cerrarModalPago();
    }
    if (event.target === comprobanteModal) {
        cerrarModalComprobante();
    }
}

/* ============================================
   FUNCIONES DE UTILIDAD
   ============================================ */

function showAlert(message, type) {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10001;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        font-weight: 500;
    `;

    const colors = {
        success: { bg: "var(--success-color, #10b981)", color: "#fff" },
        error: { bg: "var(--danger-color, #ef4444)", color: "#fff" },
        warning: { bg: "var(--warning-color, #f59e0b)", color: "#fff" }
    };

    alertDiv.style.backgroundColor = colors[type].bg;
    alertDiv.style.color = colors[type].color;
    alertDiv.textContent = message;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.animation = "slideOut 0.3s ease-in";
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}