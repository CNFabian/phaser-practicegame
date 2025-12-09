import * as Phaser from 'phaser';
import { SCENE_KEYS, ASSET_KEYS, COLORS, CARD_SCALE, CARD_WIDTH, CARD_HEIGHT, GameState, Player, Suit } from '../common';
import { RatScrew } from '../lib/ratscrew';
import { Card } from '../lib/card';

export class GameScene extends Phaser.Scene {
  private game_logic!: RatScrew;
  private player1DeckSprite!: Phaser.GameObjects.Image;
  private player2DeckSprite!: Phaser.GameObjects.Image;
  private centerCardSprite!: Phaser.GameObjects.Image | Phaser.GameObjects.Container;
  private bonusPileSprite!: Phaser.GameObjects.Rectangle;
  
  // UI Text elements
  private player1CountText!: Phaser.GameObjects.Text;
  private player2CountText!: Phaser.GameObjects.Text;
  private centerCountText!: Phaser.GameObjects.Text;
  private bonusCountText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private turnIndicator!: Phaser.GameObjects.Text;
  private challengeText!: Phaser.GameObjects.Text;
  private pileCollectionText!: Phaser.GameObjects.Text;

  private usingSprites: boolean = false;

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  create(): void {
    this.checkAssets();
    this.createBackground();
    this.initializeGame();
    this.createUI();
    this.setupInput();
    this.updateDisplay();
  }

  private checkAssets(): void {
    this.usingSprites = this.textures.exists(ASSET_KEYS.CARDS);
    if (!this.usingSprites) {
      console.warn('Card sprites not found, using fallback rectangles');
    }
  }

  private createBackground(): void {
    // Main background
    this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x0a5f38
    );

    // Decorative border
    const graphics = this.add.graphics();
    graphics.lineStyle(8, 0x8B4513);
    graphics.strokeRoundedRect(
      50, 50,
      this.cameras.main.width - 100,
      this.cameras.main.height - 100,
      20
    );

