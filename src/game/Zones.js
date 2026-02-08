export class Zones {
    constructor(width, height) {
        this.resize(width, height);
    }

    resize(width, height) {
        this.width = width;
        this.height = height;

        const cx = width / 2;
        const cy = height / 2;

        // Define safe margin from center (how much space user has)
        const safeRadius = 180; // Distance from center where danger starts

        // We still want 4 distinct "areas" (corners essentially), but bringing them in.
        // Let's make them aggressive.
        // Top-Left Zone
        const z1 = { x: 0, y: 0, w: cx - safeRadius * 0.7, h: cy - safeRadius * 0.7 };
        // Top-Right Zone
        const z2 = { x: cx + safeRadius * 0.7, y: 0, w: cx - safeRadius * 0.7, h: cy - safeRadius * 0.7 };
        // Bottom-Left Zone
        const z3 = { x: 0, y: cy + safeRadius * 0.7, w: cx - safeRadius * 0.7, h: cy - safeRadius * 0.7 };
        // Bottom-Right Zone
        const z4 = { x: cx + safeRadius * 0.7, y: cy + safeRadius * 0.7, w: cx - safeRadius * 0.7, h: cy - safeRadius * 0.7 };

        this.rects = [z1, z2, z3, z4];
    }

    checkCollision(cursor) {
        return this.rects.some(r =>
            cursor.x >= r.x && cursor.x <= r.x + r.w &&
            cursor.y >= r.y && cursor.y <= r.y + r.h
        );
    }

    draw(ctx) {
        // Debug draw to see zones
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        this.rects.forEach(r => {
            ctx.fillRect(r.x, r.y, r.w, r.h);
        });
    }
}
