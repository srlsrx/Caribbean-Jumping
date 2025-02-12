const musica = document.getElementById("musica");
const toggleMusica = document.getElementById("toggleMusica");
const controlVolumen = document.getElementById("controlVolumen");

// Iniciar con volumen al 50%
musica.volume = 0.03;

// Control de reproducción (play/pause)
toggleMusica.addEventListener("click", () => {
    if (musica.paused) {
        musica.play();
        toggleMusica.textContent = "🎵"; // Icono de música
    } else {
        musica.pause();
        toggleMusica.textContent = "🔇"; // Icono de silencio
    }
});

// Control de volumen
controlVolumen.addEventListener("input", (e) => {
    musica.volume = e.target.value;
});
