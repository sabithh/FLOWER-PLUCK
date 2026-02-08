import './style.css'
import Game from './src/game/Game.js'

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);

// Start Screen Logic
const startBtn = document.getElementById('start-btn');
try {
    const startScreen = document.getElementById('start-screen');
    const hud = document.getElementById('hud');

    // Sensitivity Logic
    const sensitivitySlider = document.getElementById('sensitivity-slider');
    const sensitivityValue = document.getElementById('sensitivity-value');

    if (sensitivitySlider && sensitivityValue) {
        sensitivitySlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            sensitivityValue.innerText = val;
            if (game && game.input) {
                game.input.sensitivity = val;
                console.log(`Sensitivity updated to: ${val}`);
            }
        });
    }

    startBtn.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        hud.classList.remove('hidden');
        game.start();
    });

    // Restart Logic
    const restartBtn = document.getElementById('restart-btn');
    const gameOverScreen = document.getElementById('game-over-screen');

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            gameOverScreen.classList.add('hidden');
            game.restart();
        });
    }

    // Expose game over trigger for internal game logic to use
    window.triggerGameOver = (win) => {
        const title = document.getElementById('game-over-title');
        if (title) {
            title.innerText = win ? "Beautiful!" : "Try Again";
            title.style.color = win ? "var(--success-color)" : "var(--danger-color)";
        }
        if (gameOverScreen) {
            gameOverScreen.classList.remove('hidden');
        }
    };

    // Handle resize
    window.addEventListener('resize', () => {
        game.resize();
    });

} catch (e) {
    console.error("Game initialization error:", e);
    alert("Game failed to start (check console): " + e.message);
}