    this.createPlayingAreas();
  }

  private createPlayingAreas(): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffd700, 0.5);

    // Center pile area
    graphics.strokeRoundedRect(
      centerX - (CARD_WIDTH * CARD_SCALE) / 2 - 10,
      centerY - (CARD_HEIGHT * CARD_SCALE) / 2 - 10,
      CARD_WIDTH * CARD_SCALE + 20,
      CARD_HEIGHT * CARD_SCALE + 20,
      5
    );

    // Player 1 deck area (bottom)
    graphics.strokeRoundedRect(
      100 - 10,
      this.cameras.main.height - 150 - (CARD_HEIGHT * CARD_SCALE) / 2 - 10,
      CARD_WIDTH * CARD_SCALE + 20,
      CARD_HEIGHT * CARD_SCALE + 20,
      5
    );

    // Player 2 deck area (top)
    graphics.strokeRoundedRect(
      this.cameras.main.width - 100 - (CARD_WIDTH * CARD_SCALE) / 2 - 10,
      150 - (CARD_HEIGHT * CARD_SCALE) / 2 - 10,
      CARD_WIDTH * CARD_SCALE + 20,
      CARD_HEIGHT * CARD_SCALE + 20,
      5
    );

    // Bonus pile area (right side)
    graphics.strokeRoundedRect(
      this.cameras.main.width - 200 - 10,
      centerY - (CARD_HEIGHT * CARD_SCALE) / 2 - 10,
      CARD_WIDTH * CARD_SCALE + 20,
      CARD_HEIGHT * CARD_SCALE + 20,
      5
    );
  }

  private initializeGame(): void {
    this.game_logic = new RatScrew();
  }

  private createUI(): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Create card sprites
    this.centerCardSprite = this.createCardDisplay(centerX, centerY, null);
    this.player1DeckSprite = this.createCardDisplay(100, this.cameras.main.height - 150, null) as any;
    this.player2DeckSprite = this.createCardDisplay(this.cameras.main.width - 100, 150, null) as any;
    
    // Bonus pile (initially hidden)
    this.bonusPileSprite = this.add.rectangle(
      this.cameras.main.width - 200,
      centerY,
      CARD_WIDTH * CARD_SCALE,
      CARD_HEIGHT * CARD_SCALE,
      0x4169E1
    );
    this.bonusPileSprite.setStrokeStyle(2, 0x000080);
    this.bonusPileSprite.setVisible(false);

    // Card count displays
    this.player1CountText = this.add.text(100, this.cameras.main.height - 50, 'Cards: 26', {
      fontSize: '18px',
      color: COLORS.WHITE,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.player2CountText = this.add.text(this.cameras.main.width - 100, 50, 'Cards: 26', {
      fontSize: '18px',
      color: COLORS.WHITE,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.centerCountText = this.add.text(centerX, centerY + 80, 'Center: 0', {
      fontSize: '16px',
      color: COLORS.GOLD,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.bonusCountText = this.add.text(this.cameras.main.width - 200, centerY + 80, 'Bonus: 0', {
      fontSize: '16px',
      color: '#4169E1', // Royal blue color
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Status and instructions
    this.statusText = this.add.text(centerX, this.cameras.main.height - 100, 'Game ready', {
      fontSize: '16px',
      color: COLORS.WHITE,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.turnIndicator = this.add.text(centerX, 100, "Player 1's Turn", {
      fontSize: '24px',
      color: COLORS.GOLD,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.challengeText = this.add.text(centerX, 130, '', {
      fontSize: '16px',
      color: COLORS.RED,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Pile collection indicator (initially hidden)
    this.pileCollectionText = this.add.text(centerX, centerY - 100, '', {
      fontSize: '20px',
      color: COLORS.GREEN,
      fontStyle: 'bold',
      stroke: COLORS.BLACK,
      strokeThickness: 3
    }).setOrigin(0.5);
    this.pileCollectionText.setVisible(false);

    // Control instructions
    const controlsText = this.add.text(centerX, this.cameras.main.height - 30, 
      'Player 1: Q=Play, A=Slap | Player 2: P=Play, L=Slap | ESC=Menu', {
      fontSize: '14px',
      color: COLORS.LIGHT_GRAY
    }).setOrigin(0.5);
  }

  private setupInput(): void {
    if (!this.input.keyboard) return;

    // Player 1 controls
    this.input.keyboard.on('keydown-Q', () => this.playCard(1));
    this.input.keyboard.on('keydown-A', () => this.attemptSlap(1));

    // Player 2 controls
    this.input.keyboard.on('keydown-P', () => this.playCard(2));
    this.input.keyboard.on('keydown-L', () => this.attemptSlap(2));

    // Menu
    this.input.keyboard.on('keydown-ESC', () => this.returnToMenu());
  }

  private createCardDisplay(x: number, y: number, card: Card | null): Phaser.GameObjects.Image | Phaser.GameObjects.Container {
    if (!card) {
      // Empty placeholder
      const rect = this.add.rectangle(x, y, CARD_WIDTH * CARD_SCALE, CARD_HEIGHT * CARD_SCALE, 0x333333, 0.3);
      rect.setStrokeStyle(2, 0x666666);
      return rect as any;
    }

    // Check if we have card textures loaded
    const textureName = `card-${card.suit.toLowerCase()}-${card.rank.toLowerCase()}`;
    
    if (this.textures.exists(textureName)) {
      // Use actual card image
      const cardSprite = this.add.image(x, y, textureName);
      cardSprite.setScale(CARD_SCALE);
      return cardSprite;
    } else {
      // Fallback: Create simple card representation
      const container = this.add.container(x, y);
      
      const cardBg = this.add.rectangle(0, 0, CARD_WIDTH * CARD_SCALE, CARD_HEIGHT * CARD_SCALE, 0xffffff);
      cardBg.setStrokeStyle(2, 0x000000);
      
      // FIX: Use proper Suit enum comparison instead of string literals
      const suitColor = (card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS) ? 
        0xff0000 : 0x000000;
      
      const rankText = this.add.text(0, -15, card.displayValue, {
        fontSize: '16px',
        color: `#${suitColor.toString(16).padStart(6, '0')}`,
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      const suitText = this.add.text(0, 5, card.displaySuit, {
        fontSize: '20px',
        color: `#${suitColor.toString(16).padStart(6, '0')}`,
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      container.add([cardBg, rankText, suitText]);
      return container;
    }
  }

  private playCard(player: Player): void {
    if (this.game_logic.playCard(player)) {
      // Show animation first
      this.showPlayCardAnimation(player);
      
      // Update display (counts and other UI immediately, center card after animation)
      this.updateDisplayWithoutCenterCard();
    }
  }

  private attemptSlap(player: Player): void {
    const success = this.game_logic.attemptSlap(player);
    this.updateDisplay();
    this.showSlapFeedback(player, success);
  }

  private updateDisplayWithoutCenterCard(): void {
    // Update card counts
    this.player1CountText.setText(`Cards: ${this.game_logic.player1Count}`);
    this.player2CountText.setText(`Cards: ${this.game_logic.player2Count}`);
    this.centerCountText.setText(`Center: ${this.game_logic.centerCount}`);
    
    // Update bonus pile
    const bonusCount = this.game_logic.bonusCount;
    this.bonusCountText.setText(`Bonus: ${bonusCount}`);
    this.bonusPileSprite.setVisible(bonusCount > 0);

    // Update status
    this.statusText.setText(this.game_logic.getGameStatusMessage());

    // Update pile collection indicator
    if (this.game_logic.pileAwaitingCollection && this.game_logic.pileWinner) {
      this.pileCollectionText.setText(`Player ${this.game_logic.pileWinner}: SLAP TO COLLECT!`);
      this.pileCollectionText.setVisible(true);
      
      // Add pulsing animation
      this.tweens.add({
        targets: this.pileCollectionText,
        scale: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    } else {
      this.pileCollectionText.setVisible(false);
      this.tweens.killTweensOf(this.pileCollectionText);
      this.pileCollectionText.setScale(1);
    }

    // Update turn indicator
    if (this.game_logic.gameState === GameState.PLAYING) {
      this.turnIndicator.setText(`Player ${this.game_logic.currentPlayer}'s Turn`);
      this.challengeText.setText('');
    } else if (this.game_logic.gameState === GameState.CHALLENGE) {
      this.turnIndicator.setText(`Challenge Mode`);
      this.challengeText.setText(`Player ${this.game_logic.challengePlayer} has ${this.game_logic.challengeRemaining} chances`);
    } else if (this.game_logic.gameState === GameState.GAME_OVER) {
      this.turnIndicator.setText(`GAME OVER!`);
      this.challengeText.setText(`Player ${this.game_logic.winner} Wins!`);
      this.showWinScreen();
    }

    // Update deck visibility
    this.player1DeckSprite.setVisible(this.game_logic.player1Count > 0);
    this.player2DeckSprite.setVisible(this.game_logic.player2Count > 0);
  }

  private updateDisplay(): void {
    // Update all the non-center card elements first
    this.updateDisplayWithoutCenterCard();
    
    // Update center card
    this.centerCardSprite.destroy();
    this.centerCardSprite = this.createCardDisplay(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.game_logic.topCard
    );
  }

  private showPlayCardAnimation(player: Player): void {
    const player1X = 180;
    const player2X = this.cameras.main.width - 180;
    
    const startX = player === 1 ? player1X : player2X;
    const startY = player === 1 ? this.cameras.main.height - 150 : 150;
    const endX = this.cameras.main.centerX;
    const endY = this.cameras.main.centerY;

    const card = this.game_logic.topCard;
    if (!card) return;

    const animCard = this.createCardDisplay(startX, startY, card) as any;

    this.tweens.add({
      targets: animCard,
      x: endX,
      y: endY,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        animCard.destroy();
        // Update center card after animation completes
        this.centerCardSprite.destroy();
        this.centerCardSprite = this.createCardDisplay(endX, endY, card);
      }
    });
  }

  // IMPROVED: Clean text-only slap feedback animation
  private showSlapFeedback(player: Player, success: boolean): void {
    // REMOVED: Flash overlay - keeping only text feedback
    
    // ENHANCED FEEDBACK TEXT with text-only shake animation
    const feedbackText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      success ? 'GOOD SLAP!' : 'BAD SLAP!',
      {
        fontSize: '36px',
        color: success ? COLORS.GREEN : COLORS.RED,
        fontStyle: 'bold',
        stroke: COLORS.BLACK,
        strokeThickness: 4
      }
    ).setOrigin(0.5);

    // Store original position for shake effect
    const originalX = feedbackText.x;
    const originalY = feedbackText.y;

    // TEXT-ONLY SHAKE: Smooth oscillating shake just for the text
    const shakeIntensity = success ? 2 : 4; // Gentle shake for good slap, stronger for bad
    const shakeDuration = success ? 300 : 500;
    
    this.tweens.add({
      targets: feedbackText,
      x: originalX + shakeIntensity,
      duration: shakeDuration / 12, // Quick oscillations
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: 11 // Creates 6 complete shake cycles
      // REMOVED: onComplete that was forcing text back to original position
    });

    // Pop-in effect (scale animation)
    feedbackText.setScale(0);
    this.tweens.add({
      targets: feedbackText,
      scale: 1.2,
      duration: 150,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Then scale back to normal and move up
        this.tweens.add({
          targets: feedbackText,
          scale: 1,
          y: feedbackText.y - 30,
          duration: 200,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            // FIXED: Stop the shake animation when scaling/movement is complete
            // Kill all tweens on the feedbackText object
            this.tweens.killTweensOf(feedbackText);
            
            // Start fade-out from current transformed position
            this.tweens.add({
              targets: feedbackText,
              alpha: 0,
              duration: 1200,
              delay: 200, // Short delay before fading
              ease: 'Cubic.easeIn',
              onComplete: () => {
                feedbackText.destroy();
              }
            });
          }
        });
      }
    });

    // REMOVED: Border pulse effect for cleaner feedback
  }

  private showWinScreen(): void {
    // Semi-transparent overlay
    const overlay = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.8
    );

    // Win text
    const winText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      `PLAYER ${this.game_logic.winner} WINS!`,
      {
        fontSize: '48px',
        color: COLORS.GOLD,
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Continue instruction
    const continueText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 50,
      'Press SPACE to play again or ESC for menu',
      {
        fontSize: '20px',
        color: COLORS.WHITE
      }
    ).setOrigin(0.5);

    // Handle restart
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.scene.restart();
    });
  }

  private returnToMenu(): void {
    this.scene.start(SCENE_KEYS.MENU);
  }
}