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
    
    // FIXED: Calculate positions closer to center for decks
    const player1X = 180; // Moved from 100 toward center
    const player2X = this.cameras.main.width - 180; // Moved from width-100 toward center

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

    // Player 1 area (bottom) - FIXED: Updated to match new deck position
    graphics.strokeRoundedRect(
      player1X - (CARD_WIDTH * CARD_SCALE) / 2 - 10,
      this.cameras.main.height - 150 - (CARD_HEIGHT * CARD_SCALE) / 2 - 10,
      CARD_WIDTH * CARD_SCALE + 20,
      CARD_HEIGHT * CARD_SCALE + 20,
      5
    );

    // Player 2 area (top) - FIXED: Updated to match new deck position
    graphics.strokeRoundedRect(
      player2X - (CARD_WIDTH * CARD_SCALE) / 2 - 10,
      150 - (CARD_HEIGHT * CARD_SCALE) / 2 - 10,
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
    
    // FIXED: Calculate deck positions closer to center
    const player1X = 180; // Moved from 100 toward center
    const player2X = this.cameras.main.width - 180; // Moved from width-100 toward center

    // Center pile
    this.centerCardSprite = this.createCardDisplay(centerX, centerY, null);

    // Player decks (face down) - FIXED: Using new positions
    this.player1DeckSprite = this.createDeckBack(player1X, this.cameras.main.height - 150);
    this.player2DeckSprite = this.createDeckBack(player2X, 150);

    // Card counts - FIXED: Updated to match new deck positions
    this.player1CountText = this.add.text(player1X, this.cameras.main.height - 50, '', {
      fontSize: '24px',
      color: COLORS.WHITE,
      fontStyle: 'bold'
    }).setOrigin(0.5, 1);

    this.player2CountText = this.add.text(player2X, 100, '', {
      fontSize: '24px',
      color: COLORS.WHITE,
      fontStyle: 'bold'
    }).setOrigin(0.5, -5);

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

    // Controls reminder - FIXED: Centered at bottom instead of bottom-left
    const controlsReminder = this.add.text(
      centerX, 
      this.cameras.main.height - 30, 
      'Player 1: Q=Play, A=Slap | Player 2: P=Play, L=Slap | ESC=Menu', {
      fontSize: '14px',
      color: COLORS.WHITE
    }).setOrigin(0.5); // FIXED: Now centered
    controlsReminder.setAlpha(0.7);

    // Player labels - FIXED: Updated positions
    this.add.text(player1X, this.cameras.main.height - 240, 'PLAYER 1', {
      fontSize: '18px',
      color: COLORS.GOLD,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(player2X, 70, 'PLAYER 2', {
      fontSize: '18px',
      color: COLORS.GOLD,
      fontStyle: 'bold'
    }).setOrigin(0.5);
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

  // FIXED: Updated animation start positions for new deck locations
  private showPlayCardAnimation(player: Player): void {
    const player1X = 180;
    const player2X = this.cameras.main.width - 180;
    
    const startX = player === 1 ? player1X : player2X;
    const startY = player === 1 ? this.cameras.main.height - 150 : 150;
    const endX = this.cameras.main.centerX;
    const endY = this.cameras.main.centerY;

    // Create temporary card sprite for animation
    const card = this.game_logic.topCard;
    if (!card) return;

    const animCard = this.createCardDisplay(startX, startY, card);
    
    // Animate to center
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
  }

  private showSlapFeedback(player: Player, success: boolean): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    const feedbackText = this.add.text(
      centerX,
      centerY - 100,
      success ? '✓ SLAP!' : '✗ MISS!',
      {
        fontSize: '48px',
        color: success ? COLORS.GOLD : COLORS.RED,
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Animate feedback
    this.tweens.add({
      targets: feedbackText,
      alpha: 0,
      y: centerY - 150,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        feedbackText.destroy();
      }
    });
  }

  private showWinScreen(): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Semi-transparent overlay
    const overlay = this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    );

    // Win panel
    const panel = this.add.rectangle(centerX, centerY, 600, 400, 0x1a1a1a);
    panel.setStrokeStyle(5, 0xffd700);

    // Winner text
    const winnerText = this.add.text(
      centerX,
      centerY - 80,
      `PLAYER ${this.game_logic.winner} WINS!`,
      {
        fontSize: '48px',
        color: COLORS.GOLD,
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Trophy
    const trophy = this.add.text(centerX, centerY, '🏆', {
      fontSize: '96px'
    }).setOrigin(0.5);

    // Instructions
    const instructionsText = this.add.text(
      centerX,
      centerY + 100,
      'Press ESC to return to menu',
      {
        fontSize: '24px',
        color: COLORS.WHITE
      }
    ).setOrigin(0.5);

    // Animate in
    this.tweens.add({
      targets: [overlay, panel, winnerText, trophy, instructionsText],
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Power2'
    });
  }

  private returnToMenu(): void {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }
}