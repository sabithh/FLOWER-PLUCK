export default class Background {
    constructor(width, height) {
        this.resize(width, height);
        this.particles = [];
        this.generateParticles();
        this.time = 0;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    generateParticles() {
        this.particles = [];
        for (let i = 0; i < 80; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: (Math.random() - 0.5) * 0.2,
                opacity: Math.random() * 0.5 + 0.1,
                pulsateSpeed: Math.random() * 0.05 + 0.01
            });
        }

        // Nebula Clouds
        this.nebulas = [];
        for (let i = 0; i < 5; i++) {
            this.nebulas.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 200 + Math.random() * 300,
                color: i % 2 === 0 ? '#4b0082' : '#00008b', // Indigo and DarkBlue
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                opacity: 0
            });
        }

        // Shooting Stars
        this.shootingStars = [];
    }

    update() {
        this.time += 0.01;

        // Particles
        this.particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            // Wrap around
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;

            // Pulse opacity
            p.opacity = 0.3 + Math.sin(this.time * p.pulsateSpeed * 10) * 0.2;
        });

        // Nebulas
        this.nebulas.forEach(n => {
            n.x += n.vx;
            n.y += n.vy;
            n.opacity = 0.1 + Math.sin(this.time * 0.5 + n.x) * 0.05;

            // Subtle wrap
            if (n.x < -n.radius) n.x = this.width + n.radius;
            if (n.x > this.width + n.radius) n.x = -n.radius;
            if (n.y < -n.radius) n.y = this.height + n.radius;
            if (n.y > this.height + n.radius) n.y = -n.radius;
        });

        // Shooting Stars (Random spawn)
        if (Math.random() < 0.02) {
            this.shootingStars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height * 0.5, // Mostly top half
                vx: -15 - Math.random() * 10,
                vy: 5 + Math.random() * 5,
                length: 100 + Math.random() * 100,
                life: 1.0
            });
        }

        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const s = this.shootingStars[i];
            s.x += s.vx;
            s.y += s.vy;
            s.life -= 0.05;
            if (s.life <= 0) {
                this.shootingStars.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        // Deep space/futuristic gradient
        // Clear canvas for transparency (allows CSS background to show)
        ctx.clearRect(0, 0, this.width, this.height);

        // Deep space/futuristic gradient - REMOVED to show MESTECH background
        // const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        // gradient.addColorStop(0, '#050314');
        // gradient.addColorStop(0.5, '#18122B');
        // gradient.addColorStop(1, '#0f0c29');
        // ctx.fillStyle = gradient;
        // ctx.fillRect(0, 0, this.width, this.height);

        // Draw Nebulas (Subtle Glows)
        ctx.globalCompositeOperation = 'screen';
        this.nebulas.forEach(n => {
            ctx.save();
            ctx.globalAlpha = n.opacity * 0.5; // Softer
            const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
            grad.addColorStop(0, n.color);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        ctx.globalCompositeOperation = 'source-over';

        // Grid removed as requested

        // Draw Shooting Stars (Rare, subtle)
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineCap = 'round';
        this.shootingStars.forEach(s => {
            ctx.globalAlpha = s.life;
            ctx.lineWidth = 2 * s.life;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x - s.vx * 0.2, s.y - s.vy * 0.2); // Trail
            ctx.stroke();

            // Head
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fff';
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(s.x, s.y, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        ctx.restore();

        // Draw Particles
        ctx.fillStyle = '#ffffff';
        this.particles.forEach(p => {
            ctx.globalAlpha = p.opacity;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }
}
