import './style.css'
import Game from './src/game/Game.js'

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);

// Start Screen Logic
const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const hud = document.getElementById('hud');

startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    game.start();
});

// Restart Logic
const restartBtn = document.getElementById('restart-btn');
const gameOverScreen = document.getElementById('game-over-screen');

restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    game.restart();
});

// Expose game over trigger for internal game logic to use
window.triggerGameOver = (win) => {
    const title = document.getElementById('game-over-title');
    title.innerText = win ? "Beautiful!" : "Try Again";
    title.style.color = win ? "var(--success-color)" : "var(--danger-color)";
    
    gameOverScreen.classList.remove('hidden');
};

// Handle resize
window.addEventListener('resize', () => {
    game.resize();
});
