// Advice data and spawning logic

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
    adviceTimer = this.time.addEvent({
        delay: 3000, // Increased delay for better spacing
        callback: spawnAdvice,
        callbackScope: this,
        loop: true
    });

    // Spawn first advice immediately
    spawnAdvice.call(this);
}