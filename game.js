// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 900,
    height: 700,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // Set to true to see collision boxes
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
let mythTimer;
let gameStarted = false;
let currentScene;

// Homebuying myths and facts database
const mythsDatabase = [
    { text: "You need 20% down\npayment", isMyth: true },
    { text: "You must have\nperfect credit", isMyth: true },
    { text: "Renting is always\nthrowing money away", isMyth: true },
    { text: "Spring is the only\ngood time to buy", isMyth: true },
    { text: "Pre-approval\nisn't necessary", isMyth: true },
    { text: "Home inspection\nis optional", isMyth: true },
    { text: "List price is\nfinal price", isMyth: true },
    { text: "New homes don't\nneed inspection", isMyth: true },
    { text: "Get pre-approved\nbefore shopping", isMyth: false },
    { text: "Location affects\nresale value", isMyth: false },
    { text: "Budget for closing\ncosts (2-5%)", isMyth: false },
    { text: "Consider future\nmaintenance costs", isMyth: false },
    { text: "Review HOA rules\nand fees", isMyth: false },
    { text: "Compare multiple\nmortgage lenders", isMyth: false },
    { text: "Home inspection\nprotects buyers", isMyth: false },
    { text: "Good credit gets\nbetter rates", isMyth: false }
];

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

    // Create ground
    const ground = this.add.rectangle(450, 680, 900, 40, 0x8B4513);

    // Create player (house with cannon)
    player = this.add.container(450, 630);
    
    // House body
    const house = this.add.rectangle(0, 0, 60, 50, 0xFF6B6B);
    const roof = this.add.triangle(0, -35, -40, 10, 40, 10, 0, -30, 0xDC143C);
    const door = this.add.rectangle(0, 15, 20, 30, 0x8B4513);
    const window1 = this.add.rectangle(-15, -5, 12, 12, 0xFFFFAA);
    const window2 = this.add.rectangle(15, -5, 12, 12, 0xFFFFAA);
    
    // Cannon
    const cannon = this.add.rectangle(0, -30, 8, 25, 0x4A4A4A);
    
    player.add([house, roof, door, window1, window2, cannon]);

    // Input
    cursors = this.input.keyboard.createCursorKeys();
    
    // Spacebar for shooting
    this.input.keyboard.on('keydown-SPACE', () => {
        shoot.call(this);
    });

    // Mouse click for shooting
    this.input.on('pointerdown', () => {
        shoot.call(this);
    });

    // Score and lives display
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#000',
        fontStyle: 'bold',
        stroke: '#fff',
        strokeThickness: 3
    });

    livesText = this.add.text(16, 50, '❤️ Lives: 3', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#000',
        fontStyle: 'bold',
        stroke: '#fff',
        strokeThickness: 3
    });

    // Instructions
    this.add.text(450, 16, 'BLAST THE MYTHS (Red) • LET FACTS PASS (Green)', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#000',
        fontStyle: 'bold',
        stroke: '#fff',
        strokeThickness: 2
    }).setOrigin(0.5, 0);

    this.add.text(450, 45, 'Arrow Keys to Move • SPACE or Click to Shoot', {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#333',
        stroke: '#fff',
        strokeThickness: 2
    }).setOrigin(0.5, 0);

    // Spawn myths periodically
    mythTimer = this.time.addEvent({
        delay: 2000,
        callback: spawnMyth,
        callbackScope: this,
        loop: true
    });

    // Spawn first myth immediately
    spawnMyth.call(this);
}

