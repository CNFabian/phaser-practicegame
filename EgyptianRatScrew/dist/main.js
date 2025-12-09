import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './common';
import { PreloadScene } from './scenes/preload-scene';
import { MenuScene } from './scenes/menu-scene';
import { RulesScene } from './scenes/rules-scene';
import { GameScene } from './scenes/game-scene';
const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: COLORS.BACKGROUND,
    scene: [PreloadScene, MenuScene, RulesScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.NO_CENTER,
    },
    input: {
        keyboard: true,
        mouse: true,
        touch: true
    },
    audio: {
        disableWebAudio: false
    },
    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: true
    },
    disableContextMenu: true
};
function scaleCanvas(canvas, container) {
    const containerRect = container.getBoundingClientRect();
    const aspectRatio = GAME_WIDTH / GAME_HEIGHT;
    let newWidth = containerRect.width;
    let newHeight = containerRect.height;
    if (newWidth / newHeight > aspectRatio) {
        newWidth = newHeight * aspectRatio;
    }
    else {
        newHeight = newWidth / aspectRatio;
    }
    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;
    canvas.style.position = 'absolute';
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
}
function initializeGame() {
    try {
        console.log('Initializing Egyptian Ratscrew game with rules system...');
        console.log('Game dimensions:', GAME_WIDTH, 'x', GAME_HEIGHT);
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            loadingElement.remove();
        }
        if (window.game) {
            console.log('Destroying existing game instance...');
            window.game.destroy(true);
            window.game = null;
        }
        const container = document.getElementById('game-container');
        if (container) {
            const existingCanvases = container.querySelectorAll('canvas');
            existingCanvases.forEach(canvas => canvas.remove());
            container.style.width = '100%';
            container.style.height = '100vh';
            container.style.position = 'relative';
            container.style.overflow = 'hidden';
            container.style.backgroundColor = COLORS.BACKGROUND;
        }
        const game = new Phaser.Game(config);
        window.game = game;
        game.events.once('ready', () => {
            const canvas = game.canvas;
            const container = document.getElementById('game-container');
            if (canvas && container) {
                scaleCanvas(canvas, container);
                let resizeTimeout;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        if (canvas && container) {
                            scaleCanvas(canvas, container);
                        }
                    }, 100);
                });
            }
        });
        window.addEventListener('error', (event) => {
            console.error('Game error:', event.error);
        });
        console.log('Egyptian Ratscrew game initialized successfully');
        return game;
    }
    catch (error) {
        console.error('Failed to initialize game:', error);
        const container = document.getElementById('game-container');
        if (container) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            container.innerHTML = `
        <div style="color: #ff0000; text-align: center; padding: 50px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
          <h2>Game Failed to Load</h2>
          <p>Error: ${errorMessage}</p>
          <p>Please check the console for more details.</p>
        </div>
      `;
        }
        return null;
    }
}
let gameInitialized = false;
function safeInitializeGame() {
    if (gameInitialized) {
        console.log('Game already initialized, skipping...');
        return;
    }
    gameInitialized = true;
    initializeGame();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitializeGame);
}
else {
    safeInitializeGame();
}
export { config };
