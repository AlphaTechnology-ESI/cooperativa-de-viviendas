/* ============================================
   GESTIÓN DE INICIO DE SESIÓN
   ============================================ */

/* Manejo del formulario de login */
document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const correo = document.getElementById("email").value.trim();
    const contrasena = document.getElementById("password").value;

    /* Validación de campos requeridos */
    if (!correo || !contrasena) {
        showAlert("Por favor completa todos los campos", "warning");
        return;
    }

    const btnLogin = e.target.querySelector('button[type="submit"]');
    const textoOriginal = btnLogin.innerHTML;
    
    btnLogin.disabled = true;
    btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';

    try {
        const response = await fetch(`${API_URL}/endpoint/sesion/login.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo, contrasena })
        });

        if (!response.ok) {
            throw new Error("Error en la respuesta del servidor");
        }

        const result = await response.json();

        if (result.estado === "ok") {
            /* Guardar datos de sesión */
            sessionStorage.setItem("usuarioLogueado", "true");
            sessionStorage.setItem("rol", result.rol);
            sessionStorage.setItem("nombreUsuario", result.nombre);
            sessionStorage.setItem("idUsuario", result.id);

            /* Mostrar mensaje de éxito */
            showAlert("Inicio de sesión exitoso", "success");

            /* Redirigir según el rol del usuario */
            setTimeout(() => {
                if (result.rol === "admins") {
                    window.location.href = "admin/dashboard.html";
                } else {
                    window.location.href = "user/dashboard.html";
                }
            }, 800);
        } else {
            showAlert(result.mensaje || "Credenciales incorrectas", "error");
            btnLogin.disabled = false;
            btnLogin.innerHTML = textoOriginal;
        }
    } catch (error) {
        console.error("Error al conectar:", error);
        showAlert("Error al conectar con el servidor", "error");
        btnLogin.disabled = false;
        btnLogin.innerHTML = textoOriginal;
    }
});

/* ============================================
   SISTEMA DE ALERTAS
   ============================================ */

/* Mostrar alerta al usuario */
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

/* ============================================
   ESTILOS Y ANIMACIONES CSS
   ============================================ */

/* Agregar animaciones CSS dinámicamente */
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
`;
document.head.appendChild(style);