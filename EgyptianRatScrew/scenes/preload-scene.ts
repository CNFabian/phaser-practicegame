import * as Phaser from 'phaser';
import { SCENE_KEYS, ASSET_KEYS, CARD_WIDTH, CARD_HEIGHT, COLORS } from '../common';

export class PreloadScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: SCENE_KEYS.PRELOAD });
  }

  public preload(): void {
    this.createLoadingScreen();
    this.setupLoadingEvents();
    this.loadAssets();
  }

  private createLoadingScreen(): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Title
    this.add.text(centerX, centerY - 100, 'EGYPTIAN RATSCREW', {
      fontSize: '48px',
      color: COLORS.GOLD,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Loading text
    this.loadingText = this.add.text(centerX, centerY, 'Loading assets...', {
      fontSize: '24px',
      color: COLORS.WHITE
    }).setOrigin(0.5);

    // Progress bar background
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222);
    this.progressBox.fillRect(centerX - 160, centerY + 50, 320, 30);

    // Progress bar
    this.progressBar = this.add.graphics();
  }

  private setupLoadingEvents(): void {
    // Update progress bar during loading
    this.load.on('progress', (value: number) => {
      this.updateProgressBar(value);
    });

    // Update loading text for each file
    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      this.loadingText.setText(`Loading: ${file.key}`);
    });

    // Handle loading completion
    this.load.on('complete', () => {
      this.loadingText.setText('Loading complete!');
      this.time.delayedCall(500, () => {
        this.scene.start(SCENE_KEYS.MENU);
      });
    });

    // Handle loading errors
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn(`Failed to load: ${file.key} from ${file.src}`);
      this.loadingText.setText(`Warning: ${file.key} failed to load`);
      this.loadingText.setColor('#ff0000');
    });
  }

  private updateProgressBar(value: number): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.progressBar.clear();
    this.progressBar.fillStyle(0xffd700);
    this.progressBar.fillRect(centerX - 158, centerY + 52, 316 * value, 26);
  }

  private loadAssets(): void {
    // Try to load the card spritesheet
    // Note: The frame dimensions should match the actual spritesheet layout
    try {
      this.load.spritesheet(ASSET_KEYS.CARDS, 'assets/cards.png', {
        frameWidth: CARD_WIDTH,
        frameHeight: CARD_HEIGHT
      });
    } catch (error) {
      console.warn('Card spritesheet not found, will use fallback rendering');
    }

    // Optional: Load other assets if they exist
    this.load.image('background', 'assets/background.png');
    this.load.audio('shuffle', 'assets/sounds/shuffle.mp3');
    this.load.audio('slap', 'assets/sounds/slap.mp3');
    this.load.audio('win', 'assets/sounds/win.mp3');

    // If no files are queued for loading, proceed immediately
    if (this.load.totalToLoad === 0) {
      this.time.delayedCall(100, () => {
        this.scene.start(SCENE_KEYS.MENU);
      });
    }
  }

  public create(): void {
    // This will be called after preload completes
    // The actual scene transition is handled in the load complete event
  }
}