function showStartScreen() {
    // Title
    const title = this.add.text(450, 150, 'MYTH BUSTER REALTY', {
        fontSize: '56px',
        fontFamily: 'Arial',
        color: '#FF6B6B',
        fontStyle: 'bold',
        stroke: '#fff',
        strokeThickness: 6
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(450, 220, '🏠 Defend Your Dream Home! 🏠', {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#333',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    // Instructions box
    const instructionsBg = this.add.rectangle(450, 400, 700, 280, 0xffffff, 0.9);
    instructionsBg.setStrokeStyle(4, 0x333333);

    this.add.text(450, 300, 'HOW TO PLAY:', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#FF6B6B',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    const instructions = [
        '🔴 BLAST FALSE MYTHS (Red bubbles) = +10 points',
        '🟢 LET TRUE FACTS PASS (Green bubbles) = +5 points',
        '❌ Blast a fact or miss a myth = Lose a life',
        '',
        '⌨️  Use Arrow Keys to move',
        '🔫 Press SPACE or Click to shoot'
    ];

    instructions.forEach((line, index) => {
        this.add.text(450, 340 + (index * 35), line, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#333',
            fontStyle: index === 3 ? 'normal' : 'normal'
        }).setOrigin(0.5);
    });

    // Start button
    const startButton = this.add.rectangle(450, 580, 250, 60, 0x4CAF50);
    startButton.setStrokeStyle(4, 0x2E7D32);
    startButton.setInteractive({ useHandCursor: true });

    const startText = this.add.text(450, 580, 'START GAME', {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    startButton.on('pointerover', () => {
        startButton.setFillStyle(0x66BB6A);
    });

    startButton.on('pointerout', () => {
        startButton.setFillStyle(0x4CAF50);
    });

    startButton.on('pointerdown', () => {
        gameStarted = true;
        this.scene.restart();
    });
}

function spawnMyth() {
    if (gameOver) return;

    // Random myth from database
    const mythData = Phaser.Utils.Array.GetRandom(mythsDatabase);
    const x = Phaser.Math.Between(100, 800);
    
    // Bubble color based on type
    const color = mythData.isMyth ? 0xFF6B6B : 0x66BB6A;
    
    // Create the main bubble circle
    const bubble = this.add.circle(x, -50, 50, color, 0.9);
    bubble.setStrokeStyle(3, 0xffffff);
    
    // Add physics to the bubble
    this.physics.add.existing(bubble);
    bubble.body.setCircle(50);
    bubble.body.setVelocity(0, Phaser.Math.Between(60, 120));
    
    // Store myth data directly on the bubble
    bubble.setData('isMyth', mythData.isMyth);
    bubble.setData('text', mythData.text);
    
    // Icon on top of bubble
    const icon = this.add.text(x, -58, mythData.isMyth ? '❌' : '✓', {
        fontSize: '28px'
    }).setOrigin(0.5);
    
    // Text below bubble
    const text = this.add.text(x, 10, mythData.text, {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#000',
        align: 'center',
        fontStyle: 'bold',
        backgroundColor: '#ffffff',
        padding: { x: 8, y: 4 }
    }).setOrigin(0.5);
    
    // Store references so we can move them together and destroy them together
    bubble.setData('icon', icon);
    bubble.setData('textObj', text);
}

function shoot() {
    if (gameOver) return;
    
    const time = this.time.now;
    if (time < lastFired + 200) return; // Fire rate limit
    
    lastFired = time;
    
    // Create bullet
    const bullet = this.add.rectangle(player.x, player.y - 40, 8, 20, 0xFFFF00);
    bullet.setStrokeStyle(2, 0xFFA500);
    
    this.physics.add.existing(bullet);
    bullet.body.setVelocity(0, -500);
}

function update() {
    if (gameOver || !gameStarted) return;
    
    // Player movement
    if (cursors.left.isDown) {
        player.x -= 5;
    } else if (cursors.right.isDown) {
        player.x += 5;
    }
    
    // Keep player in bounds
    player.x = Phaser.Math.Clamp(player.x, 50, 850);
    
    // Manual collision detection between bullets and myths
    const bullets = this.physics.world.bodies.entries.filter(body => 
        body.gameObject && body.gameObject.fillColor === 0xFFFF00
    );
    
    const myths = this.physics.world.bodies.entries.filter(body => 
        body.gameObject && body.gameObject.type === 'Arc' && 
        (body.gameObject.fillColor === 0xFF6B6B || body.gameObject.fillColor === 0x66BB6A)
    );
    
    bullets.forEach(bulletBody => {
        if (!bulletBody.gameObject) return;
        const bullet = bulletBody.gameObject;
        
        myths.forEach(mythBody => {
            if (!mythBody.gameObject) return;
            const myth = mythBody.gameObject;
            
            if (this.physics.overlap(bullet, myth)) {
                hitMyth.call(this, bullet, myth);
            }
        });
        
        // Remove bullets that go off screen
        if (bullet.y < -20) {
            bullet.destroy();
        }
    });
    
    // Check myths that reached bottom
    myths.forEach(mythBody => {
        if (!mythBody.gameObject) return;
        const myth = mythBody.gameObject;
        
        if (myth.y > 700) {
            const isMythTrue = myth.getData('isMyth');
            
            if (isMythTrue) {
                // Myth reached bottom - lose life
                lives--;
                livesText.setText(`❤️ Lives: ${lives}`);
                
                // Flash screen
                this.cameras.main.flash(200, 255, 0, 0);
                
                if (lives <= 0) {
                    endGame.call(this);
                }
            } else {
                // Fact passed through - good!
                score += 5;
                scoreText.setText(`Score: ${score}`);
            }
            
            // Destroy associated objects
            const icon = myth.getData('icon');
            const textObj = myth.getData('textObj');
            if (icon) icon.destroy();
            if (textObj) textObj.destroy();
            myth.destroy();
        } else {
            // Update icon and text positions to follow the bubble
            const icon = myth.getData('icon');
            const textObj = myth.getData('textObj');
            if (icon) {
                icon.y = myth.y - 8;
                icon.x = myth.x;
            }
            if (textObj) {
                textObj.y = myth.y + 60;
                textObj.x = myth.x;
            }
        }
    });
}

function hitMyth(bullet, myth) {
    const isMythTrue = myth.getData('isMyth');
    
    if (isMythTrue) {
        // Correctly blasted a myth
        score += 10;
        
        // Success feedback
        const successText = this.add.text(myth.x, myth.y, '+10\nGOOD!', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#4CAF50',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#fff',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: successText,
            y: myth.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => successText.destroy()
        });
        
    } else {
        // Wrong! Blasted a true fact
        lives--;
        livesText.setText(`❤️ Lives: ${lives}`);
        
        // Error feedback
        const errorText = this.add.text(myth.x, myth.y, '-1 LIFE\nTHAT\'S TRUE!', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FF6B6B',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#fff',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: errorText,
            y: myth.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => errorText.destroy()
        });
        
        // Flash screen red
        this.cameras.main.flash(200, 255, 0, 0);
        
        if (lives <= 0) {
            endGame.call(this);
        }
    }
    
    scoreText.setText(`Score: ${score}`);
    
    // Explosion effect
    for (let i = 0; i < 8; i++) {
        const particle = this.add.circle(myth.x, myth.y, 5, isMythTrue ? 0xFF6B6B : 0x66BB6A);
        this.physics.add.existing(particle);
        const angle = (i / 8) * Math.PI * 2;
        particle.body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
        
        this.tweens.add({
            targets: particle,
            alpha: 0,
            duration: 500,
            onComplete: () => particle.destroy()
        });
    }
    
    // Destroy associated objects
    const icon = myth.getData('icon');
    const textObj = myth.getData('textObj');
    if (icon) icon.destroy();
    if (textObj) textObj.destroy();
    
    bullet.destroy();
    myth.destroy();
}

function endGame() {
    gameOver = true;
    mythTimer.remove();
    
    // Game over overlay
    const overlay = this.add.rectangle(450, 350, 900, 700, 0x000000, 0.7);
    
    this.add.text(450, 250, 'GAME OVER', {
        fontSize: '64px',
        fontFamily: 'Arial',
        color: '#FF6B6B',
        fontStyle: 'bold',
        stroke: '#fff',
        strokeThickness: 6
    }).setOrigin(0.5);
    
    this.add.text(450, 340, `Final Score: ${score}`, {
        fontSize: '36px',
        fontFamily: 'Arial',
        color: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Performance message
    let message = '';
    if (score >= 200) message = 'Real Estate Expert! 🏆';
    else if (score >= 150) message = 'Great Home Buyer! 🌟';
    else if (score >= 100) message = 'Getting There! 👍';
    else message = 'Keep Learning! 📚';
    
    this.add.text(450, 400, message, {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#FFD700',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Restart button
    const restartButton = this.add.rectangle(450, 500, 250, 60, 0x4CAF50);
    restartButton.setStrokeStyle(4, 0x2E7D32);
    restartButton.setInteractive({ useHandCursor: true });
    
    const restartText = this.add.text(450, 500, 'PLAY AGAIN', {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    restartButton.on('pointerover', () => {
        restartButton.setFillStyle(0x66BB6A);
    });
    
    restartButton.on('pointerout', () => {
        restartButton.setFillStyle(0x4CAF50);
    });
    
    restartButton.on('pointerdown', () => {
        this.scene.restart();
    });
}