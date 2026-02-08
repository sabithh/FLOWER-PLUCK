export default class Input {
    constructor(game) {
        this.game = game;
        this.cursor = { x: game.width / 2, y: game.height / 2 };
        this.isMouseDown = false;
        this.sensitivity = 15; // Default sensitivity

        // Mouse Listeners
        window.addEventListener('mousemove', (e) => {
            this.cursor.x = e.clientX;
            this.cursor.y = e.clientY;
        });

        window.addEventListener('mousedown', () => this.isMouseDown = true);
        window.addEventListener('mouseup', () => this.isMouseDown = false);
    }

    update() {
        // Gamepad Support
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        if (gamepads[0]) {
            const gp = gamepads[0];
            // Deadzone
            const deadzone = 0.1;
            let dx = gp.axes[0];
            let dy = gp.axes[1];

            if (Math.abs(dx) < deadzone) dx = 0;
            if (Math.abs(dy) < deadzone) dy = 0;

            // Move cursor based on joystick
            const speed = this.sensitivity;
            this.cursor.x += dx * speed;
            this.cursor.y += dy * speed;

            // Clamp to screen
            this.cursor.x = Math.max(0, Math.min(this.game.width, this.cursor.x));
            this.cursor.y = Math.max(0, Math.min(this.game.height, this.cursor.y));
        }
    }

    draw(ctx) {
        // Draw custom cursor
        ctx.beginPath();
        ctx.arc(this.cursor.x, this.cursor.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
