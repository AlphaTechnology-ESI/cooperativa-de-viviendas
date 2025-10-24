// assets/js/dashboard/user/horas.js
document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("btnRegistrarHoras");
    const listaHoras = document.getElementById("listaHoras");
    const horasForm = document.getElementById("horasForm");
    const idUsuario = sessionStorage.getItem("idUsuario");

    function agregarHoraAlListado(hora) {
        const item = document.createElement("div");
        item.classList.add("activity-item");

        const botonComprobante = hora.comprobante_nombre
            ? `<button class="btn btn-small btn-secondary" onclick="window.location.href='http://localhost/cooperativa-de-viviendas-apis/endpoint/dashboard/user/descargar_comprobante.php?id=${hora.id_jornada}'" style="margin-left:10px;">📄</button>`
            : "";

        item.innerHTML = `
            <div class="activity-icon">⏱️</div>
            <div class="activity-content" style="display:flex; align-items:center; justify-content:space-between; width:100%;">
                <div>
                    <p>${hora.horas_trabajadas} horas - ${hora.fecha}</p>
                </div>
                ${botonComprobante}
            </div>
        `;
        listaHoras.prepend(item);
    }

    async function cargarHoras() {
        try {
            const res = await fetch("http://localhost/cooperativa-de-viviendas-apis/endpoint/dashboard/user/listar_horas.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_usuario: idUsuario })
            });
            const result = await res.json();
            if (result.estado === "ok") {
                listaHoras.innerHTML = "";
                result.horas.forEach(h => agregarHoraAlListado(h));
            } else {
                console.warn("No se encontraron horas o error:", result.mensaje);
            }
        } catch (err) {
            console.error("Error al cargar las horas:", err);
            alert("Error al conectar con el servidor.");
        }
    }

    btn.addEventListener("click", async function () {
        const fecha = document.getElementById("fechaTrabajo").value;
        const horas = document.getElementById("horasTrabajo").value;
        const comprobante = document.getElementById("comprobantePago").files[0];

        if (!fecha || !horas) {
            alert("Debes completar fecha y horas trabajadas.");
            return;
        }

        const formData = new FormData();
        formData.append("id_usuario", idUsuario);
        formData.append("fecha", fecha);
        formData.append("horas_trabajadas", horas);
        if (comprobante) formData.append("comprobantePago", comprobante);

        try {
            const res = await fetch("http://localhost/cooperativa-de-viviendas-apis/endpoint/dashboard/user/horas.php", {
                method: "POST",
                body: formData
            });
            const result = await res.json();
            if (result.estado === "ok") {
                agregarHoraAlListado({
                    fecha,
                    horas_trabajadas: horas,
                    id_jornada: result.id_jornada,
                    comprobante_nombre: result.comprobante_nombre || (comprobante ? comprobante.name : null)
                });
                horasForm.reset();
                alert("Horas registradas correctamente");
            } else {
                alert(result.mensaje || "Error al registrar las horas");
            }
        } catch (err) {
            console.error("Error al guardar las horas:", err);
            alert("Error al conectar con el servidor.");
        }
    });

    cargarHoras();
});