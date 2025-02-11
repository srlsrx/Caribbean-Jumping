class Game {
    constructor() {
        this.container = document.getElementById("game-container");
        this.personaje = null;
        this.monedas = [];
        this.scoreElement = document.getElementById("score");
        this.puntuacion = 0;
        this.crearEscenario();
        this.agregarEventos();
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
                    this.container.removeChild(moneda.element);
                    this.monedas.splice(index, 1);
                    this.puntuacion ++;
                    this.actualizarPuntuacion();
                }
            });
        }, 100);
    }
    actualizarPuntuacion() {
        this.scoreElement.textContent = this.puntuacion;
    }
}

class Personaje {
    constructor() {
        this.x = 50;
        this.y = 400;
        this.width = 120;
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
    }
    mover(evento) {
        if (evento.key === "ArrowRight") {
            this.x += this.velocidad;
            this.element.classList.remove("left")
        } else if (evento.key === "ArrowLeft") {
            this.x -= this.velocidad;
            this.element.classList.add("left")
        } else if (evento.key === "ArrowUp") {
            this.saltar();
        }
        this.actualizarPosicion();
    }
    saltar() {
        if (!this.saltando && (this.puedeSaltarEnAire || !this.cayendo)) {
            if (this.cayendo) {
                this.puedeSaltarEnAire = false;  // Ya usó el salto en el aire
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
                this.y = 400;
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
    constructor(){
        this.x = Math.random() * 700 + 50;
        this.y = Math.random() * 350 + 50;
        this.width = 30;
        this.height = 30;
        this.element = document.createElement("div");
        this.element.classList.add("moneda");
        this.actualizarPosicion();
    }
    actualizarPosicion(){
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
}

const juego = new Game();