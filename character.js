// Character creation and management functions

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
    
    // Large, obvious stamp tool
    const stampTool = this.add.rectangle(0, -35, 30, 15, 0xC0392B);
    const stampText = this.add.text(0, -35, 'STAMP', {
        fontSize: '10px',
        fontFamily: 'Arial',
        color: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    player.add([playerDesk, body, head, tie, leftArm, rightArm, stampTool, stampText]);
}

function handlePlayerMovement() {
    // Player movement
    if (cursors.left.isDown) {
        player.x -= 6;
    } else if (cursors.right.isDown) {
        player.x += 6;
    }
    
    // Keep player in bounds
    player.x = Phaser.Math.Clamp(player.x, 80, 820);
}

function shoot() {
    if (gameOver) return;
    
    const time = currentScene.time.now;
    if (time < lastFired + 250) return; // Fire rate limit
    
    lastFired = time;
    
    // Create approval stamp projectile
    const stamp = currentScene.add.container(player.x, player.y - 50);
    
    // Stamp shape
    const stampBody = currentScene.add.rectangle(0, 0, 35, 25, 0x2E86AB);
    stampBody.setStrokeStyle(2, 0x1a3a52);
    
    // "APPROVED" text on stamp
    const stampText = currentScene.add.text(0, 0, 'OK', {
        fontSize: '12px',
        fontFamily: 'Segoe UI',
        color: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    stamp.add([stampBody, stampText]);
    
    currentScene.physics.add.existing(stamp);
    stamp.body.setVelocity(0, -450);
    stamp.body.setSize(35, 25);
    
    // Store stamp identifier
    stamp.setData('isStamp', true);
}