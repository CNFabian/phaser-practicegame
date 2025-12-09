import * as Phaser from 'phaser';
import { SCENE_KEYS, ASSET_KEYS, COLORS, CARD_SCALE, CARD_WIDTH, CARD_HEIGHT, GameState, Suit } from '../common';
import { RatScrew } from '../lib/ratscrew';
export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.GAME });
        this.usingSprites = false;
    }
    init(data) {
        if (data?.rules) {
            console.log('Game started with rules:', data.rules);
        }
    }
    create() {
        this.checkAssets();
        this.createBackground();
        this.initializeGame();
        this.createUI();
        this.createActiveRulesDisplay();
        this.setupInput();
        this.updateDisplay();
    }
    checkAssets() {
        this.usingSprites = this.textures.exists(ASSET_KEYS.CARDS);
        if (!this.usingSprites) {
            console.warn('Card sprites not found, using fallback rectangles');
        }
    }
    createBackground() {
        this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, this.cameras.main.width, this.cameras.main.height, 0x0a5f38);
        const graphics = this.add.graphics();
        graphics.lineStyle(8, 0x8B4513);
        graphics.strokeRoundedRect(50, 50, this.cameras.main.width - 100, this.cameras.main.height - 100, 20);
        this.createPlayingAreas();
    }
    createPlayingAreas() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xffd700, 0.5);
        graphics.strokeRoundedRect(centerX - (CARD_WIDTH * CARD_SCALE) / 2 - 10, centerY - (CARD_HEIGHT * CARD_SCALE) / 2 - 10, CARD_WIDTH * CARD_SCALE + 20, CARD_HEIGHT * CARD_SCALE + 20, 5);
        graphics.strokeRoundedRect(100 - 10, this.cameras.main.height - 150 - (CARD_HEIGHT * CARD_SCALE) / 2 - 10, CARD_WIDTH * CARD_SCALE + 20, CARD_HEIGHT * CARD_SCALE + 20, 5);
        graphics.strokeRoundedRect(100 - 10, 150 - (CARD_HEIGHT * CARD_SCALE) / 2 - 10, CARD_WIDTH * CARD_SCALE + 20, CARD_HEIGHT * CARD_SCALE + 20, 5);
        graphics.strokeRoundedRect(this.cameras.main.width - 150 - (CARD_WIDTH * CARD_SCALE) / 2 - 10, centerY - (CARD_HEIGHT * CARD_SCALE) / 2 - 10, CARD_WIDTH * CARD_SCALE + 20, CARD_HEIGHT * CARD_SCALE + 20, 5);
    }
    initializeGame() {
        const sceneData = this.scene.settings.data;
        const rules = sceneData?.rules || {
            doubles: true,
            sandwich: true,
            tens: false,
            marriage: false,
            topBottom: false,
            fourInRow: false,
            sequence: false,
            jokers: false
        };
        this.game_logic = new RatScrew(rules);
        console.log('Game logic initialized with rules:', rules);
    }
    createActiveRulesDisplay() {
        this.activeRulesContainer = this.add.container(20, 20);
        const panelWidth = 280;
        const panelHeight = 120;
        const panel = this.add.rectangle(panelWidth / 2, panelHeight / 2, panelWidth, panelHeight, 0x000000, 0.7);
        panel.setStrokeStyle(2, 0xffd700);
        this.activeRulesTitle = this.add.text(panelWidth / 2, 15, 'ACTIVE RULES', {
            fontSize: '16px',
            color: COLORS.GOLD,
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5, 0);
        const activeRuleNames = this.game_logic.getActiveRuleNames();
        const rulesText = activeRuleNames.length > 0
            ? activeRuleNames.join('\n')
            : 'No rules active';
        this.activeRulesText = this.add.text(panelWidth / 2, 40, rulesText, {
            fontSize: '14px',
            color: COLORS.WHITE,
            align: 'center',
            lineSpacing: 2
        }).setOrigin(0.5, 0);
        this.activeRulesContainer.add([panel, this.activeRulesTitle, this.activeRulesText]);
        this.activeRulesContainer.setDepth(100);
    }
    createUI() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.player1CountText = this.add.text(100, this.cameras.main.height - 50, 'Cards: 26', {
            fontSize: '20px',
            color: COLORS.GOLD,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(100, this.cameras.main.height - 25, 'Player 1', {
            fontSize: '16px',
            color: COLORS.WHITE
        }).setOrigin(0.5);
        this.player2CountText = this.add.text(100, 75, 'Cards: 26', {
            fontSize: '20px',
            color: COLORS.GOLD,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(100, 50, 'Player 2', {
            fontSize: '16px',
            color: COLORS.WHITE
        }).setOrigin(0.5);
        this.centerCountText = this.add.text(centerX, centerY + (CARD_HEIGHT * CARD_SCALE) / 2 + 20, 'Center: 0', {
            fontSize: '16px',
            color: COLORS.WHITE,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.bonusCountText = this.add.text(this.cameras.main.width - 150, centerY + (CARD_HEIGHT * CARD_SCALE) / 2 + 20, 'Bonus: 0', {
            fontSize: '16px',
            color: COLORS.ORANGE,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.statusText = this.add.text(centerX, this.cameras.main.height - 100, '', {
            fontSize: '18px',
            color: COLORS.YELLOW,
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: 600, useAdvancedWrap: true }
        }).setOrigin(0.5);
        this.turnIndicator = this.add.text(centerX, 100, "Player 1's Turn", {
            fontSize: '24px',
            color: COLORS.GOLD,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.challengeText = this.add.text(centerX, centerY - 100, '', {
            fontSize: '22px',
            color: COLORS.RED,
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setVisible(false);
        this.pileCollectionText = this.add.text(centerX, centerY + 100, '', {
            fontSize: '20px',
            color: COLORS.GREEN,
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setVisible(false);
        this.add.text(this.cameras.main.centerX, this.cameras.main.height - 30, 'Player 1: Q = Play Card, A = Slap | Player 2: P = Play Card, L = Slap | ESC = Menu', {
            fontSize: '14px',
            color: COLORS.LIGHT_GRAY
        }).setOrigin(0.5);
    }
    setupInput() {
        if (!this.input.keyboard)
            return;
        this.input.keyboard.on('keydown-Q', () => this.playCard(1));
        this.input.keyboard.on('keydown-A', () => this.attemptSlap(1));
        this.input.keyboard.on('keydown-P', () => this.playCard(2));
        this.input.keyboard.on('keydown-L', () => this.attemptSlap(2));
        this.input.keyboard.on('keydown-ESC', () => this.returnToMenu());
    }
    createCardDisplay(x, y, card) {
        if (!card) {
            const rect = this.add.rectangle(x, y, CARD_WIDTH * CARD_SCALE, CARD_HEIGHT * CARD_SCALE, 0x333333, 0.3);
            rect.setStrokeStyle(2, 0x666666);
            return rect;
        }
        const textureName = `card-${card.suit.toLowerCase()}-${card.rank.toLowerCase()}`;
        if (this.textures.exists(textureName)) {
            const cardSprite = this.add.image(x, y, textureName);
            cardSprite.setScale(CARD_SCALE);
            return cardSprite;
        }
        else {
            const container = this.add.container(x, y);
            const cardBg = this.add.rectangle(0, 0, CARD_WIDTH * CARD_SCALE, CARD_HEIGHT * CARD_SCALE, 0xffffff);
            cardBg.setStrokeStyle(2, 0x000000);
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
    playCard(player) {
        if (this.game_logic.playCard(player)) {
            this.showPlayCardAnimation(player);
            this.updateDisplayWithoutCenterCard();
        }
    }
    attemptSlap(player) {
        const success = this.game_logic.attemptSlap(player);
        this.updateDisplay();
        this.showSlapFeedback(player, success);
    }
    updateDisplayWithoutCenterCard() {
        this.player1CountText.setText(`Cards: ${this.game_logic.player1Count}`);
        this.player2CountText.setText(`Cards: ${this.game_logic.player2Count}`);
        this.centerCountText.setText(`Center: ${this.game_logic.centerPileCount}`);
        this.bonusCountText.setText(`Bonus: ${this.game_logic.bonusPileCount}`);
        if (this.game_logic.gameState === GameState.PLAYING) {
            this.turnIndicator.setText(`Player ${this.game_logic.currentPlayer}'s Turn`);
            this.turnIndicator.setVisible(true);
        }
        else {
            this.turnIndicator.setVisible(false);
        }
        this.statusText.setText(this.game_logic.getGameStatusMessage());
        if (this.game_logic.gameState === GameState.CHALLENGE) {
            const remaining = this.game_logic.challengeCardsRemaining;
            this.challengeText.setText(`Face Card Challenge!\nPlayer ${this.game_logic.currentPlayer}: ${remaining} cards left`);
            this.challengeText.setVisible(true);
        }
        else {
            this.challengeText.setVisible(false);
        }
        if (this.game_logic.pileAwaitingCollection && this.game_logic.pileWinner) {
            this.pileCollectionText.setText(`Player ${this.game_logic.pileWinner}: Press SLAP to collect!`);
            this.pileCollectionText.setVisible(true);
        }
        else {
            this.pileCollectionText.setVisible(false);
        }
        if (this.game_logic.gameState === GameState.GAME_OVER) {
            this.handleGameOver();
        }
    }
    updateDisplay() {
        this.updateDisplayWithoutCenterCard();
        if (this.centerCardSprite) {
            this.centerCardSprite.destroy();
        }
        const topCard = this.game_logic.centerPileTopCard;
        this.centerCardSprite = this.createCardDisplay(this.cameras.main.centerX, this.cameras.main.centerY, topCard);
    }
    showPlayCardAnimation(player) {
        const fromX = player === 1 ? 100 : 100;
        const fromY = player === 1 ? this.cameras.main.height - 150 : 150;
        const toX = this.cameras.main.centerX;
        const toY = this.cameras.main.centerY;
        const tempCard = this.add.rectangle(fromX, fromY, CARD_WIDTH * CARD_SCALE, CARD_HEIGHT * CARD_SCALE, 0x4169E1);
        tempCard.setStrokeStyle(2, 0xffd700);
        this.tweens.add({
            targets: tempCard,
            x: toX,
            y: toY,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                tempCard.destroy();
                if (this.centerCardSprite) {
                    this.centerCardSprite.destroy();
                }
                const topCard = this.game_logic.centerPileTopCard;
                this.centerCardSprite = this.createCardDisplay(toX, toY, topCard);
            }
        });
    }
    showSlapFeedback(player, success) {
        const feedbackText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 150, success ? `Player ${player}: GOOD SLAP!` : `Player ${player}: BAD SLAP!`, {
            fontSize: '24px',
            color: success ? COLORS.GREEN : COLORS.RED,
            fontStyle: 'bold',
            stroke: COLORS.BLACK,
            strokeThickness: 3
        }).setOrigin(0.5);
        this.cameras.main.flash(200, success ? 0 : 255, success ? 255 : 0, 0, false);
        this.tweens.add({
            targets: feedbackText,
            y: feedbackText.y - 50,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => feedbackText.destroy()
        });
    }
    handleGameOver() {
        const winner = this.game_logic.player1Count > this.game_logic.player2Count ? 1 : 2;
        const overlay = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8);
        const gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, `GAME OVER!\nPlayer ${winner} Wins!`, {
            fontSize: '48px',
            color: COLORS.GOLD,
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        const instructionText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'Press ESC to return to menu', {
            fontSize: '24px',
            color: COLORS.WHITE
        }).setOrigin(0.5);
        this.cameras.main.flash(1000, 255, 215, 0, false);
    }
    returnToMenu() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(SCENE_KEYS.MENU);
        });
    }
}
