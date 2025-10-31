// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
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

// Preload assets
function preload() {
    // Load your assets here
    // this.load.image('player', 'assets/player.png');
}

// Create game objects
function create() {
    // Add a welcome text
    const text = this.add.text(400, 300, 'Hello Phaser!', {
        fontSize: '48px',
        color: '#ffffff'
    });
    text.setOrigin(0.5);

    // Add some instructions
    const instructions = this.add.text(400, 400, 'Click to start building your game', {
        fontSize: '20px',
        color: '#aaaaaa'
    });
    instructions.setOrigin(0.5);

    // Make the game interactive
    this.input.on('pointerdown', () => {
        text.setText('Game Started!');
        instructions.setText('Press F12 to open DevTools');
    });
}

// Update game state (runs every frame)
function update() {
    // Game logic goes here
}
