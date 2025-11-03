// Main game configuration and initialization

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 900,
    height: 700,
    backgroundColor: '#E8F4F8',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Create the game instance
const game = new Phaser.Game(config);

// Game variables
let player;
let cursors;
let score = 0;
let lives = 3;
let scoreText;
let livesText;
let gameOver = false;
let lastFired = 0;
let adviceTimer;
let gameStarted = false;
let currentScene;

// Lane system for better spacing
let occupiedLanes = new Set();
let laneWidth = 180;
let totalLanes = 4;

function preload() {
    // No external assets needed - using graphics
}

function create() {
    currentScene = this;
    
    if (!gameStarted) {
        showStartScreen.call(this);
        return;
    }

    // Reset game state
    score = 0;
    lives = 3;
    gameOver = false;
    
    // Clear lane tracking for new game
    occupiedLanes.clear();

    // Create office background elements
    createOfficeBackground.call(this);

    // Create desk/ground
    const groundDesk = this.add.rectangle(450, 660, 900, 80, 0x8B6F47);
    groundDesk.setStrokeStyle(3, 0x5C4A2F);
    
    // Desk surface line
    this.add.rectangle(450, 620, 900, 4, 0x5C4A2F);

    // Create player character
    createPlayer.call(this);

    // Setup input controls
    setupControls.call(this);

    // Setup UI
    setupUI.call(this);

    // Start spawning advice
    startAdviceSpawning.call(this);
}

function update() {
    if (gameOver || !gameStarted) return;
    
    handlePlayerMovement();
    handleCollisions.call(this);
    handleAdviceBehavior.call(this);
}