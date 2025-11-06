import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './common';
import { PreloadScene } from './scenes/preload-scene';
import { MenuScene } from './scenes/menu-scene';
import { GameScene } from './scenes/game-scene';

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: COLORS.BACKGROUND,
  
  // Scene configuration
  scene: [PreloadScene, MenuScene, GameScene],
  
  // Physics (not needed for this game, but keeping for potential future use)
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false
    }
  },
  
  // Scaling and display options
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
  
  // Input configuration
  input: {
    keyboard: true,
    mouse: true,
    touch: true
  },
  
  // Audio configuration
  audio: {
    disableWebAudio: false
  },
  
  // Performance settings
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true
  },
  
  // Disable right-click context menu
  disableContextMenu: true
};

// Initialize the game
window.addEventListener('load', () => {
  // Remove loading text
  const loadingElement = document.querySelector('.loading');
  if (loadingElement) {
    loadingElement.remove();
  }
  
  // Create and start the game
  const game = new Phaser.Game(config);
  
  // Global error handling
  window.addEventListener('error', (event) => {
    console.error('Game error:', event.error);
  });
  
  // Prevent the game from being paused when the tab loses focus
  game.scale.on('resize', () => {
    game.scale.refresh();
  });
  
  // Log game initialization
  console.log('Egyptian Ratscrew game initialized');
  console.log('Game dimensions:', GAME_WIDTH, 'x', GAME_HEIGHT);
  console.log('Available scenes:', config.scene?.map(scene => scene.constructor.name));
});

// Export the game instance for debugging purposes
declare global {
  interface Window {
    game: Phaser.Game;
  }
}

export { config };