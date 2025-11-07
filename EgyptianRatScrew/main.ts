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
function initializeGame(): Phaser.Game | null {
  try {
    console.log('Initializing Egyptian Ratscrew game...');
    console.log('Game dimensions:', GAME_WIDTH, 'x', GAME_HEIGHT);
    
    // Remove loading text
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) {
      loadingElement.remove();
    }
    
    // Create and start the game
    const game = new Phaser.Game(config);
    
    // Store game reference globally for debugging
    window.game = game;
    
    // Global error handling
    window.addEventListener('error', (event) => {
      console.error('Game error:', event.error);
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      if (game && game.scale) {
        game.scale.refresh();
      }
    });
    
    console.log('Egyptian Ratscrew game initialized successfully');
    console.log('Available scenes: PreloadScene, MenuScene, GameScene');
    
    return game;
  } catch (error) {
    console.error('Failed to initialize game:', error);
    
    // Show error message to user
    const container = document.getElementById('game-container');
    if (container) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      container.innerHTML = `
        <div style="color: #ff0000; text-align: center; padding: 50px;">
          <h2>Game Failed to Load</h2>
          <p>Error: ${errorMessage}</p>
          <p>Please check the console for more details.</p>
        </div>
      `;
    }
    
    return null;
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
  });
} else {
  initializeGame();
}

// Also listen for window load as backup
window.addEventListener('load', () => {
  // Only initialize if game hasn't been created yet
  if (!window.game) {
    initializeGame();
  }
});

// Export the game instance for debugging purposes
declare global {
  interface Window {
    game: Phaser.Game;
  }
}

export { config };