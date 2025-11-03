document.addEventListener("DOMContentLoaded", async function() {
    const idUsuario = sessionStorage.getItem("idUsuario");

    try {
        const response = await fetch(`${API_URL}/endpoint/dashboard/user/perfil.php`, {
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
            document.getElementById("profileFechaNacimiento").value = usuario.fecha_nacimiento || "";
            document.getElementById("profileEstadoCivil").value = usuario.estado_civil || "";
            document.getElementById("profileOcupacion").value = usuario.ocupacion || "";
            document.getElementById("profileIngresos").value = usuario.ingresos || "";
            
            // Formatear y mostrar fecha de ingreso
            if (usuario.fecha_ingreso) {
                const fecha = new Date(usuario.fecha_ingreso);
                const fechaFormateada = fecha.toLocaleDateString('es-UY', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                document.getElementById("profileFechaIngreso").value = fechaFormateada;
            } else {
                document.getElementById("profileFechaIngreso").value = "No disponible";
            }
        } else {
            console.warn("No se encontraron datos del usuario:", result.mensaje);
        }
    } catch (error) {
        console.error("Error al cargar perfil:", error);
    }

    // Manejar el envío del formulario
    const profileForm = document.getElementById("profileForm");
    profileForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Validar que los campos de contraseña estén llenos
        if (!currentPassword || !newPassword || !confirmPassword) {
            showAlert("Por favor, completa todos los campos de contraseña", "warning");
            return;
        }

        // Validar que las nuevas contraseñas coincidan
        if (newPassword !== confirmPassword) {
            showAlert("Las contraseñas nuevas no coinciden", "error");
            return;
        }

        // Validar longitud mínima
        if (newPassword.length < 4) {
            showAlert("La nueva contraseña debe tener al menos 4 caracteres", "warning");
            return;
        }

        // Mostrar overlay de carga
        showLoadingOverlay();

        try {
            const response = await fetch(`${API_URL}/endpoint/dashboard/user/cambiar_contrasena.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_usuario: idUsuario,
                    contrasena_actual: currentPassword,
                    contrasena_nueva: newPassword
                })
            });

            const result = await response.json();

            // Ocultar overlay de carga
            hideLoadingOverlay();

            if (result.estado === "ok") {
                showAlert("Contraseña actualizada correctamente", "success");
                // Limpiar campos
                document.getElementById("currentPassword").value = "";
                document.getElementById("newPassword").value = "";
                document.getElementById("confirmPassword").value = "";
            } else {
                showAlert(result.mensaje || "Error al cambiar la contraseña", "error");
            }
        } catch (error) {
            console.error("Error al cambiar contraseña:", error);
            hideLoadingOverlay();
            showAlert("Error de conexión al cambiar la contraseña", "error");
        }
    });
});

function showLoadingOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "loadingOverlay";
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--overlay-bg, rgba(0, 0, 0, 0.7));
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;

    const loadingBox = document.createElement("div");
    loadingBox.style.cssText = `
        background: var(--bg-primary);
        padding: 30px 40px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        animation: scaleIn 0.3s ease-out;
        border: 1px solid var(--border-color);
    `;

    const spinner = document.createElement("div");
    spinner.className = "loading-spinner";
    spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 4px solid var(--border-color);
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
    `;

    const text = document.createElement("p");
    text.textContent = "Actualizando contraseña...";
    text.style.cssText = `
        margin: 0;
        color: var(--text-primary);
        font-size: 16px;
        font-weight: 500;
    `;

    loadingBox.appendChild(spinner);
    loadingBox.appendChild(text);
    overlay.appendChild(loadingBox);
    document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
        overlay.style.animation = "fadeOut 0.3s ease-in";
        setTimeout(() => overlay.remove(), 300);
    }
}

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

// Agregar animaciones CSS
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    @keyframes scaleIn {
        from {
            transform: scale(0.8);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
