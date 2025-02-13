const coinSound = document.getElementById("collectCoin");
coinSound.volume = 0.02;
const loseLifeSound = document.getElementById("loseLife");
loseLifeSound.volume = 0.07;
const swordSound = document.getElementById("swordSound");
swordSound.volume = 0.1;
class Game {
    constructor() {
        this.container = document.getElementById("game-container");
        this.personaje = null;
        this.monedas = [];
        this.ratas = [];
        this.scoreElement = document.getElementById("score");
        this.lifesElement = document.getElementById("lifes-container");
        this.puntuacion = 0;
        this.vidas = 3;
        this.gameOver = false;
        this.crearEscenario();
        this.agregarEventos();
        this.generarRatas();
        this.infoContainer = document.getElementById("info-container");
        this.gameOverContainer = document.getElementById("game-over-container");
        this.finalScoreElement = document.getElementById("final-score");
        this.retryButton = document.getElementById("retry-button");
        this.retryButton.addEventListener("click", () => {
            swordSound.play()
            setTimeout(() => {
                this.reiniciarJuego() 
            }, 500);
        });
    }
    crearEscenario() {
        this.personaje = new Personaje();
        this.container.appendChild(this.personaje.element);
        for (let i = 0; i < 7; i++) {
            const moneda = new Moneda();
            this.monedas.push(moneda);
            this.container.appendChild(moneda.element);
        }
    }
    agregarEventos() {
        window.addEventListener("keydown", (e) => this.personaje.mover(e));
        this.checkColisiones();
    }
    checkColisiones() {
        setInterval(() => {
            this.monedas.forEach((moneda, index) => {
                if (this.personaje.colisionaCon(moneda)) {
                    this.puntuacion++;
                    this.container.removeChild(moneda.element);
                    this.monedas.splice(index, 1);
                    coinSound.currentTime = 0
                    coinSound.play();
                    this.actualizarPuntuacion();
                }
                if (this.monedas.length === 0) {
                    this.generarMonedas();
                }
            });

            this.ratas.forEach((rata, index) => {
                if (this.personaje.colisionaCon(rata) && this.vidas <= 1) {
                    this.vidas--;
                    loseLifeSound.play();
                    this.gameOver = true; // Marcar el juego como terminado
                    this.ratas = null; // Detener la verificación de colisiones
                    clearInterval(this.rataInterval); // Detener la generación de ratas
                    this.mostrarPantallaGameOver();
                } else if (this.personaje.colisionaCon(rata)) {
                    loseLifeSound.play();
                    this.ratas = [];
                    this.vidas--;
                    this.actualizarVidas();
                }
                if (rata.estaFueraDePantalla()) {
                    this.container.removeChild(rata.element);
                    this.ratas.splice(index, 1);
                }
            });

            if (this.ron && this.personaje.colisionaCon(this.ron)) {
                this.container.removeChild(this.ron.element);
                this.vidas++; // Añade una vida
                this.actualizarVidas();
                this.ron = null; // Eliminar la referencia
            }
        }, 100);
    }

    generarRatas() {
        setInterval(() => {
            const side = Math.random() < 0.5 ? "left" : "right"; // Aleatorio: izquierda o derecha
            const rata = new Rata(side);
            this.ratas.push(rata);
            this.container.appendChild(rata.element);

            // Mover la rata cada 20ms
            const moveInterval = setInterval(() => {
                if (!rata.estaFueraDePantalla()) {
                    rata.mover();
                } else {
                    clearInterval(moveInterval); // Detener el movimiento cuando sale de la pantalla
                }
            }, 20);
        }, Math.random() * 5000 + 2000); // Intervalo aleatorio entre 1 y 5 segundos
    }

    generarMonedas() {
        for (let i = 0; i < 7; i++) {
            const moneda = new Moneda();
            this.monedas.push(moneda);
            this.container.appendChild(moneda.element);
        }

        if (Math.random() < 0.2) {
            this.generarRon();
        }
    }

    actualizarPuntuacion() {
        this.scoreElement.textContent = this.puntuacion;
    }

    actualizarVidas() {
        this.lifesElement.innerHTML = ""; // Limpia el contenedor
        for (let i = 0; i < this.vidas; i++) {
            const vida = document.createElement("div");
            vida.classList.add("vida");
            this.lifesElement.appendChild(vida);
        }
    }

    generarRon() {
        if (this.ron) {
            this.container.removeChild(this.ron.element);
            this.ron = null;
        }

        const ron = new Ron();
        this.container.appendChild(ron.element);
        this.ron = ron; // Guardamos la referencia para verificar colisiones
    }

    mostrarPantallaGameOver() {
        this.finalScoreElement.textContent = this.puntuacion;
        this.gameOverContainer.style.display = "block";
        this.container.style.display = "none";
    }

    reiniciarJuego() {
        location.reload();
    }
}

