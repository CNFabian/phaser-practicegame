import * as Phaser from 'phaser';
import { SCENE_KEYS, ASSET_KEYS, CARD_WIDTH, CARD_HEIGHT, COLORS } from '../common';
export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.PRELOAD });
    }
    preload() {
        this.createLoadingScreen();
        this.setupLoadingEvents();
        this.loadAssets();
    }
    createLoadingScreen() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.add.text(centerX, centerY - 100, 'EGYPTIAN RATSCREW', {
            fontSize: '48px',
            color: COLORS.GOLD,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.loadingText = this.add.text(centerX, centerY, 'Loading assets...', {
            fontSize: '24px',
            color: COLORS.WHITE
        }).setOrigin(0.5);
        this.progressBox = this.add.graphics();
        this.progressBox.fillStyle(0x222222);
        this.progressBox.fillRect(centerX - 160, centerY + 50, 320, 30);
        this.progressBar = this.add.graphics();
    }
    setupLoadingEvents() {
        this.load.on('progress', (value) => {
            this.updateProgressBar(value);
        });
        this.load.on('fileprogress', (file) => {
            this.loadingText.setText(`Loading: ${file.key}`);
        });
        this.load.on('complete', () => {
            this.loadingText.setText('Loading complete!');
            this.time.delayedCall(500, () => {
                this.scene.start(SCENE_KEYS.MENU);
            });
        });
        this.load.on('loaderror', (file) => {
            console.warn(`Failed to load: ${file.key} from ${file.src}`);
            this.loadingText.setText(`Warning: ${file.key} failed to load`);
            this.loadingText.setColor('#ff0000');
        });
    }
    updateProgressBar(value) {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.progressBar.clear();
        this.progressBar.fillStyle(0xffd700);
        this.progressBar.fillRect(centerX - 158, centerY + 52, 316 * value, 26);
    }
    loadAssets() {
        try {
            this.load.spritesheet(ASSET_KEYS.CARDS, 'assets/cards.png', {
                frameWidth: CARD_WIDTH,
                frameHeight: CARD_HEIGHT
            });
        }
        catch (error) {
            console.warn('Card spritesheet not found, will use fallback rendering');
        }
        this.load.image('background', 'assets/background.png');
        this.load.audio('shuffle', 'assets/sounds/shuffle.mp3');
        this.load.audio('slap', 'assets/sounds/slap.mp3');
        this.load.audio('win', 'assets/sounds/win.mp3');
        if (this.load.totalToLoad === 0) {
            this.time.delayedCall(100, () => {
                this.scene.start(SCENE_KEYS.MENU);
            });
        }
    }
    create() {
    }
}
