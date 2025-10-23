document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("btnRegistrarHoras");
    const listaHoras = document.getElementById("listaHoras");
    const horasForm = document.getElementById("horasForm");

    const idUsuario = sessionStorage.getItem("idUsuario");

    // Función para mostrar un item en el historial
    function agregarHoraAlListado(hora) {
        const item = document.createElement("div");
        item.classList.add("activity-item");
        item.innerHTML = `
            <div class="activity-icon">⏱️</div>
            <div class="activity-content">
                <p>${hora.horas_trabajadas} horas - ${hora.fecha}</p>
                ${hora.tipo_compensacion || hora.motivo_inasistencia
                ? `<small>Compensación: ${hora.tipo_compensacion} - Motivo: ${hora.motivo_inasistencia}</small>`
                : ""}
            </div>
        `;
        listaHoras.prepend(item);
    }

    // Cargar horas existentes al inicio
    async function cargarHoras() {
        try {
            const response = await fetch("http://localhost/cooperativa-de-viviendas-apis/endpoint/dashboard/user/listar_horas.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_usuario: idUsuario })
            });
            const result = await response.json();

            if (result.estado === "ok" && Array.isArray(result.horas)) {
                listaHoras.innerHTML = "";
                result.horas.forEach(h => agregarHoraAlListado(h));
            } else {
                console.warn("No se encontraron horas o error:", result.mensaje);
            }
        } catch (error) {
            console.error("Error al cargar las horas:", error);
        }
    }

    // Registrar nueva jornada
    btn.addEventListener("click", async function () {
        const fecha = document.getElementById("fechaTrabajo").value;
        const horas = document.getElementById("horasTrabajo").value;

        if (!fecha || !horas) {
            alert("Debes completar fecha y horas trabajadas.");
            return;
        }

        try {
            const response = await fetch("http://localhost/cooperativa-de-viviendas-apis/endpoint/dashboard/user/horas.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_usuario: idUsuario, fecha: fecha, horas_trabajadas: horas })
            });

            const result = await response.json();

            if (result.estado === "ok") {
                agregarHoraAlListado({ fecha, horas_trabajadas: horas });
                horasForm.reset();
                alert("Horas registradas correctamente");
            } else {
                alert(result.mensaje || "Error al registrar las horas");
            }

        } catch (error) {
            console.error("Error al guardar las horas:", error);
            alert("Error al conectar con el servidor.");
        }
    });

    cargarHoras();
});
