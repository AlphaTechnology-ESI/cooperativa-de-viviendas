document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const correo = document.getElementById("email").value.trim();
    const contrasena = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    try {
        const response = await fetch("https://cooperativa-de-viviendas-apis.onrender.com/sesion/login.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ correo, contrasena })
        });

        const responseText = await response.text();
        console.log("Respuesta cruda:", responseText); // 👈 Esto ayuda a debug

        const result = JSON.parse(responseText);

        if (result.estado === "ok") {
            sessionStorage.setItem("usuarioLogueado", "true");
            sessionStorage.setItem("rol", result.rol);

            if (result.rol === "admins") {
                window.location.href = "admin_dashboard.html";
            } else {
                window.location.href = "user_dashboard.html";
            }
        } else {
            errorMessage.textContent = result.mensaje || "Credenciales incorrectas.";
            errorMessage.style.display = "block";
        }
    } catch (error) {
        console.error("Error al conectar:", error);
        errorMessage.textContent = "Error al conectar con el servidor.";
        errorMessage.style.display = "block";
    }
});