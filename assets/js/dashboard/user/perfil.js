document.addEventListener("DOMContentLoaded", async function() {
    const idUsuario = sessionStorage.getItem("idUsuario");

    try {
        const response = await fetch(`${API_URL}/cooperativa-de-viviendas-apis/endpoint/dashboard/user/perfil.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_usuario: idUsuario })
        });

        const result = await response.json();

        if (result.estado === "ok" && result.usuario) {
            const usuario = result.usuario;

            document.getElementById("profileNombre").value = usuario.nom_usu || "";
            document.getElementById("profileEmail").value = usuario.correo || "";
            document.getElementById("profileTelefono").value = usuario.telefono || "";
            document.getElementById("profileCedula").value = usuario.cedula || "";
            document.getElementById("profileIngresos").value = usuario.ingresos || "1000-2000";
        } else {
            console.warn("No se encontraron datos del usuario:", result.mensaje);
        }
    } catch (error) {
        console.error("Error al cargar perfil:", error);
    }
});
