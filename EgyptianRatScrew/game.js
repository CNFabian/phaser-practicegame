// Egyptian Ratscrew - 2 Player Local Card Game
// Using actual card spritesheet assets

const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    backgroundColor: '#0a5f38',
    parent: 'game-container',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// Card spritesheet dimensions (analyzing the uploaded image)
const CARD_WIDTH = 140;
const CARD_HEIGHT = 190;
const CARD_SCALE = 0.4;

// Asset keys
const ASSET_KEYS = {
    CARDS_SPRITESHEET: 'cards'
};

// Game state
let deck = [];
let player1Deck = [];
let player2Deck = [];
let centerPile = [];
let gameState = 'start';
let currentPlayer = 1;
let challengePlayer = 0;
let challengeType = '';
let challengesRemaining = 0;
let gameStarted = false;

// UI Elements
let player1CardCount;
let player2CardCount;
let player1Container;
let player2Container;
let centerPileContainer;
let statusText;
let player1Label;
let player2Label;
let turnIndicator1;
let turnIndicator2;

// Slap detection
let canSlap = true;
let slapCooldown = 200;

// Card mapping - standard 52 card deck layout in spritesheet
// Row 0: Clubs (A-K)
// Row 1: Diamonds (A-K)  
// Row 2: Hearts (A-K)
// Row 3: Spades (A-K)
// Row 4: Card backs

