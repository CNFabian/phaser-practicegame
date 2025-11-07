import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './common';
import { PreloadScene } from './scenes/preload-scene';
import { MenuScene } from './scenes/menu-scene';
import { GameScene } from './scenes/game-scene';
const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: COLORS.BACKGROUND,
    scene: [PreloadScene, MenuScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 800,
            height: 600
        },
        max: {
            width: 1600,
            height: 1200
        }
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
function initializeGame() {
    try {
        console.log('Initializing Egyptian Ratscrew game...');
        console.log('Game dimensions:', GAME_WIDTH, 'x', GAME_HEIGHT);
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            loadingElement.remove();
        }
        const game = new Phaser.Game(config);
        window.game = game;
        window.addEventListener('error', (event) => {
            console.error('Game error:', event.error);
        });
        window.addEventListener('resize', () => {
            if (game && game.scale) {
                game.scale.refresh();
            }
        });
        console.log('Egyptian Ratscrew game initialized successfully');
        console.log('Available scenes: PreloadScene, MenuScene, GameScene');
        return game;
    }
    catch (error) {
        console.error('Failed to initialize game:', error);
        const container = document.getElementById('game-container');
        if (container) {
            container.innerHTML = `
        <div style="color: #ff0000; text-align: center; padding: 50px;">
          <h2>Game Failed to Load</h2>
          <p>Error: ${error.message}</p>
          <p>Please check the console for more details.</p>
        </div>
      `;
        }
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
}
else {
    initializeGame();
}
window.addEventListener('load', () => {
    if (!window.game) {
        initializeGame();
    }
});
export { config };