class Personaje {
    constructor() {
        this.x = 50;
        this.y = 400;
        this.width = 90;
        this.height = 120;
        this.velocidad = 20;
        this.saltando = false;
        this.cayendo = false;
        this.puedeSaltarEnAire = true; // Nuevo flag
        this.intervaloSalto = null;
        this.intervaloGravedad = null;
        this.element = document.createElement("div");
        this.element.classList.add("personaje");
        this.actualizarPosicion();
        this.teclasPresionadas = new Set();
    }
    mover(evento) {
        this.teclasPresionadas.add(evento.key);
        if (evento.key === "ArrowRight") {
            if (this.x < 820) {
                this.x += this.velocidad;
                this.element.classList.remove("left");
                this.element.classList.add("walk");
            }
        } else if (evento.key === "ArrowLeft") {
            if (this.x > 0) {
                this.x -= this.velocidad;
                this.element.classList.add("left");
                this.element.classList.add("walk");
            }
        } else if (evento.key === "ArrowUp" || evento.code === "Space") {
            this.element.style.animation = "sprite 1.5s infinite steps(6)";
            this.element.classList.add("jump");
            this.saltar();
        }
        this.actualizarPosicion();
    }
    detener(evento) {
        this.teclasPresionadas.delete(evento.key);
        if (
            !this.teclasPresionadas.has("ArrowRight") &&
            !this.teclasPresionadas.has("ArrowLeft")
        ) { 
            this.element.classList.remove("walk");
        } 
    }
    saltar() {
        if (!this.saltando && (this.puedeSaltarEnAire || !this.cayendo)) {
            if (this.cayendo) {
                this.puedeSaltarEnAire = false; // Ya usó el salto en el aire
                clearInterval(this.intervaloGravedad); // Interrumpe la caida
                this.intervaloGravedad = null;
                this.cayendo = false;
            }

            this.saltando = true;
            let alturaMaxima = this.y - 170;

            this.intervaloSalto = setInterval(() => {
                if (this.y > alturaMaxima) {
                    this.y -= 10;
                } else {
                    clearInterval(this.intervaloSalto);
                    this.intervaloSalto = null;
                    this.saltando = false;
                    this.caer();
                }
                this.actualizarPosicion();
            }, 20);
        }
    }
    caer() {
        this.cayendo = true;
        this.intervaloGravedad = setInterval(() => {
            if (this.y < 400) {
                this.y += 10;
            } else {
                clearInterval(this.intervaloGravedad);
                this.intervaloGravedad = null;
                this.cayendo = false;
                this.puedeSaltarEnAire = true; // Resetea el flag al tocar el suelo
                this.element.style.animation = "sprite 1s infinite steps(6)";
                this.element.classList.remove("jump"); // Eliminar la clase jump al tocar el suelo
                this.actualizarPosicion();
                return;
            }
            this.actualizarPosicion();
        }, 20);
    }
    actualizarPosicion() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
    colisionaCon(objeto) {
        return (
            this.x < objeto.x + objeto.width &&
            this.x + this.width > objeto.x &&
            this.y < objeto.y + objeto.height &&
            this.y + this.height > objeto.y
        );
    }
}

class Moneda {
    constructor() {
        this.x = Math.random() * 700 + 50;
        this.y = Math.random() * 350 + 90;
        this.width = 30;
        this.height = 30;
        this.element = document.createElement("div");
        this.element.classList.add("moneda");
        this.actualizarPosicion();
    }
    actualizarPosicion() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
}

class Rata {
    constructor(side) {
        this.width = 50;
        this.height = 50;
        this.speed = Math.random() * 3 + 3; // Velocidad aleatoria entre 2 y 5
        this.side = side; // "left" o "right"
        this.element = document.createElement("div");
        this.element.classList.add("rata");

        if (side === "left") {
            this.x = -this.width; // Comienza fuera de la pantalla por la izquierda
            this.dx = this.speed; // Mover hacia la derecha
            this.element.classList.add("left");
        } else {
            this.x = 900; // Comienza fuera de la pantalla por la derecha
            this.dx = -this.speed; // Mover hacia la izquierda
        }
        this.y = 490; // Posición vertical

        this.actualizarPosicion();
    }

    actualizarPosicion() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    mover() {
        this.x += this.dx;
        this.actualizarPosicion();
    }

    estaFueraDePantalla() {
        return this.side === "left" ? this.x > 1000 : this.x + this.width < 0;
    }
}

class Ron {
    constructor() {
        this.x = Math.random() * 700 + 50;
        this.y = Math.random() * 350 + 90;
        this.width = 50;
        this.height = 50;
        this.chance = "";
        this.element = document.createElement("div");
        this.element.classList.add("ron");
        this.actualizarPosicion();
    }

    actualizarPosicion() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("start-button");
    if (button) {
        button.addEventListener("click", () => {
            swordSound.play()
            let gameContainer = document.getElementById("game-container");
            let infoContainer = document.getElementById("info-container");
            gameContainer.classList.remove("hide");
            infoContainer.classList.add("hide");
            setTimeout(() => {
                const juego = new Game(); // Iniciar el juego al hacer clic en el botón
                window.addEventListener("keyup", (e) =>
                    juego.personaje.detener(e)
                );
            }, "1000");
        });
    }
});
