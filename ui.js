// UI and scene management functions

function createOfficeBackground() {
    // Filing cabinets on the left
    const cabinet1 = this.add.rectangle(80, 500, 60, 120, 0x6C757D);
    cabinet1.setStrokeStyle(2, 0x495057);
    this.add.rectangle(80, 480, 45, 2, 0x495057);
    this.add.rectangle(80, 510, 45, 2, 0x495057);
    this.add.rectangle(80, 540, 45, 2, 0x495057);
    
    // Filing cabinet handles
    this.add.rectangle(80, 465, 20, 4, 0xADB5BD);
    this.add.rectangle(80, 495, 20, 4, 0xADB5BD);
    this.add.rectangle(80, 525, 20, 4, 0xADB5BD);
    
    // Window in background
    const window = this.add.rectangle(450, 200, 200, 150, 0xB8E6F7);
    window.setStrokeStyle(8, 0x8B6F47);
    this.add.rectangle(450, 200, 4, 150, 0x8B6F47);
    this.add.rectangle(450, 200, 200, 4, 0x8B6F47);
    
    // Clouds visible through window
    this.add.ellipse(420, 180, 40, 25, 0xFFFFFF, 0.7);
    this.add.ellipse(480, 190, 50, 30, 0xFFFFFF, 0.7);
    
    // Wall clock
    const clock = this.add.circle(750, 150, 35, 0xFFFFFF);
    clock.setStrokeStyle(4, 0x2C3E50);
    this.add.text(750, 150, '12', { fontSize: '16px', color: '#2C3E50' }).setOrigin(0.5);
    this.add.rectangle(750, 150, 2, 20, 0x2C3E50);
    this.add.rectangle(750, 150, 15, 2, 0x2C3E50);
    
    // Diploma/Certificate on wall
    const cert = this.add.rectangle(200, 180, 80, 60, 0xFFF8DC);
    cert.setStrokeStyle(3, 0x8B6F47);
    this.add.text(200, 180, 'MBA\nFinance', {
        fontSize: '14px',
        color: '#2C3E50',
        align: 'center'
    }).setOrigin(0.5);
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
        '🚫 BLAST BAD FINANCIAL ADVICE = +10 points',
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