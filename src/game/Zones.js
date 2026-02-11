export class Zones {
    constructor(width, height) {
        this.resize(width, height);
    }

    resize(width, height) {
        this.width = width;
        this.height = height;

        this.cx = width / 2;
        this.cy = height / 2;

        // Define radius for the safe circular area
        // Adjust this value to change the size of the safe zone
        this.safeRadius = 250;
    }

    checkCollision(cursor) {
        // Calculate distance from center to cursor
        const dx = cursor.x - this.cx;
        const dy = cursor.y - this.cy;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If distance is greater than radius, we are outside (danger zone)
        return distance > this.safeRadius;
    }

    draw(ctx) {
        // Draw the danger zone (everything outside the circle)
        ctx.save();

        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'; // Faint red for danger
        // Create a path that covers the whole screen but has a hole in the middle
        ctx.rect(0, 0, this.width, this.height);
        ctx.arc(this.cx, this.cy, this.safeRadius, 0, Math.PI * 2, true); // true = anticlockwise for hole
        ctx.fill();

        // Draw the red boundary line
        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.arc(this.cx, this.cy, this.safeRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}
