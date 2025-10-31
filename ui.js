// UI and scene management functions

function createOfficeBackground() {
    // Filing cabinets on the left (enhanced)
    const cabinet1 = this.add.rectangle(80, 500, 60, 120, 0x6C757D);
    cabinet1.setStrokeStyle(2, 0x495057);
    
    // Cabinet drawers
    this.add.rectangle(80, 460, 45, 2, 0x495057);
    this.add.rectangle(80, 490, 45, 2, 0x495057);
    this.add.rectangle(80, 520, 45, 2, 0x495057);
    this.add.rectangle(80, 550, 45, 2, 0x495057);
    
    // Filing cabinet handles
    this.add.rectangle(95, 445, 8, 4, 0xADB5BD);
    this.add.rectangle(95, 475, 8, 4, 0xADB5BD);
    this.add.rectangle(95, 505, 8, 4, 0xADB5BD);
    this.add.rectangle(95, 535, 8, 4, 0xADB5BD);
    
    // Cabinet labels
    this.add.text(80, 445, 'A-F', { fontSize: '8px', color: '#fff' }).setOrigin(0.5);
    this.add.text(80, 475, 'G-M', { fontSize: '8px', color: '#fff' }).setOrigin(0.5);
    this.add.text(80, 505, 'N-S', { fontSize: '8px', color: '#fff' }).setOrigin(0.5);
    this.add.text(80, 535, 'T-Z', { fontSize: '8px', color: '#fff' }).setOrigin(0.5);
    
    // Second filing cabinet
    const cabinet2 = this.add.rectangle(150, 500, 60, 120, 0x5D6975);
    cabinet2.setStrokeStyle(2, 0x495057);
    this.add.rectangle(150, 480, 45, 2, 0x495057);
    this.add.rectangle(150, 510, 45, 2, 0x495057);
    this.add.rectangle(150, 540, 45, 2, 0x495057);
    
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
    
    // Simple wall clock (simplified as requested)
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
    
    // Office plants for ambiance
    const plant1 = this.add.container(750, 520);
    const pot1 = this.add.rectangle(0, 20, 30, 25, 0x8B4513);
    const stem1 = this.add.rectangle(0, 0, 4, 30, 0x228B22);
    const leaf1 = this.add.ellipse(-8, -10, 20, 12, 0x32CD32);
    const leaf2 = this.add.ellipse(8, -5, 15, 10, 0x228B22);
    plant1.add([pot1, stem1, leaf1, leaf2]);
    
    // Bookshelf
    const bookshelf = this.add.rectangle(820, 400, 60, 200, 0x8B6F47);
    bookshelf.setStrokeStyle(2, 0x5C4A2F);
    
    // Shelf divisions
    this.add.rectangle(820, 340, 55, 3, 0x5C4A2F);
    this.add.rectangle(820, 380, 55, 3, 0x5C4A2F);
    this.add.rectangle(820, 420, 55, 3, 0x5C4A2F);
    this.add.rectangle(820, 460, 55, 3, 0x5C4A2F);
    
    // Books on shelves
    this.add.rectangle(810, 350, 8, 25, 0xC0392B);
    this.add.rectangle(820, 350, 8, 25, 0x2980B9);
    this.add.rectangle(830, 350, 8, 25, 0x27AE60);
    this.add.rectangle(810, 390, 8, 25, 0x8E44AD);
    this.add.rectangle(825, 390, 8, 25, 0xE67E22);
    
    // Computer monitor on a side desk
    const monitor = this.add.rectangle(650, 480, 80, 50, 0x2C3E50);
    monitor.setStrokeStyle(2, 0x1A252F);
    const screen = this.add.rectangle(650, 475, 70, 40, 0x3498DB);
    const stand = this.add.rectangle(650, 510, 20, 15, 0x7F8C8D);
    
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
    this.add.text(600, 155, 'OCT', {
        fontSize: '14px',
        color: '#C0392B',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(600, 175, '2025', {
        fontSize: '10px',
        color: '#2C3E50'
    }).setOrigin(0.5);
    this.add.text(600, 195, '31', {
        fontSize: '24px',
        color: '#2C3E50',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Office supplies on background desk
    this.add.rectangle(680, 520, 15, 4, 0xF39C12); // Stapler
    this.add.rectangle(700, 518, 8, 8, 0x8E44AD); // Tape dispenser
    this.add.rectangle(720, 520, 4, 20, 0x2C3E50); // Pen holder
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