const CARD_DATA = [];
const suits = ['♣', '♦', '♥', '♠'];
const suitNames = ['clubs', 'diamonds', 'hearts', 'spades'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Build card data mapping
function buildCardData() {
    CARD_DATA.length = 0; // Clear array
    let frameIndex = 0;
    
    // Iterate through rows (suits) and columns (ranks)
    for (let suitIndex = 0; suitIndex < 4; suitIndex++) {
        for (let rankIndex = 0; rankIndex < 13; rankIndex++) {
            CARD_DATA.push({
                frame: frameIndex,
                rank: ranks[rankIndex],
                suit: suits[suitIndex],
                suitName: suitNames[suitIndex],
                isRed: suits[suitIndex] === '♥' || suits[suitIndex] === '♦'
            });
            frameIndex++;
        }
    }
}

function preload() {
    // Remove loading indicator
    document.querySelector('.loading').style.display = 'none';
    
    // Load the card spritesheet
    this.load.spritesheet(ASSET_KEYS.CARDS_SPRITESHEET, 'assets/cards.png', {
        frameWidth: CARD_WIDTH,
        frameHeight: CARD_HEIGHT
    });
}

function create() {
    const scene = this;
    
    // Build card data mapping
    buildCardData();
    
    if (!gameStarted) {
        showStartScreen.call(this);
        return;
    }
    
    // Create game board
    createGameBoard.call(this);
    
    // Create containers
    createContainers.call(this);
    
    // Create UI
    createUI.call(this);
    
    // Setup input
    setupInput.call(this);
    
    // Initialize game
    initializeGame.call(this);
}

function showStartScreen() {
    // Title
    this.add.text(600, 100, 'EGYPTIAN RATSCREW', {
        fontSize: '64px',
        fontFamily: 'Arial',
        color: '#ffd700',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 6
    }).setOrigin(0.5);
    
    this.add.text(600, 170, '⚡ Fast-Paced 2-Player Card Battle ⚡', {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Instructions box
    const instructionsBg = this.add.rectangle(600, 450, 900, 450, 0xffffff, 0.95);
    instructionsBg.setStrokeStyle(4, 0xffd700);
    
    this.add.text(600, 250, 'HOW TO PLAY:', {
        fontSize: '32px',
        color: '#1a1a8e',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const instructions = [
        '🎯 GOAL: Win all 52 cards by playing and slapping!',
        '',
        '🃏 PLAYING CARDS:',
        '   • Player 1 presses Q to play a card',
        '   • Player 2 presses P to play a card',
        '   • Take turns placing cards in the center pile',
        '',
        '👑 FACE CARDS (J, Q, K, A):',
        '   • Jack = Opponent gets 1 chance | Queen = 2 chances',
        '   • King = 3 chances | Ace = 4 chances',
        '   • Play face cards to win the pile!',
        '',
        '👋 SLAPPING (Both players race!):',
        '   • DOUBLES: 5-5 (Press A or L to slap)',
        '   • SANDWICH: 5-7-5 (Press A or L to slap)',
        '   • Winner takes entire pile!',
        '   • Wrong slap = Lose 1 card to pile',
        '',
        '⚠️ Player with all cards wins the game!'
    ];
    
    instructions.forEach((line, index) => {
        const fontSize = line.startsWith('   ') ? '16px' : (line === '' ? '8px' : '18px');
        const color = line.startsWith('🎯') || line.startsWith('🃏') || 
                      line.startsWith('👑') || line.startsWith('👋') ? '#1a1a8e' : '#333333';
        const fontStyle = line.startsWith('🎯') || line.startsWith('🃏') || 
                          line.startsWith('👑') || line.startsWith('👋') ? 'bold' : 'normal';
        
        this.add.text(600, 290 + (index * 24), line, {
            fontSize: fontSize,
            color: color,
            fontStyle: fontStyle
        }).setOrigin(0.5);
    });
    
    // Start button
    const startButton = this.add.rectangle(600, 720, 300, 60, 0x1a8e1a);
    startButton.setStrokeStyle(4, 0xffd700);
    startButton.setInteractive({ useHandCursor: true });
    
    const startText = this.add.text(600, 720, 'START GAME', {
        fontSize: '32px',
        color: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    startButton.on('pointerover', () => startButton.setFillStyle(0x22aa22));
    startButton.on('pointerout', () => startButton.setFillStyle(0x1a8e1a));
    startButton.on('pointerdown', () => {
        gameStarted = true;
        this.scene.restart();
    });
}

function createGameBoard() {
    // Green felt table
    this.add.rectangle(600, 400, 1200, 800, 0x0a5f38);
    
    // Table border
    this.add.rectangle(600, 400, 1180, 780, 0x000000, 0).setStrokeStyle(8, 0x8B4513);
    
    // Center pile area with glow
    const centerGlow = this.add.ellipse(600, 400, 220, 220, 0xffd700, 0.1);
    const centerArea = this.add.ellipse(600, 400, 200, 200, 0x0d7a4a, 0.3);
    centerArea.setStrokeStyle(3, 0xffd700, 0.5);
    
    // Player 1 area (bottom)
    this.add.text(150, 680, 'PLAYER 1 DECK', {
        fontSize: '20px',
        color: '#ffd700',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const p1Deck = this.add.rectangle(150, 730, 80, 50, 0x1a1a1a, 0.5);
    p1Deck.setStrokeStyle(2, 0x4CAF50);
    
    // Show card back for player 1
    const p1CardBack = this.add.image(150, 730, ASSET_KEYS.CARDS_SPRITESHEET, 52);
    p1CardBack.setScale(CARD_SCALE * 0.6);
    
    // Player 2 area (top)
    this.add.text(1050, 120, 'PLAYER 2 DECK', {
        fontSize: '20px',
        color: '#ffd700',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const p2Deck = this.add.rectangle(1050, 70, 80, 50, 0x1a1a1a, 0.5);
    p2Deck.setStrokeStyle(2, 0x2196F3);
    
    // Show card back for player 2
    const p2CardBack = this.add.image(1050, 70, ASSET_KEYS.CARDS_SPRITESHEET, 52);
    p2CardBack.setScale(CARD_SCALE * 0.6);
}

function createContainers() {
    // Player 1 container (bottom area)
    player1Container = this.add.container(150, 730);
    
    // Player 2 container (top area)  
    player2Container = this.add.container(1050, 70);
    
    // Center pile container
    centerPileContainer = this.add.container(600, 400);
}

function createUI() {
    // Player 1 info (bottom left)
    player1Label = this.add.text(50, 600, 'PLAYER 1', {
        fontSize: '28px',
        color: '#4CAF50',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 3
    });
    
    player1CardCount = this.add.text(50, 640, 'Cards: 26', {
        fontSize: '20px',
        color: '#ffffff'
    });
    
    this.add.text(50, 670, 'Press Q to Play', {
        fontSize: '16px',
        color: '#ffff00',
        fontStyle: 'italic'
    });
    
    this.add.text(50, 695, 'Press A to Slap', {
        fontSize: '16px',
        color: '#ff6b6b',
        fontStyle: 'italic'
    });
    
    turnIndicator1 = this.add.text(50, 730, '► YOUR TURN', {
        fontSize: '22px',
        color: '#00ff00',
        fontStyle: 'bold'
    }).setVisible(false);
    
    // Player 2 info (top right)
    player2Label = this.add.text(1150, 200, 'PLAYER 2', {
        fontSize: '28px',
        color: '#2196F3',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 3
    }).setOrigin(1, 0);
    
    player2CardCount = this.add.text(1150, 240, 'Cards: 26', {
        fontSize: '20px',
        color: '#ffffff'
    }).setOrigin(1, 0);
    
    this.add.text(1150, 270, 'Press P to Play', {
        fontSize: '16px',
        color: '#ffff00',
        fontStyle: 'italic'
    }).setOrigin(1, 0);
    
    this.add.text(1150, 295, 'Press L to Slap', {
        fontSize: '16px',
        color: '#ff6b6b',
        fontStyle: 'italic'
    }).setOrigin(1, 0);
    
    turnIndicator2 = this.add.text(1150, 330, 'YOUR TURN ◄', {
        fontSize: '22px',
        color: '#00ff00',
        fontStyle: 'bold'
    }).setOrigin(1, 0).setVisible(false);
    
    // Status text (center)
    statusText = this.add.text(600, 250, '', {
        fontSize: '24px',
        color: '#ffff00',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 3,
        align: 'center'
    }).setOrigin(0.5);
}

function setupInput() {
    const scene = this;
    
    // Player 1 controls
    this.input.keyboard.on('keydown-Q', () => {
        if (gameState === 'playing' && currentPlayer === 1) {
            playCard(1, scene);
        }
    });
    
    this.input.keyboard.on('keydown-A', () => {
        if (canSlap) {
            attemptSlap(1, scene);
        }
    });
    
    // Player 2 controls
    this.input.keyboard.on('keydown-P', () => {
        if (gameState === 'playing' && currentPlayer === 2) {
            playCard(2, scene);
        }
    });
    
    this.input.keyboard.on('keydown-L', () => {
        if (canSlap) {
            attemptSlap(2, scene);
        }
    });
}

function initializeGame() {
    // Create deck using CARD_DATA
    deck = [];
    CARD_DATA.forEach((cardData) => {
        deck.push({
            frame: cardData.frame,
            rank: cardData.rank,
            suit: cardData.suit,
            suitName: cardData.suitName,
            isRed: cardData.isRed
        });
    });
    
    // Shuffle using Fisher-Yates algorithm
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    // Deal cards to players
    player1Deck = deck.filter((_, index) => index % 2 === 0);
    player2Deck = deck.filter((_, index) => index % 2 === 1);
    centerPile = [];
    
    // Reset game state
    currentPlayer = 1;
    gameState = 'playing';
    challengePlayer = 0;
    challengesRemaining = 0;
    
    updateUI();
    updateTurnIndicator();
}

function playCard(player, scene) {
    const playerDeck = player === 1 ? player1Deck : player2Deck;
    
    if (playerDeck.length === 0) return;
    
    // Take card from player's deck
    const card = playerDeck.shift();
    centerPile.push(card);
    
    // Display card with animation
    displayCenterPile(scene);
    
    // Play card sound (visual feedback)
    const cardSound = scene.add.circle(600, 400, 10, 0xffd700, 0.6);
    scene.tweens.add({
        targets: cardSound,
        radius: 30,
        alpha: 0,
        duration: 300,
        onComplete: () => cardSound.destroy()
    });
    
    // Check if it's a face card
    const faceValues = { 'J': 1, 'Q': 2, 'K': 3, 'A': 4 };
    if (faceValues[card.rank]) {
        // Face card played!
        challengePlayer = player;
        challengeType = card.rank;
        challengesRemaining = faceValues[card.rank];
        currentPlayer = player === 1 ? 2 : 1;
        gameState = 'faceCardChallenge';
        statusText.setText(`${card.rank} played! Player ${currentPlayer} has\n${challengesRemaining} chances!`);
    } else if (gameState === 'faceCardChallenge') {
        // In a challenge and played a number card
        challengesRemaining--;
        
        if (challengesRemaining <= 0) {
            // Challenge failed! Challenger wins the pile
            const winner = challengePlayer;
            winPile(winner, scene);
            statusText.setText(`Player ${winner} wins the pile!`);
            return;
        } else {
            statusText.setText(`${challengesRemaining} chances left!`);
        }
    } else {
        // Regular play
        currentPlayer = player === 1 ? 2 : 1;
        statusText.setText('');
    }
    
    // Check for slappable combinations
    checkSlappable(scene);
    
    updateUI();
    updateTurnIndicator();
}

function checkSlappable(scene) {
    if (centerPile.length < 2) return false;
    
    const len = centerPile.length;
    const lastCard = centerPile[len - 1];
    const secondLast = centerPile[len - 2];
    
    // Check for doubles
    if (lastCard.rank === secondLast.rank) {
        statusText.setText('⚡ DOUBLE! SLAP NOW! ⚡');
        
        // Pulse effect for slappable
        scene.tweens.add({
            targets: statusText,
            scale: 1.2,
            yoyo: true,
            duration: 200,
            repeat: 2
        });
        
        return true;
    }
    
    // Check for sandwich
    if (len >= 3) {
        const thirdLast = centerPile[len - 3];
        if (lastCard.rank === thirdLast.rank) {
            statusText.setText('⚡ SANDWICH! SLAP NOW! ⚡');
            
            // Pulse effect for slappable
            scene.tweens.add({
                targets: statusText,
                scale: 1.2,
                yoyo: true,
                duration: 200,
                repeat: 2
            });
            
            return true;
        }
    }
    
    return false;
}

function attemptSlap(player, scene) {
    if (centerPile.length < 2) return;
    
    // Prevent rapid slapping
    canSlap = false;
    scene.time.delayedCall(slapCooldown, () => {
        canSlap = true;
    });
    
    const len = centerPile.length;
    const lastCard = centerPile[len - 1];
    const secondLast = centerPile[len - 2];
    
    let validSlap = false;
    
    // Check doubles
    if (lastCard.rank === secondLast.rank) {
        validSlap = true;
    }
    
    // Check sandwich
    if (len >= 3) {
        const thirdLast = centerPile[len - 3];
        if (lastCard.rank === thirdLast.rank) {
            validSlap = true;
        }
    }
    
    if (validSlap) {
        // Valid slap! Player wins pile
        winPile(player, scene);
        statusText.setText(`Player ${player} slapped and\nwon ${centerPile.length + 1} cards!`);
        
        // Flash effect
        const flash = scene.add.rectangle(600, 400, 300, 300, 0xffff00, 0.5);
        scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 300,
            onComplete: () => flash.destroy()
        });
        
        // Success sound effect (visual feedback)
        const successRing = scene.add.circle(600, 400, 20, 0x00ff00, 0.8);
        scene.tweens.add({
            targets: successRing,
            radius: 150,
            alpha: 0,
            duration: 500,
            onComplete: () => successRing.destroy()
        });
        
        // Show slap hand
        const hand = scene.add.text(600, 400, '✋', {
            fontSize: '80px',
            color: player === 1 ? '#4CAF50' : '#2196F3'
        }).setOrigin(0.5);
        scene.tweens.add({
            targets: hand,
            scale: 1.5,
            alpha: 0,
            duration: 600,
            onComplete: () => hand.destroy()
        });
    } else {
        // Invalid slap! Penalty
        statusText.setText(`Player ${player} slapped incorrectly!\nPenalty card.`);
        const penaltyDeck = player === 1 ? player1Deck : player2Deck;
        
        if (penaltyDeck.length > 0) {
            const penaltyCard = penaltyDeck.shift();
            centerPile.push(penaltyCard);
            displayCenterPile(scene);
        }
        
        // Penalty visual feedback
        const penaltyX = scene.add.text(600, 400, '✗', {
            fontSize: '80px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        scene.tweens.add({
            targets: penaltyX,
            alpha: 0,
            y: 300,
            duration: 800,
            onComplete: () => penaltyX.destroy()
        });
        
        updateUI();
    }
}

function winPile(player, scene) {
    const winnerDeck = player === 1 ? player1Deck : player2Deck;
    
    // Count cards won
    const cardsWon = centerPile.length;
    
    // Add all center pile cards to winner's deck (at the bottom)
    winnerDeck.push(...centerPile);
    centerPile = [];
    
    // Clear center display with animation
    const cardsToAnimate = [...centerPileContainer.list];
    cardsToAnimate.forEach((card, index) => {
        scene.tweens.add({
            targets: card,
            x: player === 1 ? -450 : 450,
            y: player === 1 ? 330 : -330,
            scale: 0,
            duration: 400,
            delay: index * 30,
            onComplete: () => {
                if (index === cardsToAnimate.length - 1) {
                    centerPileContainer.removeAll(true);
                }
            }
        });
    });
    
    // Reset game state
    currentPlayer = player;
    gameState = 'playing';
    challengePlayer = 0;
    challengesRemaining = 0;
    
    updateUI();
    updateTurnIndicator();
    checkWinCondition(scene);
}

function displayCenterPile(scene) {
    // Clear old display
    centerPileContainer.removeAll(true);
    
    // Show last few cards with offset
    const cardsToShow = Math.min(5, centerPile.length);
    const startIndex = centerPile.length - cardsToShow;
    
    for (let i = 0; i < cardsToShow; i++) {
        const card = centerPile[startIndex + i];
        const offsetX = (i - cardsToShow / 2) * 6;
        const offsetY = (i - cardsToShow / 2) * 4;
        
        // Use spritesheet frame from actual card image
        const cardSprite = scene.add.image(offsetX, offsetY, ASSET_KEYS.CARDS_SPRITESHEET, card.frame);
        cardSprite.setScale(CARD_SCALE);
        cardSprite.setDepth(i);
        
        // Store card data on the sprite (using Phaser's data manager)
        cardSprite.setData('rank', card.rank);
        cardSprite.setData('suit', card.suit);
        cardSprite.setData('suitName', card.suitName);
        
        centerPileContainer.add(cardSprite);
    }
    
    // Animate latest card
    if (centerPileContainer.list.length > 0) {
        const latestCard = centerPileContainer.list[centerPileContainer.list.length - 1];
        latestCard.setScale(0);
        latestCard.setAngle(-10 + Math.random() * 20); // Random slight rotation
        
        scene.tweens.add({
            targets: latestCard,
            scale: CARD_SCALE,
            angle: -5 + Math.random() * 10,
            duration: 200,
            ease: 'Back.easeOut'
        });
    }
}

function updateUI() {
    player1CardCount.setText(`Cards: ${player1Deck.length}`);
    player2CardCount.setText(`Cards: ${player2Deck.length}`);
    
    // Update label colors based on card count
    if (player1Deck.length < 10) {
        player1Label.setColor('#ff6b6b');
    } else if (player1Deck.length > 42) {
        player1Label.setColor('#00ff00');
    } else {
        player1Label.setColor('#4CAF50');
    }
    
    if (player2Deck.length < 10) {
        player2Label.setColor('#ff6b6b');
    } else if (player2Deck.length > 42) {
        player2Label.setColor('#00ff00');
    } else {
        player2Label.setColor('#2196F3');
    }
}

function updateTurnIndicator() {
    turnIndicator1.setVisible(currentPlayer === 1 && gameState === 'playing');
    turnIndicator2.setVisible(currentPlayer === 2 && gameState === 'playing');
    
    // Pulse animation for turn indicator
    if (currentPlayer === 1 && gameState === 'playing') {
        this.tweens.add({
            targets: turnIndicator1,
            alpha: 0.5,
            yoyo: true,
            duration: 500,
            repeat: -1
        });
    }
    
    if (currentPlayer === 2 && gameState === 'playing') {
        this.tweens.add({
            targets: turnIndicator2,
            alpha: 0.5,
            yoyo: true,
            duration: 500,
            repeat: -1
        });
    }
}

function checkWinCondition(scene) {
    if (player1Deck.length === 0) {
        gameOver(2, scene);
    } else if (player2Deck.length === 0) {
        gameOver(1, scene);
    }
}

function gameOver(winner, scene) {
    gameState = 'gameOver';
    
    // Overlay
    const overlay = scene.add.rectangle(600, 400, 1200, 800, 0x000000, 0.85);
    
    // Confetti effect
    for (let i = 0; i < 100; i++) {
        const confetti = scene.add.circle(
            Phaser.Math.Between(200, 1000),
            -50,
            Phaser.Math.Between(4, 10),
            Phaser.Math.Between(0x00ff00, 0xffff00)
        );
        scene.tweens.add({
            targets: confetti,
            y: 900,
            x: confetti.x + Phaser.Math.Between(-150, 150),
            rotation: Phaser.Math.Between(0, 360),
            duration: Phaser.Math.Between(2000, 4000),
            ease: 'Sine.easeInOut'
        });
    }
    
    // Winner trophy
    scene.add.text(600, 220, '🏆', {
        fontSize: '80px'
    }).setOrigin(0.5);
    
    // Winner text
    scene.add.text(600, 320, `PLAYER ${winner} WINS!`, {
        fontSize: '72px',
        color: winner === 1 ? '#4CAF50' : '#2196F3',
        fontStyle: 'bold',
        stroke: '#ffd700',
        strokeThickness: 8
    }).setOrigin(0.5);
    
    scene.add.text(600, 410, '🎉 Victory! All 52 cards collected! 🎉', {
        fontSize: '28px',
        color: '#ffd700'
    }).setOrigin(0.5);
    
    // Stats
    scene.add.text(600, 470, 'Champion of Egyptian Ratscrew!', {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'italic'
    }).setOrigin(0.5);
    
    // Play again button
    const playAgainBtn = scene.add.rectangle(600, 550, 300, 60, 0x1a8e1a);
    playAgainBtn.setStrokeStyle(4, 0xffd700);
    playAgainBtn.setInteractive({ useHandCursor: true });
    
    const playAgainText = scene.add.text(600, 550, 'PLAY AGAIN', {
        fontSize: '28px',
        color: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    playAgainBtn.on('pointerover', () => {
        playAgainBtn.setFillStyle(0x22aa22);
        scene.tweens.add({
            targets: playAgainBtn,
            scale: 1.1,
            duration: 100
        });
    });
    
    playAgainBtn.on('pointerout', () => {
        playAgainBtn.setFillStyle(0x1a8e1a);
        scene.tweens.add({
            targets: playAgainBtn,
            scale: 1,
            duration: 100
        });
    });
    
    playAgainBtn.on('pointerdown', () => {
        scene.scene.restart();
        buildCardData();
        initializeGame.call(scene);
    });
}

function update() {
    // Game loop (empty for turn-based gameplay)
}