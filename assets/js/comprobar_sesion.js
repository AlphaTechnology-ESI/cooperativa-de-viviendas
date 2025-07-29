if (sessionStorage.getItem("usuarioLogueado") !== "true") {
    alert("Debes iniciar sesión para acceder al dashboard.");
    window.location.href = "login.html";
}