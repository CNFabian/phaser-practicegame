import * as Phaser from 'phaser';
import { RatScrew } from '../lib/ratscrew';
import { Card } from '../lib/card';
import { 
  SCENE_KEYS, 
  COLORS, 
  CARD_WIDTH, 
  CARD_HEIGHT, 
  CARD_SCALE,
  GameState,
  Player
} from '../common';

export class GameScene extends Phaser.Scene {
  private game_logic!: RatScrew;
  
  // UI Elements
  private player1CountText!: Phaser.GameObjects.Text;
  private player2CountText!: Phaser.GameObjects.Text;
  private centerCountText!: Phaser.GameObjects.Text;
  private bonusCountText!: Phaser.GameObjects.Text;
  private turnIndicator!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private challengeText!: Phaser.GameObjects.Text;
  private instructionsText!: Phaser.GameObjects.Text;
  private pileCollectionText!: Phaser.GameObjects.Text;
  
  // Card Sprites
  private player1DeckSprite!: Phaser.GameObjects.Image;
  private player2DeckSprite!: Phaser.GameObjects.Image;
  private centerCardSprite!: Phaser.GameObjects.Image | Phaser.GameObjects.Container;
  private bonusPileSprite!: Phaser.GameObjects.Image;

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  create(): void {
    // Initialize game logic
    this.game_logic = new RatScrew();

    // Set up background
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    // Create visual elements
    this.createPlayingAreas();
    this.createUI();
    this.setupInputHandlers();

    // Initial display update
    this.updateDisplay();
  }

  private createPlayingAreas(): void {
    const graphics = this.add.graphics();
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    // Calculate deck positions
    const player1X = 180;
    const player2X = this.cameras.main.width - 180;

    // Center pile area (green felt)
    graphics.fillStyle(0x0a5f0a, 1);
    graphics.fillRoundedRect(
      centerX - 150,
      centerY - 150,
      300,
      300,
      10
    );

    // Player 1 area (bottom)
    graphics.lineStyle(4, COLORS.GOLD, 1);
    graphics.strokeRoundedRect(
      player1X - (CARD_WIDTH * CARD_SCALE) / 2 - 10,
      this.cameras.main.height - 150 - (CARD_HEIGHT * CARD_SCALE) / 2 - 10,
      CARD_WIDTH * CARD_SCALE + 20,
      CARD_HEIGHT * CARD_SCALE + 20,
      5
    );

    // Player 2 area (top)
    graphics.strokeRoundedRect(
      player2X - (CARD_WIDTH * CARD_SCALE) / 2 - 10,
      150 - (CARD_HEIGHT * CARD_SCALE) / 2 - 10,
      CARD_WIDTH * CARD_SCALE + 20,
      CARD_HEIGHT * CARD_SCALE + 20,
      5
    );
    
    // Bonus pile area (to the right of center)
    graphics.lineStyle(3, COLORS.ORANGE, 1);
    graphics.strokeRoundedRect(
      centerX + 180 - (CARD_WIDTH * CARD_SCALE) / 2 - 10,
      centerY - (CARD_HEIGHT * CARD_SCALE) / 2 - 10,
      CARD_WIDTH * CARD_SCALE + 20,
      CARD_HEIGHT * CARD_SCALE + 20,
      5
    );
  }

  private createUI(): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    const player1X = 180;
    const player2X = this.cameras.main.width - 180;

    // Center pile
    this.centerCardSprite = this.createCardDisplay(centerX, centerY, null);
    
    // Bonus pile (to the right of center)
    this.bonusPileSprite = this.createDeckBack(centerX + 180, centerY);
    this.bonusPileSprite.setVisible(false);

    // Player decks (face down)
    this.player1DeckSprite = this.createDeckBack(player1X, this.cameras.main.height - 150);
    this.player2DeckSprite = this.createDeckBack(player2X, 150);

