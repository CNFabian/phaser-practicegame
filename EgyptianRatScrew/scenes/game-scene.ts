import * as Phaser from 'phaser';
import { SCENE_KEYS, ASSET_KEYS, COLORS, CARD_SCALE, CARD_WIDTH, CARD_HEIGHT, GameState, Player } from '../common';
import { RatScrew } from '../lib/ratscrew';
import { Card } from '../lib/card';

export class GameScene extends Phaser.Scene {
  private game_logic!: RatScrew;
  private centerCardSprite!: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container;
  private player1DeckSprite!: Phaser.GameObjects.Sprite;
  private player2DeckSprite!: Phaser.GameObjects.Sprite;
  private player1CountText!: Phaser.GameObjects.Text;
  private player2CountText!: Phaser.GameObjects.Text;
  private centerCountText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private turnIndicator!: Phaser.GameObjects.Text;
  private challengeText!: Phaser.GameObjects.Text;
  private usingSprites = false;

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  public create(): void {
    this.checkAssets();
    this.createBackground();
    this.initializeGame();
    this.createUI();
    this.setupInput();
    this.updateDisplay();
  }

  private checkAssets(): void {
    // Check if card sprites are available
    this.usingSprites = this.textures.exists(ASSET_KEYS.CARDS);
    if (!this.usingSprites) {
      console.warn('Card sprites not found, using fallback rectangles');
    }
  }

  private createBackground(): void {
    // Green felt background
    this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x0a5f38
    );

    // Table border
    const graphics = this.add.graphics();
    graphics.lineStyle(8, 0x8B4513);
    graphics.strokeRoundedRect(50, 50, this.cameras.main.width - 100, this.cameras.main.height - 100, 20);

