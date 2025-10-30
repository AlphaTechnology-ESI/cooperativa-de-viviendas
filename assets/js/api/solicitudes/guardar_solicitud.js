document.getElementById("housing-request-form").addEventListener("submit", async function(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_URL}/endpoint/solicitudes/guardar_solicitud.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const responseText = await response.text();
        const result = JSON.parse(responseText);

        if (result.estado === "ok") {
            alert("Solicitud enviada correctamente.");
            form.reset();
        } else {
            alert("Error: " + result.mensaje);
        }
    } catch (error) {
        console.error("Error al enviar la solicitud:", error);
        alert("Error al enviar la solicitud.");
    }
});