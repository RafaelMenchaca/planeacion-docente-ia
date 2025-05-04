// login.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");

    form.addEventListener("submit", function (e) {
        e.preventDefault(); // Evita que se recargue la página

        const usuario = form.usuario.value.trim();
        const password = form.password.value.trim();

        // Simulación de usuario válido
        const usuarioValido = "admin";
        const passwordValido = "1234";

        if (usuario === usuarioValido && password === passwordValido) {
            // Redirigir a una "página protegida"
            window.location.href = "dashboard.html"; // Puedes crear esta página más adelante
        } else {
            alert("Usuario o contraseña incorrectos");
        }
    });
});
