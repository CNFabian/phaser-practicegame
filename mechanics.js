// Game mechanics and collision handling

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
    this.add.text(450, 16, 'READ CAREFULLY! BLAST BAD ADVICE • APPROVE GOOD PRACTICES', {
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

function handleCollisions() {
    // Get all stamps and advice bubbles
    const stamps = [];
    const adviceBubbles = [];
    
    this.physics.world.bodies.entries.forEach(body => {
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
            if (this.physics.overlap(stamp, advice)) {
                hitAdvice.call(this, stamp, advice);
            }
        });
        
        // Remove stamps that go off screen
        if (stamp.y < -30) {
            stamp.destroy();
        }
    });
}

function handleAdviceBehavior() {
    // Get all advice bubbles
    const adviceBubbles = [];
    
    this.physics.world.bodies.entries.forEach(body => {
        if (body.gameObject && body.gameObject.type === 'Rectangle' && 
            body.gameObject.fillColor === 0xFFFFF0) {
            adviceBubbles.push(body.gameObject);
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
                this.cameras.main.flash(200, 255, 0, 0);
                
                // Show warning message
                const warning = this.add.text(450, 350, 'BAD ADVICE GOT THROUGH!', {
                    fontSize: '32px',
                    fontFamily: 'Segoe UI',
                    color: '#E74C3C',
                    fontStyle: 'bold',
                    stroke: '#fff',
                    strokeThickness: 4
                }).setOrigin(0.5);
                
                this.tweens.add({
                    targets: warning,
                    alpha: 0,
                    duration: 1500,
                    onComplete: () => warning.destroy()
                });
                
                if (lives <= 0) {
                    endGame.call(this);
                }
            } else {
                // Good advice passed through - good!
                score += 5;
                scoreText.setText(`Score: ${score}`);
                
                // Show success message
                const success = this.add.text(advice.x, 600, '+5', {
                    fontSize: '24px',
                    fontFamily: 'Segoe UI',
                    color: '#27AE60',
                    fontStyle: 'bold',
                    stroke: '#fff',
                    strokeThickness: 3
                }).setOrigin(0.5);
                
                this.tweens.add({
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
        // Correctly rejected bad advice
        score += 10;
        
        // Success feedback
        const successText = this.add.text(advice.x, advice.y, '+10\nREJECTED!', {
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
        // Wrong! Rejected good advice
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