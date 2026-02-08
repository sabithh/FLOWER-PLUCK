import Input from './Input.js';
import Flower from './Flower.js';
import { Zones } from './Zones.js';
import Background from './Background.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth;
        this.height = canvas.height = window.innerHeight;

        this.background = new Background(this.width, this.height);
        this.input = new Input(this);
        this.flower = new Flower(this.width / 2, this.height / 2);
        this.zones = new Zones(this.width, this.height);

        this.isRunning = false;
        this.lastTime = 0;
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    restart() {
        this.flower.reset();
        this.start();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.background.resize(this.width, this.height);
        this.flower.updatePosition(this.width / 2, this.height / 2);
        this.zones.resize(this.width, this.height);
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(deltaTime) {
        this.background.update();
        this.input.update();

        // Check danger zones
        if (this.zones.checkCollision(this.input.cursor)) {
            this.flower.regeneratePetal();
        }

        this.flower.update(this.input.cursor);

        // Update UI
        const countSpan = document.getElementById('petal-count');
        if (countSpan) countSpan.innerText = this.flower.petals.filter(p => !p.isPlucked).length;

        // Check Win Condition
        if (this.flower.isFullyPlucked()) {
            this.isRunning = false;
            window.triggerGameOver(true);
        }
    }

    draw() {
        // Draw Background
        this.background.draw(this.ctx);

        // Draw Zones (Debug or Subtle)
        // this.zones.draw(this.ctx); // Hidden as requested, but logic exists

        // Draw Flower
        this.flower.draw(this.ctx);

        // Draw Cursor
        this.input.draw(this.ctx);
    }
}
