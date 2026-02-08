export default class Petal {
    constructor(centerX, centerY, angle, layer = 0, variation = 0) {
        this.updateCenter(centerX, centerY);
        this.angle = angle;
        this.layer = layer; // 0=outer, 1=middle, 2=inner
        this.variation = variation; // Random seed for organic shapes
        this.reset();

        // Visual properties based on layer
        const scale = 1.0 - (layer * 0.2);
        this.length = 80 * scale + (Math.random() * 10);
        this.width = 40 * scale + (Math.random() * 5);

        // Color variation
        this.hueShift = (Math.random() - 0.5) * 20;
    }

    updateCenter(x, y) {
        this.centerX = x;
        this.centerY = y;
    }

    reset() {
        this.isPlucked = false;
        this.isDragging = false;
        this.offset = 0; // Distance from center
        this.opacity = 1;
        this.velocity = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 }; // Calculated in update
        this.rotation = 0;
        this.rotationSpeed = 0;
    }

    update(cursor, allowInteraction = true) {
        if (this.isPlucked) {
            // Animation for falling/flying away
            this.currentPos.x += this.velocity.x;
            this.currentPos.y += this.velocity.y;
            this.velocity.y += 0.2; // Gravity
            this.velocity.x *= 0.98; // Air resistance

            // Flutter effect
            this.rotation += this.rotationSpeed;
            this.currentPos.x += Math.sin(this.rotation * 2) * 2; // Sway back and forth

            this.opacity -= 0.005;
            return;
        }

        // Calculate base position of petal tip
        const baseDist = 40 - (this.layer * 5); // Inner layers start closer
        const tipX = this.centerX + Math.cos(this.angle) * (baseDist + this.length / 2);
        const tipY = this.centerY + Math.sin(this.angle) * (baseDist + this.length / 2);

        // Check distance of cursor to petal "hitbox" (approximate as circle at petal mid)
        const dist = Math.hypot(cursor.x - tipX, cursor.y - tipY);
        const hoverThreshold = 40;

        // Only start dragging if interaction is allowed
        if (!this.isDragging && dist < hoverThreshold && allowInteraction) {
            this.isDragging = true;
        }

        if (this.isDragging) {
            // Calculate pull distance
            // Project cursor position onto the petal's angle vector
            const vCursor = { x: cursor.x - this.centerX, y: cursor.y - this.centerY };
            // Dot product to find projection length along angle
            const projection = vCursor.x * Math.cos(this.angle) + vCursor.y * Math.sin(this.angle);

            // If dragging outward
            if (projection > baseDist) {
                this.offset = projection - baseDist;
            } else {
                this.offset = 0; // Reset if pushed in (optional)
            }

            // Pluck Threshold
            if (this.offset > 100) {
                this.pluck();
            }

            // Release if cursor moves too far sideways (perpendicular distance)
            // Or just check if cursor is simply far away?
            // "Dragging" without click usually means just following cursor if close enough
            // and within a cone. Let's keep it simple: if cursor moves far closer to center than current offset, release?
            // Actually, requirements say "place cursor on petal and dragging".
            // Since there is no click, we need 'stickiness'.
            // If cursor moves too far away from the line of the petal, we drop it.

            // Perpendicular distance
            // rotated -90 deg vector (-sin, cos)
            const perpDist = Math.abs(vCursor.x * -Math.sin(this.angle) + vCursor.y * Math.cos(this.angle));
            if (perpDist > 60 || projection < baseDist - 20) {
                this.isDragging = false;
                this.offset = 0; // Snap back
            }
        } else {
            // Snap back animation
            this.offset *= 0.8;
            if (this.offset < 1) this.offset = 0;
        }
    }

    pluck() {
        this.isPlucked = true;
        this.isDragging = false;

        // Set initial position to where it is now (roughly)
        // We need to calculate world coordinates of the petal base + offset
        const baseDist = 40 - (this.layer * 5) + this.offset;
        this.currentPos.x = this.centerX + Math.cos(this.angle) * baseDist;
        this.currentPos.y = this.centerY + Math.sin(this.angle) * baseDist;

        // Initial velocity outwards
        const speed = 10;
        this.velocity.x = Math.cos(this.angle) * speed;
        this.velocity.y = Math.sin(this.angle) * speed;
        // Add random for natural feel
        this.velocity.x += (Math.random() - 0.5) * 5;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    draw(ctx) {
        if (this.opacity <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        // Move to center + offset OR currentPos if falling
        if (this.isPlucked) {
            ctx.translate(this.currentPos.x, this.currentPos.y);
            ctx.rotate(this.angle + this.rotation);
        } else {
            const baseDist = 40 - (this.layer * 5) + this.offset;
            ctx.translate(this.centerX, this.centerY);
            ctx.rotate(this.angle);
            ctx.translate(baseDist, 0);
        }

        // Draw Petal Shape
        // Ellipse-like shape with organic variation
        const w = this.width;
        const l = this.length;
        const v = this.variation;

        // Use HSL for easy hue shifting (velvety red base is ~350 deg)
        const hue = 350 + this.hueShift;

        // Gradient with organic color variation
        const grad = ctx.createLinearGradient(0, 0, l, 0);
        grad.addColorStop(0, `hsl(${hue}, 100%, 20%)`); // Dark base
        grad.addColorStop(0.5, `hsl(${hue}, 90%, 40%)`); // Mid body
        grad.addColorStop(1, `hsl(${hue}, 80%, 60%)`); // Lighter tip

        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(0, 0);

        // Add organic waviness based on variation
        const curve1 = -w * 0.6 + Math.sin(v) * 5;
        const curve2 = -w * 0.8 + Math.cos(v) * 5;

        // Curve out
        ctx.bezierCurveTo(l * 0.3, curve1, l * 0.7, curve2, l, 0);
        // Curve back
        ctx.bezierCurveTo(l * 0.7, -curve2, l * 0.3, -curve1, 0, 0);

        ctx.fill();

        // Add Vein Texture with variation
        ctx.strokeStyle = `hsl(${hue}, 100%, 15%)`;
        ctx.lineWidth = 1;
        ctx.globalAlpha = this.opacity * 0.4;
        ctx.beginPath();
        // Central vein with slight curve
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(l * 0.5, Math.sin(v) * 2, l * 0.9, 0);
        ctx.stroke();

        ctx.restore();
    }
}
