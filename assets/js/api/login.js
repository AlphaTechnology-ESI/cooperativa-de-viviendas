document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const formData = new FormData(this);

    const response = await fetch("__DIR__/api/endpoint/login.php", {
        method: "POST",
        body: formData
    });

    const resultado = await response.text();
    alert(resultado);
});