    // Playing areas
    this.createPlayingAreas();
  }

  private createPlayingAreas(): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Center pile area
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffd700, 0.5);
    graphics.strokeRoundedRect(
      centerX - (CARD_WIDTH * CARD_SCALE) / 2 - 10,
      centerY - (CARD_HEIGHT * CARD_SCALE) / 2 - 10,
      CARD_WIDTH * CARD_SCALE + 20,
      CARD_HEIGHT * CARD_SCALE + 20,
      5
    );

    // Player 1 area (bottom)
    graphics.strokeRoundedRect(
      100 - 10,
      this.cameras.main.height - 150 - 10,
      CARD_WIDTH * CARD_SCALE + 20,
      CARD_HEIGHT * CARD_SCALE + 20,
      5
    );

    // Player 2 area (top)
    graphics.strokeRoundedRect(
      this.cameras.main.width - 100 - CARD_WIDTH * CARD_SCALE - 10,
      100 - 10,
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

    // Center pile
    this.centerCardSprite = this.createCardDisplay(centerX, centerY, null);

    // Player decks (face down)
    this.player1DeckSprite = this.createDeckBack(100, this.cameras.main.height - 150);
    this.player2DeckSprite = this.createDeckBack(this.cameras.main.width - 100, 100);

    // Card counts
    this.player1CountText = this.add.text(100, this.cameras.main.height - 50, '', {
      fontSize: '24px',
      color: COLORS.WHITE,
      fontStyle: 'bold'
    });

    this.player2CountText = this.add.text(this.cameras.main.width - 100, 50, '', {
      fontSize: '24px',
      color: COLORS.WHITE,
      fontStyle: 'bold'
    }).setOrigin(1, 0);

    this.centerCountText = this.add.text(centerX, centerY + 120, '', {
      fontSize: '20px',
      color: COLORS.GOLD,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Status and turn indicators
    this.statusText = this.add.text(centerX, 50, '', {
      fontSize: '20px',
      color: COLORS.WHITE,
      align: 'center'
    }).setOrigin(0.5);

    this.turnIndicator = this.add.text(centerX, 80, '', {
      fontSize: '18px',
      color: COLORS.GOLD,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.challengeText = this.add.text(centerX, 110, '', {
      fontSize: '18px',
      color: COLORS.RED,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Controls reminder - Moved higher to avoid cutoff
    const controlsReminder = this.add.text(50, this.cameras.main.height - 50, 
      'Player 1: Q=Play, A=Slap | Player 2: P=Play, L=Slap | ESC=Menu', {
      fontSize: '14px', // Smaller font
      color: COLORS.WHITE
    });
    controlsReminder.setAlpha(0.7);

    // Player labels
    this.add.text(100, this.cameras.main.height - 200, 'PLAYER 1', { // Moved higher
      fontSize: '18px',
      color: COLORS.GOLD,
      fontStyle: 'bold'
    });

    this.add.text(this.cameras.main.width - 100, 70, 'PLAYER 2', {
      fontSize: '18px',
      color: COLORS.GOLD,
      fontStyle: 'bold'
    }).setOrigin(1, 0);
  }

  private createCardDisplay(x: number, y: number, card: Card | null): Phaser.GameObjects.Sprite | Phaser.GameObjects.Container {
    if (this.usingSprites && card) {
      const sprite = this.add.sprite(x, y, ASSET_KEYS.CARDS, card.spriteFrame);
      sprite.setScale(CARD_SCALE);
      return sprite;
    } else {
      return this.createCardFallback(x, y, card);
    }
  }

  private createCardFallback(x: number, y: number, card: Card | null): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    if (!card) {
      return container;
    }

    // Card background
    const bg = this.add.rectangle(0, 0, CARD_WIDTH * CARD_SCALE, CARD_HEIGHT * CARD_SCALE, 0xffffff);
    bg.setStrokeStyle(2, 0x000000);

    // Card text
    const text = this.add.text(0, 0, card.display, {
      fontSize: '24px',
      color: card.color === 'red' ? '#ff0000' : '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, text]);
    return container;
  }

  private createDeckBack(x: number, y: number): Phaser.GameObjects.Sprite {
    const sprite = this.add.sprite(x, y, ASSET_KEYS.CARDS, 0); // Back of card
    
    if (!this.usingSprites) {
      // Fallback deck back
      sprite.destroy();
      const container = this.add.container(x, y);
      const bg = this.add.rectangle(0, 0, CARD_WIDTH * CARD_SCALE, CARD_HEIGHT * CARD_SCALE, 0x000080);
      bg.setStrokeStyle(2, 0xffd700);
      const pattern = this.add.text(0, 0, '🂠', {
        fontSize: '32px',
        color: COLORS.GOLD
      }).setOrigin(0.5);
      container.add([bg, pattern]);
      return sprite; // Return the destroyed sprite, container will be used visually
    }
    
    sprite.setScale(CARD_SCALE);
    return sprite;
  }

  private setupInput(): void {
    // Player 1 controls
    this.input.keyboard?.on('keydown-Q', () => {
      this.playCard(1);
    });

    this.input.keyboard?.on('keydown-A', () => {
      this.attemptSlap(1);
    });

    // Player 2 controls
    this.input.keyboard?.on('keydown-P', () => {
      this.playCard(2);
    });

    this.input.keyboard?.on('keydown-L', () => {
      this.attemptSlap(2);
    });

    // Menu control
    this.input.keyboard?.on('keydown-ESC', () => {
      this.returnToMenu();
    });
  }

  private playCard(player: Player): void {
    if (this.game_logic.playCard(player)) {
      this.updateDisplay();
      this.showPlayCardAnimation(player);
    }
  }

  private attemptSlap(player: Player): void {
    const success = this.game_logic.attemptSlap(player);
    this.updateDisplay();
    this.showSlapFeedback(player, success);
  }

  private updateDisplay(): void {
    // Update card counts
    this.player1CountText.setText(`Cards: ${this.game_logic.player1Count}`);
    this.player2CountText.setText(`Cards: ${this.game_logic.player2Count}`);
    this.centerCountText.setText(`Center: ${this.game_logic.centerCount}`);

    // Update center card
    this.centerCardSprite.destroy();
    this.centerCardSprite = this.createCardDisplay(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.game_logic.topCard
    );

    // Update status
    this.statusText.setText(this.game_logic.getGameStatusMessage());

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

  // IMPROVED VERSION: Consistent card size throughout animation
  private showPlayCardAnimation(player: Player): void {
    const startX = player === 1 ? 100 : this.cameras.main.width - 100;
    const startY = player === 1 ? this.cameras.main.height - 150 : 100;
    const endX = this.cameras.main.centerX;
    const endY = this.cameras.main.centerY;

    // Get the card that was just played (top card on center pile)
    const cardBeingPlayed = this.game_logic.topCard;
    
    if (!cardBeingPlayed) {
      // Fallback to blank card if no card found
      const animCard = this.add.rectangle(startX, startY, CARD_WIDTH * CARD_SCALE, CARD_HEIGHT * CARD_SCALE, 0xffffff);
      animCard.setStrokeStyle(2, 0x000000);
      
      this.tweens.add({
        targets: animCard,
        x: endX,
        y: endY,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          animCard.destroy();
        }
      });
      return;
    }

    // Create animated card display showing the actual card at consistent size
    const animatedCardDisplay = this.createCardDisplay(startX, startY, cardBeingPlayed);
    
    // Set depth to ensure it renders on top
    animatedCardDisplay.setDepth(100);
    
    // Animate the card WITHOUT changing scale - maintains consistent size
    this.tweens.add({
      targets: animatedCardDisplay,
      x: endX,
      y: endY,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        animatedCardDisplay.destroy();
      }
    });
  }

  private showSlapFeedback(player: Player, success: boolean): void {
    // Camera shake for impact
    this.cameras.main.shake(200, 0.01);

    // Flash effect
    const flash = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      success ? 0x00ff00 : 0xff0000,
      0.3
    );

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        flash.destroy();
      }
    });

    // Feedback text
    const feedbackText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      success ? 'SLAP SUCCESS!' : 'MISSED!',
      {
        fontSize: '36px',
        color: success ? COLORS.GREEN : COLORS.RED,
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: feedbackText,
      alpha: 0,
      scale: 1.5,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        feedbackText.destroy();
      }
    });
  }

  private showWinScreen(): void {
    // Overlay
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