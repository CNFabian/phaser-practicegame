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

// Mortgage advice database
const adviceDatabase = [
    // BAD ADVICE (to blast)
    { text: "Adjust rate mortgages\nwithout understanding", isBad: true },
    { text: "Skipping the\npre-approval process", isBad: true },
    { text: "Maxing out your\napproved budget", isBad: true },
    { text: "Ignoring your\ncredit score", isBad: true },
    { text: "Not comparing\nmultiple lenders", isBad: true },
    { text: "Waiving home\ninspection contingency", isBad: true },
    { text: "Taking the first\noffer you see", isBad: true },
    { text: "Hidden fees and\npredatory terms", isBad: true },
    { text: "Zero down payment\nis always best", isBad: true },
    { text: "Credit scores\ndon't matter much", isBad: true },
    // GOOD ADVICE (to let pass)
    { text: "Shop for best\nmortgage rates", isBad: false },
    { text: "Get pre-approved\nearly", isBad: false },
    { text: "Keep debt-to-income\nratio low", isBad: false },
    { text: "Save for larger\ndown payment", isBad: false },
    { text: "Lock in good\ninterest rate", isBad: false },
    { text: "Understand closing\ncosts upfront", isBad: false },
    { text: "Fixed-rate mortgage\nfor stability", isBad: false },
    { text: "Review all loan\ndocuments carefully", isBad: false },
    { text: "Build emergency fund\nbefore buying", isBad: false },
    { text: "Get professional\nhome inspection", isBad: false }
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

function createPlayer() {
    // Create player (simplified loan officer)
    player = this.add.container(450, 580);
    
    // Simple desk surface for player
    const playerDesk = this.add.rectangle(0, 40, 80, 30, 0x8B6F47);
    playerDesk.setStrokeStyle(2, 0x5C4A2F);
    
    // Person - much simpler design
    const body = this.add.rectangle(0, 10, 25, 40, 0x2E86AB); // Blue shirt/uniform
    const head = this.add.circle(0, -15, 15, 0xF4D1AE); // Head
    const tie = this.add.rectangle(0, 10, 6, 25, 0x8B0000); // Red tie for professional look
    
    // Arms holding a stamp
    const leftArm = this.add.rectangle(-15, 5, 8, 20, 0xF4D1AE);
    const rightArm = this.add.rectangle(15, 5, 8, 20, 0xF4D1AE);
    
    // Large, obvious stamp tool - DENY stamp (red)
    const stampTool = this.add.rectangle(0, -35, 30, 15, 0xC0392B);
    const stampText = this.add.text(0, -35, 'STAMP', {
        fontSize: '10px',
        fontFamily: 'Arial',
        color: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    player.add([playerDesk, body, head, tie, leftArm, rightArm, stampTool, stampText]);
}

function setupControls() {
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
}

function setupUI() {
    // Score and lives display
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '24px',
        fontFamily: 'Segoe UI',
        color: '#1a3a52',
        fontStyle: 'bold',
        stroke: '#fff',
        strokeThickness: 3
    });

    livesText = this.add.text(16, 50, '❤️ Lives: 3', {
        fontSize: '24px',
        fontFamily: 'Segoe UI',
        color: '#1a3a52',
        fontStyle: 'bold',
        stroke: '#fff',
        strokeThickness: 3
    });

    // Instructions - updated for new gameplay
    this.add.text(450, 16, 'READ CAREFULLY! DENY BAD ADVICE • APPROVE GOOD PRACTICES', {
        fontSize: '18px',
        fontFamily: 'Segoe UI',
        color: '#1a3a52',
        fontStyle: 'bold',
        stroke: '#fff',
        strokeThickness: 2
    }).setOrigin(0.5, 0);

    this.add.text(450, 45, 'Arrow Keys to Move • SPACE or Click to Stamp', {
        fontSize: '14px',
        fontFamily: 'Segoe UI',
        color: '#2c5f8d',
        stroke: '#fff',
        strokeThickness: 2
    }).setOrigin(0.5, 0);
}

function createOfficeBackground() {
    // Filing cabinets on the left (enhanced) - PROPERLY POSITIONED ON FLOOR
    const cabinet1 = this.add.rectangle(80, 560, 60, 120, 0x6C757D);
    cabinet1.setStrokeStyle(2, 0x495057);
    
    // Cabinet drawers
    this.add.rectangle(80, 520, 45, 2, 0x495057);
    this.add.rectangle(80, 550, 45, 2, 0x495057);
    this.add.rectangle(80, 580, 45, 2, 0x495057);
    this.add.rectangle(80, 610, 45, 2, 0x495057);
    
    // Filing cabinet handles
    this.add.rectangle(95, 505, 8, 4, 0xADB5BD);
    this.add.rectangle(95, 535, 8, 4, 0xADB5BD);
    this.add.rectangle(95, 565, 8, 4, 0xADB5BD);
    this.add.rectangle(95, 595, 8, 4, 0xADB5BD);
    
    // Cabinet labels
    this.add.text(80, 505, 'A-F', { fontSize: '8px', color: '#fff' }).setOrigin(0.5);
    this.add.text(80, 535, 'G-M', { fontSize: '8px', color: '#fff' }).setOrigin(0.5);
    this.add.text(80, 565, 'N-S', { fontSize: '8px', color: '#fff' }).setOrigin(0.5);
    this.add.text(80, 595, 'T-Z', { fontSize: '8px', color: '#fff' }).setOrigin(0.5);
    
    // Second filing cabinet - PROPERLY POSITIONED ON FLOOR
    const cabinet2 = this.add.rectangle(150, 560, 60, 120, 0x5D6975);
    cabinet2.setStrokeStyle(2, 0x495057);
    this.add.rectangle(150, 540, 45, 2, 0x495057);
    this.add.rectangle(150, 570, 45, 2, 0x495057);
    this.add.rectangle(150, 600, 45, 2, 0x495057);
    
    // Window in background (enhanced)
    const window = this.add.rectangle(450, 200, 220, 160, 0xB8E6F7);
    window.setStrokeStyle(8, 0x8B6F47);
    
    // Window frame divisions
    this.add.rectangle(450, 200, 4, 160, 0x8B6F47);
    this.add.rectangle(450, 200, 220, 4, 0x8B6F47);
    this.add.rectangle(395, 200, 4, 160, 0x8B6F47);
    this.add.rectangle(505, 200, 4, 160, 0x8B6F47);
    
    // Clouds visible through window
    this.add.ellipse(420, 170, 50, 30, 0xFFFFFF, 0.8);
    this.add.ellipse(480, 180, 60, 35, 0xFFFFFF, 0.7);
    this.add.ellipse(460, 220, 40, 25, 0xFFFFFF, 0.6);
    
    // Building silhouette in distance
    this.add.rectangle(400, 250, 20, 40, 0x34495E, 0.4);
    this.add.rectangle(500, 240, 30, 50, 0x2C3E50, 0.3);
    
    // Simple wall clock (simplified)
    const clock = this.add.circle(750, 150, 30, 0xFFFFFF);
    clock.setStrokeStyle(3, 0x2C3E50);
    
    // Simple clock hands pointing to 2:30
    this.add.rectangle(750, 140, 2, 15, 0x2C3E50); // Hour hand
    this.add.rectangle(760, 150, 20, 2, 0x2C3E50); // Minute hand
    this.add.circle(750, 150, 3, 0x2C3E50); // Center dot
    
    // Diploma/Certificate on wall
    const cert = this.add.rectangle(200, 180, 90, 70, 0xFFF8DC);
    cert.setStrokeStyle(3, 0x8B6F47);
    this.add.text(200, 165, 'MBA', {
        fontSize: '16px',
        color: '#2C3E50',
        fontStyle: 'bold',
        align: 'center'
    }).setOrigin(0.5);
    this.add.text(200, 185, 'Finance', {
        fontSize: '12px',
        color: '#2C3E50',
        align: 'center'
    }).setOrigin(0.5);
    this.add.text(200, 200, '2020', {
        fontSize: '10px',
        color: '#7F8C8D',
        align: 'center'
    }).setOrigin(0.5);
    
    // Office plants for ambiance - POSITIONED ON FLOOR LEVEL
    const plant1 = this.add.container(750, 600);
    const pot1 = this.add.rectangle(0, 15, 30, 25, 0x8B4513);
    const stem1 = this.add.rectangle(0, -10, 4, 30, 0x228B22);
    const leaf1 = this.add.ellipse(-8, -25, 20, 12, 0x32CD32);
    const leaf2 = this.add.ellipse(8, -20, 15, 10, 0x228B22);
    plant1.add([pot1, stem1, leaf1, leaf2]);
    
    // Bookshelf - POSITIONED ON FLOOR LEVEL
    const bookshelf = this.add.rectangle(820, 540, 60, 160, 0x8B6F47);
    bookshelf.setStrokeStyle(2, 0x5C4A2F);
    
    // Shelf divisions
    this.add.rectangle(820, 480, 55, 3, 0x5C4A2F);
    this.add.rectangle(820, 520, 55, 3, 0x5C4A2F);
    this.add.rectangle(820, 560, 55, 3, 0x5C4A2F);
    this.add.rectangle(820, 600, 55, 3, 0x5C4A2F);
    
    // Books on shelves
    this.add.rectangle(810, 490, 8, 25, 0xC0392B);
    this.add.rectangle(820, 490, 8, 25, 0x2980B9);
    this.add.rectangle(830, 490, 8, 25, 0x27AE60);
    this.add.rectangle(810, 530, 8, 25, 0x8E44AD);
    this.add.rectangle(825, 530, 8, 25, 0xE67E22);
    
    // Computer monitor on a side desk - POSITIONED ON FLOOR LEVEL
    const sideDesk = this.add.rectangle(650, 600, 120, 40, 0x8B6F47);
    sideDesk.setStrokeStyle(2, 0x5C4A2F);
    
    const monitor = this.add.rectangle(650, 570, 80, 50, 0x2C3E50);
    monitor.setStrokeStyle(2, 0x1A252F);
    const screen = this.add.rectangle(650, 565, 70, 40, 0x3498DB);
    const stand = this.add.rectangle(650, 595, 20, 15, 0x7F8C8D);
    
    // Motivational poster
    const poster = this.add.rectangle(300, 180, 70, 90, 0xFFFFFF);
    poster.setStrokeStyle(2, 0x2C3E50);
    this.add.text(300, 160, 'SUCCESS', {
        fontSize: '12px',
        color: '#2C3E50',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(300, 180, 'Starts with', {
        fontSize: '8px',
        color: '#7F8C8D'
    }).setOrigin(0.5);
    this.add.text(300, 195, 'PLANNING', {
        fontSize: '10px',
        color: '#C0392B',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Wall calendar
    const calendar = this.add.rectangle(600, 180, 60, 80, 0xFFFFFF);
    calendar.setStrokeStyle(2, 0x2C3E50);
    this.add.text(600, 155, 'NOV', {
        fontSize: '14px',
        color: '#C0392B',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(600, 175, '2025', {
        fontSize: '10px',
        color: '#2C3E50'
    }).setOrigin(0.5);
    this.add.text(600, 195, '04', {
        fontSize: '24px',
        color: '#2C3E50',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Office supplies on background desk - POSITIONED ON THE DESK
    this.add.rectangle(680, 590, 15, 4, 0xF39C12); // Stapler
    this.add.rectangle(700, 588, 8, 8, 0x8E44AD); // Tape dispenser
    this.add.rectangle(720, 590, 4, 20, 0x2C3E50); // Pen holder
    
    // Small trash can on floor - POSITIONED ON FLOOR
    const trashCan = this.add.rectangle(250, 600, 25, 35, 0x7F8C8D);
    trashCan.setStrokeStyle(2, 0x5D6975);
    const trashLid = this.add.ellipse(250, 583, 30, 8, 0x95A5A6);
}

function showStartScreen() {
    // Office background for start screen
    createOfficeBackground.call(this);
    
    // Title
    const title = this.add.text(450, 120, 'MORTGAGE DEFENDER', {
        fontSize: '56px',
        fontFamily: 'Segoe UI',
        color: '#1a3a52',
        fontStyle: 'bold',
        stroke: '#fff',
        strokeThickness: 6
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(450, 190, '💰 Protect Your Financial Future! 💰', {
        fontSize: '28px',
        fontFamily: 'Segoe UI',
        color: '#2c5f8d',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    // Instructions box
    const instructionsBg = this.add.rectangle(450, 390, 700, 300, 0xffffff, 0.95);
    instructionsBg.setStrokeStyle(4, 0x1a3a52);

    this.add.text(450, 270, 'HOW TO PLAY - CHALLENGE MODE:', {
        fontSize: '24px',
        fontFamily: 'Segoe UI',
        color: '#C0392B',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    const instructions = [
        '🚫 DENY BAD FINANCIAL ADVICE = +10 points',
        '✅ APPROVE GOOD PRACTICES = +5 points',
        '❌ ALL ADVICE LOOKS THE SAME - READ CAREFULLY!',
        '❌ Wrong choice = Lose a life',
        '',
        '⌨️  Use Arrow Keys to move your desk',
        '📋 Press SPACE or Click to stamp documents'
    ];

    instructions.forEach((line, index) => {
        this.add.text(450, 310 + (index * 30), line, {
            fontSize: '16px',
            fontFamily: 'Segoe UI',
            color: '#2C3E50',
            fontStyle: index === 4 ? 'normal' : 'normal'
        }).setOrigin(0.5);
    });

    // Start button
    const startButton = this.add.rectangle(450, 570, 250, 60, 0x27AE60);
    startButton.setStrokeStyle(4, 0x1E8449);
    startButton.setInteractive({ useHandCursor: true });

    const startText = this.add.text(450, 570, 'START GAME', {
        fontSize: '28px',
        fontFamily: 'Segoe UI',
        color: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    startButton.on('pointerover', () => {
        startButton.setFillStyle(0x2ECC71);
    });

    startButton.on('pointerout', () => {
        startButton.setFillStyle(0x27AE60);
    });

    startButton.on('pointerdown', () => {
        gameStarted = true;
        this.scene.restart();
    });
}

function spawnAdvice() {
    if (gameOver) return;

    // Random advice from database
    const adviceData = Phaser.Utils.Array.GetRandom(adviceDatabase);
    
    // Find available lanes to prevent overlap
    let availableLanes = [];
    for (let i = 0; i < totalLanes; i++) {
        if (!occupiedLanes.has(i)) {
            availableLanes.push(i);
        }
    }
    
    // If all lanes are occupied, clear some older ones
    if (availableLanes.length === 0) {
        occupiedLanes.clear();
        availableLanes = [0, 1, 2, 3];
    }
    
    // Choose random available lane
    const selectedLane = Phaser.Utils.Array.GetRandom(availableLanes);
    occupiedLanes.add(selectedLane);
    
    // Calculate x position based on lane (with some random offset within lane)
    const laneCenter = 140 + (selectedLane * laneWidth);
    const x = laneCenter + Phaser.Math.Between(-30, 30); // Small random offset within lane
    
    // All bubbles are now the same color (neutral paper color) - NO VISUAL HINTS!
    const color = 0xFFFFF0; // Off-white paper color
    
    // Create document/bubble shape - larger for better readability
    const bubble = currentScene.add.rectangle(x, -60, 160, 100, color, 1.0);
    bubble.setStrokeStyle(3, 0x2C3E50); // Dark border for definition
    
    // Add physics to the bubble
    currentScene.physics.add.existing(bubble);
    bubble.body.setSize(160, 100);
    bubble.body.setVelocity(0, Phaser.Math.Between(45, 75)); // Consistent speed range
    
    // Store advice data and lane info
    bubble.setData('isBad', adviceData.isBad);
    bubble.setData('text', adviceData.text);
    bubble.setData('lane', selectedLane);
    
    // Clear lane when bubble is far enough down to allow new spawns
    currentScene.time.delayedCall(1500, () => {
        occupiedLanes.delete(selectedLane);
    });
    
    // Text on bubble - much more readable with high contrast
    const text = currentScene.add.text(x, -60, adviceData.text, {
        fontSize: '16px',
        fontFamily: 'Segoe UI',
        color: '#2C3E50', // Dark text on light background
        align: 'center',
        fontStyle: 'bold',
        stroke: '#FFFFFF',
        strokeThickness: 2,
        wordWrap: { width: 150 }
    }).setOrigin(0.5);
    
    // Store references
    bubble.setData('textObj', text);
}

function startAdviceSpawning() {
    // Spawn advice periodically
    adviceTimer = currentScene.time.addEvent({
        delay: 3000, // Increased delay for better spacing
        callback: spawnAdvice,
        callbackScope: currentScene,
        loop: true
    });

    // Spawn first advice immediately
    spawnAdvice.call(currentScene);
}

function shoot() {
    if (gameOver) return;
    
    const time = currentScene.time.now;
    if (time < lastFired + 250) return; // Fire rate limit
    
    lastFired = time;
    
    // Create DENY stamp projectile - red stamp
    const stamp = currentScene.add.container(player.x, player.y - 50);
    
    // Stamp shape - red for denial
    const stampBody = currentScene.add.rectangle(0, 0, 40, 28, 0xC0392B);
    stampBody.setStrokeStyle(2, 0x8B0000);
    
    // "DENY" text on stamp
    const stampText = currentScene.add.text(0, 0, 'DENY', {
        fontSize: '12px',
        fontFamily: 'Segoe UI',
        color: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    stamp.add([stampBody, stampText]);
    
    currentScene.physics.add.existing(stamp);
    stamp.body.setVelocity(0, -450);
    stamp.body.setSize(40, 28);
    
    // Store stamp identifier
    stamp.setData('isStamp', true);
}

function update() {
    if (gameOver || !gameStarted) return;
    
    // Player movement
    if (cursors.left.isDown) {
        player.x -= 6;
    } else if (cursors.right.isDown) {
        player.x += 6;
    }
    
    // Keep player in bounds
    player.x = Phaser.Math.Clamp(player.x, 80, 820);
    
    // Get all stamps and advice bubbles
    const stamps = [];
    const adviceBubbles = [];
    
    currentScene.physics.world.bodies.entries.forEach(body => {
        if (body.gameObject) {
            if (body.gameObject.getData && body.gameObject.getData('isStamp')) {
                stamps.push(body.gameObject);
            } else if (body.gameObject.type === 'Rectangle' && 
                      body.gameObject.fillColor === 0xFFFFF0) { // Updated color check
                adviceBubbles.push(body.gameObject);
            }
        }
    });
    
    // Check collisions
    stamps.forEach(stamp => {
        adviceBubbles.forEach(advice => {
            if (currentScene.physics.overlap(stamp, advice)) {
                hitAdvice.call(currentScene, stamp, advice);
            }
        });
        
        // Remove stamps that go off screen
        if (stamp.y < -30) {
            stamp.destroy();
        }
    });
    
    // Check advice that reached bottom
    adviceBubbles.forEach(advice => {
        if (advice.y > 700) {
            const isBadAdvice = advice.getData('isBad');
            
            if (isBadAdvice) {
                // Bad advice reached bottom - lose life
                lives--;
                livesText.setText(`❤️ Lives: ${lives}`);
                
                // Flash screen red
                currentScene.cameras.main.flash(200, 255, 0, 0);
                
                // Show warning message
                const warning = currentScene.add.text(450, 350, 'BAD ADVICE GOT THROUGH!', {
                    fontSize: '32px',
                    fontFamily: 'Segoe UI',
                    color: '#E74C3C',
                    fontStyle: 'bold',
                    stroke: '#fff',
                    strokeThickness: 4
                }).setOrigin(0.5);
                
                currentScene.tweens.add({
                    targets: warning,
                    alpha: 0,
                    duration: 1500,
                    onComplete: () => warning.destroy()
                });
                
                if (lives <= 0) {
                    endGame.call(currentScene);
                }
            } else {
                // Good advice passed through - good!
                score += 5;
                scoreText.setText(`Score: ${score}`);
                
                // Show success message
                const success = currentScene.add.text(advice.x, 600, '+5', {
                    fontSize: '24px',
                    fontFamily: 'Segoe UI',
                    color: '#27AE60',
                    fontStyle: 'bold',
                    stroke: '#fff',
                    strokeThickness: 3
                }).setOrigin(0.5);
                
                currentScene.tweens.add({
                    targets: success,
                    y: 550,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => success.destroy()
                });
            }
            
            // Destroy advice and its components
            const textObj = advice.getData('textObj');
            if (textObj) textObj.destroy();
            advice.destroy();
        } else {
            // Update text position to follow the bubble
            const textObj = advice.getData('textObj');
            if (textObj) {
                textObj.y = advice.y;
                textObj.x = advice.x;
            }
        }
    });
}

function hitAdvice(stamp, advice) {
    const isBadAdvice = advice.getData('isBad');
    
    if (isBadAdvice) {
        // Correctly denied bad advice
        score += 10;
        
        // Success feedback
        const successText = this.add.text(advice.x, advice.y, '+10\nDENIED!', {
            fontSize: '24px',
            fontFamily: 'Segoe UI',
            color: '#27AE60',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#fff',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: successText,
            y: advice.y - 60,
            alpha: 0,
            duration: 1200,
            onComplete: () => successText.destroy()
        });
        
    } else {
        // Wrong! Denied good advice
        lives--;
        livesText.setText(`❤️ Lives: ${lives}`);
        
        // Error feedback
        const errorText = this.add.text(advice.x, advice.y, '-1 LIFE\nGOOD ADVICE!', {
            fontSize: '20px',
            fontFamily: 'Segoe UI',
            color: '#E74C3C',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#fff',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: errorText,
            y: advice.y - 60,
            alpha: 0,
            duration: 1200,
            onComplete: () => errorText.destroy()
        });
        
        // Flash screen red
        this.cameras.main.flash(200, 255, 0, 0);
        
        if (lives <= 0) {
            endGame.call(this);
        }
    }
    
    scoreText.setText(`Score: ${score}`);
    
    // Paper shred effect - neutral color since we can't distinguish
    for (let i = 0; i < 12; i++) {
        const particle = this.add.rectangle(advice.x, advice.y, 8, 12, 0xFFFFF0);
        this.physics.add.existing(particle);
        const angle = (i / 12) * Math.PI * 2;
        particle.body.setVelocity(Math.cos(angle) * 250, Math.sin(angle) * 250);
        
        this.tweens.add({
            targets: particle,
            alpha: 0,
            angle: 360,
            duration: 600,
            onComplete: () => particle.destroy()
        });
    }
    
    // Destroy advice and components
    const textObj = advice.getData('textObj');
    if (textObj) textObj.destroy();
    
    stamp.destroy();
    advice.destroy();
}

function endGame() {
    gameOver = true;
    adviceTimer.remove();
    
    // Game over overlay
    const overlay = this.add.rectangle(450, 350, 900, 700, 0x000000, 0.8);
    
    this.add.text(450, 220, 'GAME OVER', {
        fontSize: '64px',
        fontFamily: 'Segoe UI',
        color: '#E74C3C',
        fontStyle: 'bold',
        stroke: '#fff',
        strokeThickness: 6
    }).setOrigin(0.5);
    
    this.add.text(450, 310, `Final Score: ${score}`, {
        fontSize: '36px',
        fontFamily: 'Segoe UI',
        color: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Performance message
    let message = '';
    if (score >= 200) message = 'Financial Expert! 🏆';
    else if (score >= 150) message = 'Smart Borrower! 🌟';
    else if (score >= 100) message = 'Learning Fast! 👍';
    else message = 'Keep Studying! 📚';
    
    this.add.text(450, 380, message, {
        fontSize: '32px',
        fontFamily: 'Segoe UI',
        color: '#FFD700',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Educational tip
    const tips = [
        'TIP: Always compare at least 3 lenders!',
        'TIP: Your credit score affects your rate!',
        'TIP: Budget for 2-5% in closing costs!',
        'TIP: Pre-approval gives you power!',
        'TIP: Fixed-rate loans provide stability!'
    ];
    
    this.add.text(450, 440, Phaser.Utils.Array.GetRandom(tips), {
        fontSize: '20px',
        fontFamily: 'Segoe UI',
        color: '#87CEEB',
        fontStyle: 'italic'
    }).setOrigin(0.5);
    
    // Restart button
    const restartButton = this.add.rectangle(450, 520, 250, 60, 0x27AE60);
    restartButton.setStrokeStyle(4, 0x1E8449);
    restartButton.setInteractive({ useHandCursor: true });
    
    const restartText = this.add.text(450, 520, 'PLAY AGAIN', {
        fontSize: '28px',
        fontFamily: 'Segoe UI',
        color: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    restartButton.on('pointerover', () => {
        restartButton.setFillStyle(0x2ECC71);
    });
    
    restartButton.on('pointerout', () => {
        restartButton.setFillStyle(0x27AE60);
    });
    
    restartButton.on('pointerdown', () => {
        this.scene.restart();
    });
}