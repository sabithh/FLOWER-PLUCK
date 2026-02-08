import Petal from './Petal.js';

export default class Flower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.centerRadius = 40;
        this.petals = [];
        this.generatePetals();
    }

    generatePetals() {
        this.petals = [];
        // Layer 0: Outer (Large)
        // Layer 1: Middle
        // Layer 2: Inner (Small)

        const layers = [
            { count: 8, layerId: 0 },
            { count: 6, layerId: 1 },
            { count: 5, layerId: 2 }
        ];

        layers.forEach(layer => {
            const count = layer.count;
            const offset = (layer.layerId % 2) * (Math.PI / count); // Rotate slighty for natural overlap

            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 / count) * i + offset;
                // Add random variation to angle
                const angleVar = angle + (Math.random() - 0.5) * 0.1;
                this.petals.push(new Petal(this.x, this.y, angleVar, layer.layerId, Math.random() * 100));
            }
        });

        // Sort petals so inner ones render on Top (or bottom? check draw order)
        // We want Outer drawn first (bottom), Inner last (top)
        // Actually for plucking, hit detection might need to favor top ones.
        // But for drawing: Outer (0) -> Middle (1) -> Inner (2) is correct Painter's algo?
        // Wait, if Inner are smaller, they sit ON TOP of Outer.
        // So Draw Order: Layer 0, Layer 1, Layer 2. YES.
        this.petals.sort((a, b) => a.layer - b.layer);
    }

    reset() {
        this.generatePetals();
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
        this.petals.forEach(p => p.updateCenter(x, y));
    }

    regeneratePetal() {
        // Find a plucked petal and restore it
        const plucked = this.petals.find(p => p.isPlucked);
        if (plucked) {
            plucked.reset();
        }
    }

    isFullyPlucked() {
        return this.petals.every(p => p.isPlucked);
    }

    update(cursor) {
        // Strict Single Petal Interaction Policy

        // 1. Is there a petal already being dragged?
        const draggingPetal = this.petals.find(p => p.isDragging);

        if (draggingPetal) {
            // If yes, ONLY update the dragging petal with interaction allowed.
            // Others update with allowInteraction = false (so they still animate falling etc)
            this.petals.forEach(p => {
                p.update(cursor, p === draggingPetal);
            });
            return;
        }

        // 2. If node is dragging, find the BEST candidate to hover/start dragging
        // We iterate reversed (Top-Most layers first)
        const reversedPetals = [...this.petals].reverse();
        let candidateFound = false;

        reversedPetals.forEach(p => {
            if (!candidateFound && !p.isPlucked) {
                // Check if cursor is close enough to potentially interact
                // We need to peek at 'dist' but that reasoning is inside Petal class normally.
                // We can just pass 'true' to the first one that COULD interact if we trust hitboxes?
                // Simpler: iterate all, checking hitboxes externally? No, encapsulation.

                // Strategy: We pass 'allowInteraction=true' ONLY to the first valid unplucked petal 
                // we encounter in Z-order that is under the cursor? 
                // Or just pass 'true' to the first unplucked one and 'false' to rest?
                // No, cursor might be over the 3rd petal down, not top one.

                // Let's pass 'allowInteraction=true' to ALL, but rely on the fact that 
                // we only want ONE to set 'isDragging = true' this frame.

                // Wait, easiest fix:
                // Update all petals.
                // If any reports it STARTED dragging this frame, we should invalidate others?
                // But they are already updated.

                // Better: Check hitboxes manually here to find "The One".
                // Copy simple distance check from Petal.js to pick one.
                const baseDist = 40 - (p.layer * 5); // Approx
                const tipX = p.centerX + Math.cos(p.angle) * (baseDist + p.length / 2);
                const tipY = p.centerY + Math.sin(p.angle) * (baseDist + p.length / 2);
                const dist = Math.hypot(cursor.x - tipX, cursor.y - tipY);

                if (dist < 50) { // Slightly generous hit test
                    p.update(cursor, true);
                    candidateFound = true; // Block others below it
                } else {
                    p.update(cursor, false);
                }
            } else {
                p.update(cursor, false);
            }
        });
    }

    draw(ctx) {
        // Draw realistic stem
        const stemStartX = this.x;
        const stemStartY = this.y;
        const stemEndX = this.x - 20;
        const stemEndY = this.y + 300;
        const stemMidX = this.x;
        const stemMidY = this.y + 100;

        // Main stem with gradient (3D effect)
        ctx.save();

        // Draw shadow/dark side first
        ctx.strokeStyle = '#6B8E23'; // Darker olive
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(stemStartX - 2, stemStartY);
        ctx.quadraticCurveTo(stemMidX - 2, stemMidY, stemEndX - 2, stemEndY);
        ctx.stroke();

        // Main stem body
        const stemGrad = ctx.createLinearGradient(stemStartX - 10, 0, stemStartX + 10, 0);
        stemGrad.addColorStop(0, '#556B2F'); // Dark olive green (shadow side)
        stemGrad.addColorStop(0.5, '#8BC34A'); // Light green (main color)
        stemGrad.addColorStop(1, '#AED581'); // Lighter green (highlight side)

        ctx.strokeStyle = stemGrad;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(stemStartX, stemStartY);
        ctx.quadraticCurveTo(stemMidX, stemMidY, stemEndX, stemEndY);
        ctx.stroke();

        // Add highlight stripe
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(stemStartX + 2, stemStartY);
        ctx.quadraticCurveTo(stemMidX + 2, stemMidY, stemEndX + 2, stemEndY);
        ctx.stroke();

        ctx.restore();

        // Draw petals
        this.petals.forEach(p => p.draw(ctx));

        // Draw center (Realistic)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.centerRadius, 0, Math.PI * 2);

        const centerGrad = ctx.createRadialGradient(this.x, this.y, 5, this.x, this.y, this.centerRadius);
        centerGrad.addColorStop(0, '#8B4500'); // Dark Ocre
        centerGrad.addColorStop(1, '#DAA520'); // Goldenrod
        ctx.fillStyle = centerGrad;
        ctx.fill();

        // Pollen Texture
        ctx.fillStyle = 'rgba(139, 69, 19, 0.6)'; // SaddleBrown
        for (let i = 0; i < 40; i++) {
            let dist = Math.random() * this.centerRadius * 0.9;
            let ang = Math.random() * Math.PI * 2;
            let rx = this.x + Math.cos(ang) * dist;
            let ry = this.y + Math.sin(ang) * dist;
            ctx.beginPath();
            ctx.arc(rx, ry, 2 + Math.random(), 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
