import * as Phaser from 'phaser';
import { SCENE_KEYS, ASSET_KEYS, COLORS, CARD_SCALE, CARD_WIDTH, CARD_HEIGHT, GameState } from '../common';
import { RatScrew } from '../lib/ratscrew';
export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.GAME });
        this.usingSprites = false;
    }
    create() {
        this.checkAssets();
        this.createBackground();
        this.initializeGame();
        this.createUI();
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
        graphics.strokeRoundedRect(100 - 10, this.cameras.main.height - 150 - 10, CARD_WIDTH * CARD_SCALE + 20, CARD_HEIGHT * CARD_SCALE + 20, 5);
        graphics.strokeRoundedRect(this.cameras.main.width - 100 - CARD_WIDTH * CARD_SCALE - 10, 100 - 10, CARD_WIDTH * CARD_SCALE + 20, CARD_HEIGHT * CARD_SCALE + 20, 5);
    }
    initializeGame() {
        this.game_logic = new RatScrew();
    }
    createUI() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.centerCardSprite = this.createCardDisplay(centerX, centerY, null);
        this.player1DeckSprite = this.createDeckBack(100, this.cameras.main.height - 150);
        this.player2DeckSprite = this.createDeckBack(this.cameras.main.width - 100, 100);
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
        const controlsReminder = this.add.text(50, this.cameras.main.height - 30, 'Player 1: Q=Play, A=Slap | Player 2: P=Play, L=Slap | ESC=Menu', {
            fontSize: '16px',
            color: COLORS.WHITE
        });
        controlsReminder.setAlpha(0.7);
        this.add.text(100, this.cameras.main.height - 180, 'PLAYER 1', {
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
    createCardDisplay(x, y, card) {
        if (this.usingSprites && card) {
            const sprite = this.add.sprite(x, y, ASSET_KEYS.CARDS, card.spriteFrame);
            sprite.setScale(CARD_SCALE);
            return sprite;
        }
        else {
            return this.createCardFallback(x, y, card);
        }
    }
    createCardFallback(x, y, card) {
        const container = this.add.container(x, y);
        if (!card) {
            return container;
        }
        const bg = this.add.rectangle(0, 0, CARD_WIDTH * CARD_SCALE, CARD_HEIGHT * CARD_SCALE, 0xffffff);
        bg.setStrokeStyle(2, 0x000000);
        const text = this.add.text(0, 0, card.display, {
            fontSize: '24px',
            color: card.color === 'red' ? '#ff0000' : '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add([bg, text]);
        return container;
    }
    createDeckBack(x, y) {
        const sprite = this.add.sprite(x, y, ASSET_KEYS.CARDS, 0);
        if (!this.usingSprites) {
            sprite.destroy();
            const container = this.add.container(x, y);
            const bg = this.add.rectangle(0, 0, CARD_WIDTH * CARD_SCALE, CARD_HEIGHT * CARD_SCALE, 0x000080);
            bg.setStrokeStyle(2, 0xffd700);
            const pattern = this.add.text(0, 0, '🂠', {
                fontSize: '32px',
                color: COLORS.GOLD
            }).setOrigin(0.5);
            container.add([bg, pattern]);
            return sprite;
        }
        sprite.setScale(CARD_SCALE);
        return sprite;
    }
    setupInput() {
        this.input.keyboard?.on('keydown-Q', () => {
            this.playCard(1);
        });
        this.input.keyboard?.on('keydown-A', () => {
            this.attemptSlap(1);
        });
        this.input.keyboard?.on('keydown-P', () => {
            this.playCard(2);
        });
        this.input.keyboard?.on('keydown-L', () => {
            this.attemptSlap(2);
        });
        this.input.keyboard?.on('keydown-ESC', () => {
            this.returnToMenu();
        });
    }
    playCard(player) {
        if (this.game_logic.playCard(player)) {
            this.updateDisplay();
            this.showPlayCardAnimation(player);
        }
    }
    attemptSlap(player) {
        const success = this.game_logic.attemptSlap(player);
        this.updateDisplay();
        this.showSlapFeedback(player, success);
    }
    updateDisplay() {
        this.player1CountText.setText(`Cards: ${this.game_logic.player1Count}`);
        this.player2CountText.setText(`Cards: ${this.game_logic.player2Count}`);
        this.centerCountText.setText(`Center: ${this.game_logic.centerCount}`);
        this.centerCardSprite.destroy();
        this.centerCardSprite = this.createCardDisplay(this.cameras.main.centerX, this.cameras.main.centerY, this.game_logic.topCard);
        this.statusText.setText(this.game_logic.getGameStatusMessage());
        if (this.game_logic.gameState === GameState.PLAYING) {
            this.turnIndicator.setText(`Player ${this.game_logic.currentPlayer}'s Turn`);
            this.challengeText.setText('');
        }
        else if (this.game_logic.gameState === GameState.CHALLENGE) {
            this.turnIndicator.setText(`Challenge Mode`);
            this.challengeText.setText(`Player ${this.game_logic.challengePlayer} has ${this.game_logic.challengeRemaining} chances`);
        }
        else if (this.game_logic.gameState === GameState.GAME_OVER) {
            this.turnIndicator.setText(`GAME OVER!`);
            this.challengeText.setText(`Player ${this.game_logic.winner} Wins!`);
            this.showWinScreen();
        }
        this.player1DeckSprite.setVisible(this.game_logic.player1Count > 0);
        this.player2DeckSprite.setVisible(this.game_logic.player2Count > 0);
    }
    showPlayCardAnimation(player) {
        const startX = player === 1 ? 100 : this.cameras.main.width - 100;
        const startY = player === 1 ? this.cameras.main.height - 150 : 100;
        const endX = this.cameras.main.centerX;
        const endY = this.cameras.main.centerY;
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
    }
    showSlapFeedback(player, success) {
        this.cameras.main.shake(200, 0.01);
        const flash = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, this.cameras.main.width, this.cameras.main.height, success ? 0x00ff00 : 0xff0000, 0.3);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                flash.destroy();
            }
        });
        const slapText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, success ? 'GOOD SLAP!' : 'BAD SLAP!', {
            fontSize: '36px',
            color: success ? COLORS.GREEN : COLORS.RED,
            fontStyle: 'bold',
            stroke: COLORS.BLACK,
            strokeThickness: 3
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({
            targets: slapText,
            alpha: 1,
            y: slapText.y - 50,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                slapText.destroy();
            }
        });
    }
    showWinScreen() {
        const winner = this.game_logic.winner;
        const overlay = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
        const panel = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, 500, 300, 0x1a1a1a);
        panel.setStrokeStyle(5, 0xffd700);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, `PLAYER ${winner} WINS!`, {
            fontSize: '48px',
            color: COLORS.GOLD,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 20, 'Collected all 52 cards!', {
            fontSize: '24px',
            color: COLORS.WHITE
        }).setOrigin(0.5);
        const playAgainBtn = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 80, 'PLAY AGAIN (SPACE)', {
            fontSize: '20px',
            color: COLORS.GOLD,
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();
        playAgainBtn.on('pointerdown', () => this.restartGame());
        this.input.keyboard?.once('keydown-SPACE', () => this.restartGame());
    }
    restartGame() {
        this.scene.restart();
    }
    returnToMenu() {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(SCENE_KEYS.MENU);
        });
    }
}
