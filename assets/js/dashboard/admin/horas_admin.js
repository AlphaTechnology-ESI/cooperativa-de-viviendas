let idSeleccionado = null;

document.addEventListener("DOMContentLoaded", function () {
    cargarHoras();
});

async function cargarHoras() {
    const filtro = document.getElementById("filtro-estado").value;
    const tbody = document.getElementById("horas-tbody");

    try {
        const res = await fetch(`${API_URL}/cooperativa-de-viviendas-apis/endpoint/dashboard/admin/listar_horas_admin.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: filtro })
        });
        const data = await res.json();

        tbody.innerHTML = "";

        if (data.estado !== "ok" || data.horas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center">No se encontraron registros</td></tr>`;
            return;
        }

        data.horas.forEach(h => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${h.nombre_usuario}</td>
                <td>${h.fecha}</td>
                <td>${h.horas_trabajadas}</td>
                <td>${h.estado}</td>
                <td><button class="btn btn-small btn-primary" onclick="abrirModal(${h.id_jornada})">Ver</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">Error al conectar con el servidor</td></tr>`;
    }
}

async function abrirModal(id) {
    idSeleccionado = id;
    const modal = document.getElementById("modal-hora");
    const modalBody = document.getElementById("modal-body");
    modal.style.display = "flex";

    modalBody.innerHTML = "<p>Cargando...</p>";

    try {
        const res = await fetch(`${API_URL}/cooperativa-de-viviendas-apis/endpoint/dashboard/admin/ver_hora_admin.php?id=` + id);
        const data = await res.json();

        if (!data || data.estado !== "ok" || !data.hora) {
            modalBody.innerHTML = `<p>Error al cargar los datos del registro.</p>`;
            console.error("Respuesta del servidor:", data);
            return;
        }

        const h = data.hora;

        modalBody.innerHTML = `
    <p><strong>Usuario:</strong> ${h.nombre_usuario}</p>
    <p><strong>Cedula:</strong> ${h.cedula}</p>
    <p><strong>Fecha:</strong> ${h.fecha}</p>
    <p><strong>Horas trabajadas:</strong> ${h.horas_trabajadas}</p>
    <p><strong>Estado actual:</strong> ${h.estado}</p>
    <p><strong>Motivo / Tipo Compensación:</strong> ${h.motivo_inasistencia || h.tipo_compensacion || '-'}</p>
    ${h.comprobante_nombre ? `
        <div style="margin-top:10px;">
            <p><strong>Comprobante:</strong> ${h.comprobante_nombre}</p>
            <img src="${API_URL}/cooperativa-de-viviendas-apis/endpoint/dashboard/admin/descargar_comprobante_admin.php?id=${h.id_jornada}"
                 alt="Comprobante"
                 style="max-width: 300px; display: block; border: 1px solid #ccc; border-radius: 6px; margin: 10px 0;">
            <button class="btn btn-secondary btn-small"
                onclick="window.open('${API_URL}/cooperativa-de-viviendas-apis/endpoint/dashboard/admin/descargar_comprobante_admin.php?id=${h.id_jornada}', '_blank')">
                Descargar Comprobante
            </button>
        </div>
    ` : `<p>No hay comprobante disponible.</p>`}
`;

    } catch (err) {
        console.error(err);
        modalBody.innerHTML = "<p>Error al conectar con el servidor.</p>";
    }
}

async function actualizarEstado(estado) {
    if (!idSeleccionado) return;

    const res = await fetch(`${API_URL}/cooperativa-de-viviendas-apis/endpoint/dashboard/admin/cambiar_estado.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_jornada: idSeleccionado, estado })
    });
    const data = await res.json();

    if (data.estado === "ok") {
        cerrarModal();
        cargarHoras();
    } else {
        alert("Error al actualizar estado.");
    }
}

function cerrarModal() {
    document.getElementById("modal-hora").style.display = "none";
}