    // Player labels
    this.add.text(player1X, this.cameras.main.height - 200, 'PLAYER 1', {
      fontSize: '20px',
      color: COLORS.WHITE,
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    this.add.text(player2X, 200, 'PLAYER 2', {
      fontSize: '20px',
      color: COLORS.WHITE,
      fontStyle: 'bold'
    }).setOrigin(0.5, 1);

    // Card counts
    this.player1CountText = this.add.text(player1X, this.cameras.main.height - 100, '', {
      fontSize: '24px',
      color: COLORS.WHITE,
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    this.player2CountText = this.add.text(player2X, 100, '', {
      fontSize: '24px',
      color: COLORS.WHITE,
      fontStyle: 'bold'
    }).setOrigin(0.5, 1);

    this.centerCountText = this.add.text(centerX, centerY + 120, '', {
      fontSize: '20px',
      color: COLORS.WHITE,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Bonus pile count
    this.bonusCountText = this.add.text(centerX + 180, centerY + 80, 'Bonus: 0', {
      fontSize: '18px',
      color: COLORS.ORANGE,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Turn indicator
    this.turnIndicator = this.add.text(centerX, 50, '', {
      fontSize: '28px',
      color: COLORS.GOLD,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Challenge text
    this.challengeText = this.add.text(centerX, 90, '', {
      fontSize: '20px',
      color: COLORS.RED,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Status text
    this.statusText = this.add.text(centerX, centerY - 180, '', {
      fontSize: '18px',
      color: COLORS.WHITE,
      align: 'center',
      wordWrap: { width: 500 }
    }).setOrigin(0.5);

    // Pile collection text
    this.pileCollectionText = this.add.text(centerX, centerY + 160, '', {
      fontSize: '24px',
      color: COLORS.GOLD,
      fontStyle: 'bold',
      stroke: COLORS.BLACK,
      strokeThickness: 4
    }).setOrigin(0.5);
    this.pileCollectionText.setVisible(false);

    // Instructions (centered at bottom)
    this.instructionsText = this.add.text(
      centerX,
      this.cameras.main.height - 50,
      'Player 1: Q (Play) | A (Slap)  ||  Player 2: P (Play) | L (Slap)  ||  ESC (Menu)',
      {
        fontSize: '16px',
        color: COLORS.LIGHT_GRAY,
        align: 'center'
      }
    ).setOrigin(0.5);
  }

  private setupInputHandlers(): void {
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
      
      const suitColor = (card.suit === 'Hearts' || card.suit === 'Diamonds') ? 0xff0000 : 0x000000;
      const rankText = this.add.text(0, -10, card.displayValue, {
        fontSize: '32px',
        color: `#${suitColor.toString(16).padStart(6, '0')}`,
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      const suitSymbols: { [key: string]: string } = {
        'Hearts': '♥',
        'Diamonds': '♦',
        'Clubs': '♣',
        'Spades': '♠'
      };
      
      const suitText = this.add.text(0, 15, suitSymbols[card.suit], {
        fontSize: '24px',
        color: `#${suitColor.toString(16).padStart(6, '0')}`
      }).setOrigin(0.5);
      
      container.add([cardBg, rankText, suitText]);
      return container;
    }
  }

  private createDeckBack(x: number, y: number): Phaser.GameObjects.Image {
    // Check if we have a card back texture
    if (this.textures.exists('card-back')) {
      const cardBack = this.add.image(x, y, 'card-back');
      cardBack.setScale(CARD_SCALE);
      return cardBack;
    } else {
      // Fallback: Create simple card back
      const graphics = this.add.graphics();
      graphics.fillStyle(0x0000ff, 1);
      graphics.fillRoundedRect(0, 0, CARD_WIDTH * CARD_SCALE, CARD_HEIGHT * CARD_SCALE, 5);
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRoundedRect(0, 0, CARD_WIDTH * CARD_SCALE, CARD_HEIGHT * CARD_SCALE, 5);
      
      graphics.generateTexture('card-back-generated', CARD_WIDTH * CARD_SCALE, CARD_HEIGHT * CARD_SCALE);
      graphics.destroy();
      
      const cardBack = this.add.image(x, y, 'card-back-generated');
      return cardBack;
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
    // Update card counts
    this.player1CountText.setText(`Cards: ${this.game_logic.player1Count}`);
    this.player2CountText.setText(`Cards: ${this.game_logic.player2Count}`);
    this.centerCountText.setText(`Center: ${this.game_logic.centerCount}`);
    
    // Update bonus pile
    const bonusCount = this.game_logic.bonusCount;
    this.bonusCountText.setText(`Bonus: ${bonusCount}`);
    this.bonusPileSprite.setVisible(bonusCount > 0);

    // Update center card
    this.centerCardSprite.destroy();
    this.centerCardSprite = this.createCardDisplay(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.game_logic.topCard
    );

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

  private showSlapFeedback(player: Player, success: boolean): void {
    // Screen shake
    this.cameras.main.shake(200, success ? 0.005 : 0.01);

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
      success ? 'GOOD SLAP!' : 'BAD SLAP!',
      {
        fontSize: '36px',
        color: success ? COLORS.GREEN : COLORS.RED,
        fontStyle: 'bold',
        stroke: COLORS.BLACK,
        strokeThickness: 4
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: feedbackText,
      y: feedbackText.y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        feedbackText.destroy();
      }
    });
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