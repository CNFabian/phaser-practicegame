// Budget Builder Game - Complete Implementation

// Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 700,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            debug: false,
            enableSleeping: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// Game State Variables
let currentScene;
let gameState = 'start'; // 'start', 'build', 'expenses', 'result'
let currentMonth = 1;
let totalBudget = 3000;
let remainingBudget = 0;
let spentBudget = 0;

// Category Configuration - Structural shapes with health system
const categories = {
    housing: {
        name: 'Housing',
        color: 0x8B4513,
        shape: 'L',
        baseCost: 100,
        icon: '🏠',
        description: 'L-Shape Block'
    },
    food: {
        name: 'Food',
        color: 0xFF6347,
        shape: 'O',
        baseCost: 80,
        icon: '🍔',
        description: 'O-Shape Block'
    },
    transport: {
        name: 'Transport',
        color: 0x4169E1,
        shape: 'T',
        baseCost: 70,
        icon: '🚗',
        description: 'T-Shape Block'
    },
    utilities: {
        name: 'Utilities',
        color: 0xFFD700,
        shape: 'I',
        baseCost: 60,
        icon: '💡',
        description: 'I-Shape Block'
    },
    entertainment: {
        name: 'Entertainment',
        color: 0xFF1493,
        shape: 'V',
        baseCost: 50,
        icon: '🎮',
        description: 'V-Shape Block'
    },
    savings: {
        name: 'Savings',
        color: 0x32CD32,
        shape: 'Square',
        baseCost: 90,
        icon: '💰',
        description: 'Square Block'
    }
};

// Player/Character
let player;
let placedBlocks = [];
let selectedCategory = null;
let ghostBlock = null;
let upgradeMode = false;
let selectedBlockForUpgrade = null;
let repositionMode = false; // New mode for moving already placed blocks
let selectedBlockToMove = null;
let rotationAngle = 0; // Current rotation for ghost block

// Block configuration
const BLOCK_UNIT = 30; // Size of each unit square in the shape

// UI Elements
let budgetText;
let monthText;
let phaseText;
let categoryButtons = {};
let startBuildButton;
let finishBuildButton;
let upgradeButton;

// Expenses
let incomingExpenses = [];
let expensesData = {};

function preload() {
    // No external assets needed
}

function create() {
    currentScene = this;
    
    if (gameState === 'start') {
        showStartScreen.call(this);
    } else {
        setupGame.call(this);
    }
}

function showStartScreen() {
    // Title
    this.add.text(500, 150, 'BUDGET BUILDER', {
        fontSize: '64px',
        fontFamily: 'Segoe UI',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#1a3a52',
        strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(500, 220, '🏗️ Build Your Financial Fortress! 💰', {
        fontSize: '32px',
        fontFamily: 'Segoe UI',
        color: '#FFD700',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    // Instructions
    const instructionsBg = this.add.rectangle(500, 450, 800, 400, 0xffffff, 0.95);
    instructionsBg.setStrokeStyle(4, 0x1a3a52);

    this.add.text(500, 300, 'HOW TO PLAY:', {
        fontSize: '28px',
        fontFamily: 'Segoe UI',
        color: '#C0392B',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    const instructions = [
        '🏗️ BUILD PHASE: Place structural blocks to protect your character',
        '💪 UPGRADE: Click blocks to add budget and strengthen them',
        '🔄 REPOSITION: Click same category twice to move placed blocks',
        '🔄 ROTATE: Use LEFT/RIGHT arrow keys to rotate blocks',
        '',
        '📦 Structural Shapes (like Tetris!):',
        '   🏠 Housing (L) • 🍔 Food (O) • 🚗 Transport (T)',
        '   💡 Utilities (I) • 🎮 Entertainment (V) • 💰 Savings (Square)',
        '',
        '💡 TIP: Build a stable structure and upgrade key blocks!',
        '✨ When expense hits block, health decreases. 0 health = destroyed!'
    ];

    instructions.forEach((line, index) => {
        this.add.text(500, 340 + (index * 35), line, {
            fontSize: line === '' ? '12px' : '16px',
            fontFamily: 'Segoe UI',
            color: '#2C3E50',
            fontStyle: 'normal'
        }).setOrigin(0.5);
    });

    // Start button
    const startButton = this.add.rectangle(500, 680, 300, 70, 0x27AE60);
    startButton.setStrokeStyle(5, 0x1E8449);
    startButton.setInteractive({ useHandCursor: true });

    const startText = this.add.text(500, 680, 'START BUILDING', {
        fontSize: '32px',
        fontFamily: 'Segoe UI',
        color: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    startButton.on('pointerover', () => startButton.setFillStyle(0x2ECC71));
    startButton.on('pointerout', () => startButton.setFillStyle(0x27AE60));
    startButton.on('pointerdown', () => {
        gameState = 'build';
        this.scene.restart();
    });
}

function setupGame() {
    // Ground
    const ground = this.matter.add.rectangle(500, 680, 1000, 40, {
        isStatic: true,
        friction: 1,
        label: 'ground'
    });
    this.add.rectangle(500, 680, 1000, 40, 0x654321);

    // Walls
    this.matter.add.rectangle(10, 350, 20, 700, { isStatic: true });
    this.matter.add.rectangle(990, 350, 20, 700, { isStatic: true });

    // Create player character in the center
    createPlayer.call(this);

    // Setup UI
    setupUI.call(this);

    // Generate expenses for this month
    generateExpenses.call(this);

    if (gameState === 'build') {
        startBuildPhase.call(this);
    } else if (gameState === 'expenses') {
        startExpensePhase.call(this);
    }
}

function createPlayer() {
    // Create character (person to protect)
    const centerX = 500;
    const centerY = 580;

    // Body
    const body = this.matter.add.circle(centerX, centerY, 25, {
        friction: 0.8,
        label: 'player',
        collisionFilter: {
            category: 0x0001,
            mask: 0xFFFF
        }
    });

    // Visual representation
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFDBE9, 1);
    graphics.fillCircle(0, 0, 25); // Body
    
    graphics.fillStyle(0xF4C2A0, 1);
    graphics.fillCircle(0, -30, 18); // Head
    
    graphics.fillStyle(0x2C3E50, 1);
    graphics.fillCircle(-6, -32, 3); // Left eye
    graphics.fillCircle(6, -32, 3); // Right eye
    
    graphics.lineStyle(2, 0x2C3E50);
    graphics.arc(0, -25, 8, 0, Math.PI); // Smile

    // Arms
    graphics.lineStyle(6, 0xF4C2A0);
    graphics.lineBetween(-20, -5, -35, 10);
    graphics.lineBetween(20, -5, 35, 10);

    player = this.add.container(centerX, centerY);
    player.add(graphics);
    player.body = body;

    // Link graphics to physics body
    this.matter.body.setPosition(body, { x: centerX, y: centerY });
}

function setupUI() {
    // Budget display
    budgetText = this.add.text(20, 20, `Budget: $${totalBudget}`, {
        fontSize: '24px',
        fontFamily: 'Segoe UI',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
    });

    // Month display
    monthText = this.add.text(20, 55, `Month: ${currentMonth}`, {
        fontSize: '24px',
        fontFamily: 'Segoe UI',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
    });

    // Phase display
    phaseText = this.add.text(500, 20, '', {
        fontSize: '28px',
        fontFamily: 'Segoe UI',
        color: '#FFD700',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5, 0);
}

function startBuildPhase() {
    phaseText.setText('🏗️ BUILD PHASE - Protect Your Budget!');

    // Show upcoming expenses warning
    showExpenseWarning.call(this);

    // Add keyboard controls for rotation
    this.input.keyboard.on('keydown-LEFT', () => {
        if (gameState === 'build' && (ghostBlock || selectedBlockToMove)) {
            rotationAngle -= Math.PI / 2; // Rotate 90 degrees left
            if (ghostBlock) {
                ghostBlock.rotation = rotationAngle;
            }
            if (selectedBlockToMove && selectedBlockToMove.container) {
                selectedBlockToMove.container.rotation = rotationAngle;
                this.matter.body.setAngle(selectedBlockToMove.body, rotationAngle);
            }
        }
    });

    this.input.keyboard.on('keydown-RIGHT', () => {
        if (gameState === 'build' && (ghostBlock || selectedBlockToMove)) {
            rotationAngle += Math.PI / 2; // Rotate 90 degrees right
            if (ghostBlock) {
                ghostBlock.rotation = rotationAngle;
            }
            if (selectedBlockToMove && selectedBlockToMove.container) {
                selectedBlockToMove.container.rotation = rotationAngle;
                this.matter.body.setAngle(selectedBlockToMove.body, rotationAngle);
            }
        }
    });

    // Create category selection buttons
    let yPos = 150;
    Object.keys(categories).forEach((key, index) => {
        const cat = categories[key];
        const button = createCategoryButton.call(this, key, cat, 850, yPos);
        categoryButtons[key] = button;
        yPos += 90;
    });

    // Upgrade Mode Toggle button
    upgradeButton = this.add.rectangle(850, yPos + 20, 140, 50, 0x9B59B6);
    upgradeButton.setStrokeStyle(3, 0xffffff);
    upgradeButton.setInteractive({ useHandCursor: true });

    const upgradeText = this.add.text(850, yPos + 20, '💪 UPGRADE\nMODE', {
        fontSize: '14px',
        fontFamily: 'Segoe UI',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center'
    }).setOrigin(0.5);

    upgradeButton.on('pointerdown', () => {
        upgradeMode = !upgradeMode;
        repositionMode = false; // Turn off reposition mode
        upgradeButton.setFillStyle(upgradeMode ? 0x8E44AD : 0x9B59B6);
        upgradeButton.setStrokeStyle(3, upgradeMode ? 0xFFD700 : 0xffffff);
        
        if (upgradeMode) {
            selectedCategory = null;
            selectedBlockToMove = null;
            if (ghostBlock) {
                ghostBlock.destroy();
                ghostBlock = null;
            }
            // Update button highlights
            Object.keys(categoryButtons).forEach(k => {
                const btn = categoryButtons[k].list[0];
                btn.setStrokeStyle(3, 0xffffff);
            });
        }
    });

    upgradeButton.on('pointerover', () => {
        upgradeButton.setStrokeStyle(5, 0xFFD700);
    });

    upgradeButton.on('pointerout', () => {
        upgradeButton.setStrokeStyle(3, upgradeMode ? 0xFFD700 : 0xffffff);
    });

    // Finish build button
    finishBuildButton = this.add.rectangle(500, 660, 250, 50, 0xFF6347);
    finishBuildButton.setStrokeStyle(3, 0xC0392B);
    finishBuildButton.setInteractive({ useHandCursor: true });

    const finishText = this.add.text(500, 660, 'FINISH & DEFEND!', {
        fontSize: '22px',
        fontFamily: 'Segoe UI',
        color: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    finishBuildButton.on('pointerover', () => finishBuildButton.setFillStyle(0xFF4500));
    finishBuildButton.on('pointerout', () => finishBuildButton.setFillStyle(0xFF6347));
    finishBuildButton.on('pointerdown', () => {
        if (placedBlocks.length > 0) {
            transitionToExpensePhase.call(this);
        }
    });

    // Mouse interaction for placing blocks
    this.input.on('pointermove', (pointer) => {
        if (selectedCategory && ghostBlock && gameState === 'build' && !upgradeMode && !repositionMode) {
            ghostBlock.x = pointer.x;
            ghostBlock.y = pointer.y;
        }
        
        // Move selected block if in reposition mode
        if (repositionMode && selectedBlockToMove && pointer.x < 800) {
            selectedBlockToMove.container.x = pointer.x;
            selectedBlockToMove.container.y = pointer.y;
            this.matter.body.setPosition(selectedBlockToMove.body, { x: pointer.x, y: pointer.y });
        }
    });

    this.input.on('pointerdown', (pointer) => {
        if (pointer.x < 800 && gameState === 'build') {
            if (upgradeMode) {
                // Try to upgrade an existing block
                upgradeBlock.call(this, pointer.x, pointer.y);
            } else if (repositionMode) {
                // Try to select a block to move
                selectBlockToMove.call(this, pointer.x, pointer.y);
            } else if (selectedCategory) {
                // Place new block
                placeBlock.call(this, pointer.x, pointer.y);
            }
        }
    });
}

function createCategoryButton(key, category, x, y) {
    const container = this.add.container(x, y);

    // Button background
    const bg = this.add.rectangle(0, 0, 140, 70, category.color, 0.8);
    bg.setStrokeStyle(3, 0xffffff);
    bg.setInteractive({ useHandCursor: true });

    // Icon and name
    const icon = this.add.text(0, -18, category.icon, {
        fontSize: '28px'
    }).setOrigin(0.5);

    const name = this.add.text(0, 8, category.name, {
        fontSize: '12px',
        fontFamily: 'Segoe UI',
        color: '#ffffff',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    const shape = this.add.text(0, 22, category.shape, {
        fontSize: '11px',
        fontFamily: 'Segoe UI',
        color: '#FFD700',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, icon, name, shape]);

    bg.on('pointerdown', () => {
        if (totalBudget >= category.baseCost && !upgradeMode) {
            selectCategory.call(this, key);
        }
    });

    bg.on('pointerover', () => {
        bg.setStrokeStyle(5, 0xFFD700);
    });

    bg.on('pointerout', () => {
        bg.setStrokeStyle(3, selectedCategory === key ? 0xFFD700 : 0xffffff);
    });

    return container;
}

function selectCategory(key) {
    if (upgradeMode) return;
    
    // If clicking the same category, toggle into reposition mode
    if (selectedCategory === key) {
        repositionMode = true;
        selectedCategory = null;
        
        if (ghostBlock) {
            ghostBlock.destroy();
            ghostBlock = null;
        }
        
        // Update button highlights - show all as unselected
        Object.keys(categoryButtons).forEach(k => {
            const btn = categoryButtons[k].list[0];
            btn.setStrokeStyle(3, 0xffffff);
        });
        
        // Show reposition mode indicator
        phaseText.setText('🔄 REPOSITION MODE - Click blocks to move them!');
        
        return;
    }
    
    // Normal category selection
    repositionMode = false;
    selectedCategory = key;
    selectedBlockToMove = null;
    rotationAngle = 0; // Reset rotation
    
    phaseText.setText('🏗️ BUILD PHASE - Protect Your Budget!');
    
    // Update button highlights
    Object.keys(categoryButtons).forEach(k => {
        const btn = categoryButtons[k].list[0];
        btn.setStrokeStyle(3, k === key ? 0xFFD700 : 0xffffff);
    });

    // Create ghost block
    if (ghostBlock) {
        ghostBlock.destroy();
    }
    ghostBlock = createGhostBlock.call(this, key);
}

function selectBlockToMove(x, y) {
    // If already moving a block, clicking again will place it
    if (selectedBlockToMove) {
        selectedBlockToMove.container.setAlpha(1);
        selectedBlockToMove = null;
        rotationAngle = 0;
        return;
    }
    
    // Find block at this position
    let clickedBlock = null;
    const clickRadius = 50;
    
    for (let block of placedBlocks) {
        const dx = block.container.x - x;
        const dy = block.container.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < clickRadius) {
            clickedBlock = block;
            break;
        }
    }
    
    if (!clickedBlock) return;
    
    // Select this block for moving
    selectedBlockToMove = clickedBlock;
    rotationAngle = clickedBlock.container.rotation;
    
    // Visual feedback - make it slightly transparent
    clickedBlock.container.setAlpha(0.7);
    
    // Show instructions
    const moveText = currentScene.add.text(x, y - 60, '⬆️⬇️ Rotate | Click to place', {
        fontSize: '14px',
        fontFamily: 'Segoe UI',
        color: '#FFD700',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5);
    
    currentScene.tweens.add({
        targets: moveText,
        alpha: 0,
        y: y - 90,
        duration: 2000,
        onComplete: () => moveText.destroy()
    });
}

function createGhostBlock(categoryKey) {
    const cat = categories[categoryKey];
    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0xFFFFFF, 0.8);
    graphics.fillStyle(cat.color, 0.3);

    drawStructuralShape(graphics, cat, 0, 0);
    graphics.setDepth(100);

    return graphics;
}

function drawStructuralShape(graphics, category, x, y) {
    const u = BLOCK_UNIT;
    
    switch(category.shape) {
        case 'L': // L-Shape (Housing)
            // Three blocks: vertical stack of 2, plus 1 to the right at bottom
            graphics.fillRect(x - u, y - u, u, u * 2); // Vertical part
            graphics.strokeRect(x - u, y - u, u, u * 2);
            graphics.fillRect(x, y, u, u); // Bottom right
            graphics.strokeRect(x, y, u, u);
            break;
            
        case 'O': // O-Shape (Food)
            // 2x2 square
            graphics.fillRect(x - u, y - u, u * 2, u * 2);
            graphics.strokeRect(x - u, y - u, u * 2, u * 2);
            break;
            
        case 'T': // T-Shape (Transport)
            // Three blocks horizontal, one on top center
            graphics.fillRect(x - u * 1.5, y, u * 3, u); // Horizontal bar
            graphics.strokeRect(x - u * 1.5, y, u * 3, u);
            graphics.fillRect(x - u/2, y - u, u, u); // Top center
            graphics.strokeRect(x - u/2, y - u, u, u);
            break;
            
        case 'I': // I-Shape (Utilities)
            // Four blocks vertical
            graphics.fillRect(x - u/2, y - u * 2, u, u * 4);
            graphics.strokeRect(x - u/2, y - u * 2, u, u * 4);
            break;
            
        case 'V': // V-Shape (Entertainment)
            // Two blocks at angle
            graphics.fillRect(x - u, y, u, u); // Left
            graphics.strokeRect(x - u, y, u, u);
            graphics.fillRect(x, y, u, u); // Right
            graphics.strokeRect(x, y, u, u);
            graphics.fillRect(x - u/2, y + u, u, u); // Bottom center
            graphics.strokeRect(x - u/2, y + u, u, u);
            break;
            
        case 'Square': // Square (Savings)
            // Single large block
            graphics.fillRect(x - u * 0.75, y - u * 0.75, u * 1.5, u * 1.5);
            graphics.strokeRect(x - u * 0.75, y - u * 0.75, u * 1.5, u * 1.5);
            break;
    }
}

function placeBlock(x, y) {
    if (!selectedCategory || totalBudget < categories[selectedCategory].baseCost) return;

    const cat = categories[selectedCategory];
    const u = BLOCK_UNIT;
    
    // Create compound physics body based on shape
    let parts = [];
    const options = {
        friction: 0.8,
        restitution: 0.1
    };

    switch(cat.shape) {
        case 'L':
            parts = [
                this.matter.bodies.rectangle(x - u/2, y - u/2, u, u, options), // Top
                this.matter.bodies.rectangle(x - u/2, y + u/2, u, u, options), // Bottom left
                this.matter.bodies.rectangle(x + u/2, y + u/2, u, u, options)  // Bottom right
            ];
            break;
        case 'O':
            parts = [
                this.matter.bodies.rectangle(x - u/2, y - u/2, u, u, options),
                this.matter.bodies.rectangle(x + u/2, y - u/2, u, u, options),
                this.matter.bodies.rectangle(x - u/2, y + u/2, u, u, options),
                this.matter.bodies.rectangle(x + u/2, y + u/2, u, u, options)
            ];
            break;
        case 'T':
            parts = [
                this.matter.bodies.rectangle(x - u, y + u/2, u, u, options),    // Left
                this.matter.bodies.rectangle(x, y + u/2, u, u, options),        // Center bottom
                this.matter.bodies.rectangle(x + u, y + u/2, u, u, options),    // Right
                this.matter.bodies.rectangle(x, y - u/2, u, u, options)         // Top center
            ];
            break;
        case 'I':
            parts = [
                this.matter.bodies.rectangle(x, y - u * 1.5, u, u, options),
                this.matter.bodies.rectangle(x, y - u/2, u, u, options),
                this.matter.bodies.rectangle(x, y + u/2, u, u, options),
                this.matter.bodies.rectangle(x, y + u * 1.5, u, u, options)
            ];
            break;
        case 'V':
            parts = [
                this.matter.bodies.rectangle(x - u/2, y + u/2, u, u, options),  // Left
                this.matter.bodies.rectangle(x + u/2, y + u/2, u, u, options),  // Right
                this.matter.bodies.rectangle(x, y + u * 1.5, u, u, options)     // Bottom
            ];
            break;
        case 'Square':
            parts = [
                this.matter.bodies.rectangle(x, y, u * 1.5, u * 1.5, options)
            ];
            break;
    }

    const body = this.matter.body.create({
        parts: parts,
        friction: 0.8,
        restitution: 0.1,
        label: selectedCategory
    });
    
    this.matter.world.add(body);
    
    // Apply rotation to the physics body
    this.matter.body.setAngle(body, rotationAngle);
    
    // Make body static during build phase so it can be dragged
    this.matter.body.setStatic(body, true);

    // Create visual container
    const container = this.add.container(x, y);
    container.rotation = rotationAngle; // Apply rotation to visuals
    
    const graphics = this.add.graphics();
    graphics.fillStyle(cat.color, 1);
    graphics.lineStyle(3, 0x000000);
    drawStructuralShape(graphics, cat, 0, 0);

    // Health display
    const health = cat.baseCost;
    const healthText = this.add.text(0, 0, `$${health}`, {
        fontSize: '14px',
        fontFamily: 'Segoe UI',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5);

    // Add icon
    const icon = this.add.text(0, -15, cat.icon, {
        fontSize: '20px'
    }).setOrigin(0.5);

    container.add([graphics, healthText, icon]);

    const blockData = {
        body,
        container,
        graphics,
        icon,
        healthText,
        category: selectedCategory,
        health: health,
        maxHealth: health,
        isDragging: false
    };

    placedBlocks.push(blockData);

    // Deduct from budget
    totalBudget -= cat.baseCost;
    budgetText.setText(`Budget: $${totalBudget}`);

    // Reset rotation after placing
    rotationAngle = 0;
    if (ghostBlock) {
        ghostBlock.rotation = 0;
    }

    // Clear selection if no budget left
    if (totalBudget < cat.baseCost) {
        selectedCategory = null;
        if (ghostBlock) {
            ghostBlock.destroy();
            ghostBlock = null;
        }
    }
}

function upgradeBlock(x, y) {
    // Find block at this position
    let clickedBlock = null;
    const clickRadius = 50;
    
    for (let block of placedBlocks) {
        const dx = block.container.x - x;
        const dy = block.container.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < clickRadius) {
            clickedBlock = block;
            break;
        }
    }
    
    if (!clickedBlock) return;
    
    const cat = categories[clickedBlock.category];
    const upgradeAmount = 50; // Each upgrade adds $50 to health
    
    if (totalBudget < upgradeAmount) {
        // Show feedback - not enough budget
        const warning = currentScene.add.text(x, y - 30, 'Not enough budget!', {
            fontSize: '14px',
            fontFamily: 'Segoe UI',
            color: '#FF6347',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        currentScene.tweens.add({
            targets: warning,
            alpha: 0,
            y: y - 60,
            duration: 1000,
            onComplete: () => warning.destroy()
        });
        return;
    }
    
    // Upgrade the block
    clickedBlock.health += upgradeAmount;
    clickedBlock.maxHealth += upgradeAmount;
    totalBudget -= upgradeAmount;
    
    budgetText.setText(`Budget: $${totalBudget}`);
    clickedBlock.healthText.setText(`$${clickedBlock.health}`);
    
    // Visual feedback
    const upgradeMsg = currentScene.add.text(x, y - 30, '+$50 💪', {
        fontSize: '16px',
        fontFamily: 'Segoe UI',
        color: '#27AE60',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 3
    }).setOrigin(0.5);
    
    currentScene.tweens.add({
        targets: upgradeMsg,
        alpha: 0,
        y: y - 60,
        duration: 1000,
        onComplete: () => upgradeMsg.destroy()
    });
    
    // Flash the block
    currentScene.tweens.add({
        targets: clickedBlock.graphics,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        repeat: 2
    });
}

function generateExpenses() {
    // Generate random expenses for each category
    expensesData = {};
    let totalExpenses = 0;

    Object.keys(categories).forEach(key => {
        const baseAmount = categories[key].cost;
        const variance = Phaser.Math.Between(-20, 40);
        const expense = Math.max(30, baseAmount + variance);
        expensesData[key] = {
            amount: expense,
            count: Math.ceil(expense / 30) // Number of projectiles
        };
        totalExpenses += expense;
    });

    spentBudget = totalExpenses;
}

function showExpenseWarning() {
    const warningBg = this.add.rectangle(150, 450, 250, 250, 0x000000, 0.8);
    warningBg.setStrokeStyle(3, 0xFF6347);

    this.add.text(150, 350, '⚠️ INCOMING!', {
        fontSize: '22px',
        fontFamily: 'Segoe UI',
        color: '#FF6347',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    let yOffset = 390;
    
    // Sort expenses by amount
    const sorted = Object.entries(expensesData).sort((a, b) => b[1].amount - a[1].amount);
    
    this.add.text(150, yOffset, 'Top Expenses:', {
        fontSize: '16px',
        fontFamily: 'Segoe UI',
        color: '#FFD700',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    yOffset += 30;
    
    sorted.slice(0, 3).forEach(([key, data]) => {
        const cat = categories[key];
        this.add.text(150, yOffset, `${cat.icon} ${cat.name}: $${data.amount}`, {
            fontSize: '14px',
            fontFamily: 'Segoe UI',
            color: '#ffffff'
        }).setOrigin(0.5);
        yOffset += 25;
    });

    this.add.text(150, yOffset + 20, `Total: $${spentBudget}`, {
        fontSize: '16px',
        fontFamily: 'Segoe UI',
        color: '#27AE60',
        fontStyle: 'bold'
    }).setOrigin(0.5);
}

function transitionToExpensePhase() {
    gameState = 'expenses';
    
    // Remove UI elements
    Object.values(categoryButtons).forEach(btn => btn.destroy());
    finishBuildButton.destroy();
    if (upgradeButton) upgradeButton.destroy();
    if (ghostBlock) ghostBlock.destroy();
    
    // Make all blocks dynamic (no longer static)
    placedBlocks.forEach(block => {
        this.matter.body.setStatic(block.body, false);
        // Disable interactivity during expense phase
        if (block.container) {
            block.container.disableInteractive();
        }
    });

    // Clear any visuals and start expense phase
    this.time.delayedCall(500, () => {
        startExpensePhase.call(this);
    });
}

function startExpensePhase() {
    phaseText.setText('💸 EXPENSE PHASE - Brace Yourself!');

    // Set up collision handling for expenses hitting blocks
    currentScene.matter.world.on('collisionstart', (event) => {
        event.pairs.forEach((pair) => {
            handleExpenseCollision.call(currentScene, pair);
        });
    });

    // Launch expenses from all sides
    let delay = 1000;
    
    Object.keys(expensesData).forEach(key => {
        const expenseData = expensesData[key];
        const cat = categories[key];
        
        for (let i = 0; i < expenseData.count; i++) {
            this.time.delayedCall(delay, () => {
                launchExpense.call(this, key, cat);
            });
            delay += Phaser.Math.Between(300, 800);
        }
    });

    // Check for completion
    this.time.delayedCall(delay + 3000, () => {
        checkGameResult.call(this);
    });
}

function handleExpenseCollision(pair) {
    const { bodyA, bodyB } = pair;
    
    // Find if one is an expense
    let expenseBody = null;
    let blockBody = null;
    
    if (bodyA.label && bodyA.label.startsWith('expense_')) {
        expenseBody = bodyA;
        blockBody = bodyB;
    } else if (bodyB.label && bodyB.label.startsWith('expense_')) {
        expenseBody = bodyB;
        blockBody = bodyA;
    }
    
    if (!expenseBody || !blockBody) return;
    
    // Get expense category
    const expenseCategory = expenseBody.label.replace('expense_', '');
    
    // Find matching block
    const matchingBlock = placedBlocks.find(block => {
        return block.body === blockBody && block.category === expenseCategory;
    });
    
    if (!matchingBlock) return;
    
    // Find the expense object
    const expense = incomingExpenses.find(e => e.body === expenseBody);
    if (!expense || expense.used) return;
    
    expense.used = true; // Mark as used
    
    // Damage the block
    const damage = 30; // Each expense projectile does $30 damage
    matchingBlock.health -= damage;
    
    // Update health display
    if (matchingBlock.health > 0) {
        matchingBlock.healthText.setText(`$${matchingBlock.health}`);
        
        // Flash effect
        currentScene.tweens.add({
            targets: matchingBlock.container,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 1
        });
        
        // Damage text
        const damageText = currentScene.add.text(
            matchingBlock.container.x,
            matchingBlock.container.y - 30,
            `-$${damage}`,
            {
                fontSize: '16px',
                fontFamily: 'Segoe UI',
                color: '#FF6347',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        
        currentScene.tweens.add({
            targets: damageText,
            y: matchingBlock.container.y - 60,
            alpha: 0,
            duration: 1000,
            onComplete: () => damageText.destroy()
        });
    } else {
        // Block destroyed
        destroyBlock.call(currentScene, matchingBlock);
    }
    
    // Remove expense projectile with explosion effect
    const cat = categories[expenseCategory];
    
    // Small explosion particles
    for (let i = 0; i < 8; i++) {
        const particle = currentScene.add.circle(
            expenseBody.position.x,
            expenseBody.position.y,
            3,
            cat.color
        );
        
        const angle = (i / 8) * Math.PI * 2;
        
        currentScene.tweens.add({
            targets: particle,
            x: particle.x + Math.cos(angle) * 30,
            y: particle.y + Math.sin(angle) * 30,
            alpha: 0,
            duration: 300,
            onComplete: () => particle.destroy()
        });
    }
    
    currentScene.matter.world.remove(expenseBody);
    if (expense.container) expense.container.destroy();
}

function destroyBlock(block) {
    // Remove from physics world
    this.matter.world.remove(block.body);
    
    // Destroy container and all visuals
    if (block.container) block.container.destroy();
    
    // Particle explosion effect
    const cat = categories[block.category];
    for (let i = 0; i < 15; i++) {
        const particle = this.add.rectangle(
            block.body.position.x,
            block.body.position.y,
            10,
            10,
            cat.color
        );
        
        const angle = (i / 15) * Math.PI * 2;
        const speed = Phaser.Math.Between(100, 200);
        
        this.tweens.add({
            targets: particle,
            x: particle.x + Math.cos(angle) * speed,
            y: particle.y + Math.sin(angle) * speed,
            alpha: 0,
            rotation: Math.PI * 2,
            duration: 800,
            onComplete: () => particle.destroy()
        });
    }
    
    // Show destruction message
    const destroyMsg = this.add.text(
        block.body.position.x,
        block.body.position.y,
        '💥 DESTROYED!',
        {
            fontSize: '20px',
            fontFamily: 'Segoe UI',
            color: '#FF6347',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }
    ).setOrigin(0.5);
    
    this.tweens.add({
        targets: destroyMsg,
        y: block.body.position.y - 50,
        alpha: 0,
        scale: 1.5,
        duration: 1500,
        onComplete: () => destroyMsg.destroy()
    });
    
    // Remove from array
    const index = placedBlocks.indexOf(block);
    if (index > -1) {
        placedBlocks.splice(index, 1);
    }
}

function launchExpense(categoryKey, category) {
    // Random side: 0=top, 1=right, 2=bottom, 3=left
    const side = Phaser.Math.Between(0, 3);
    let x, y, velocityX, velocityY;

    switch(side) {
        case 0: // Top
            x = Phaser.Math.Between(100, 900);
            y = -50;
            velocityX = Phaser.Math.Between(-3, 3);
            velocityY = Phaser.Math.Between(8, 12); // Fast downward
            break;
        case 1: // Right
            x = 1050;
            y = Phaser.Math.Between(100, 600);
            velocityX = Phaser.Math.Between(-12, -8); // Fast leftward
            velocityY = Phaser.Math.Between(-3, 3);
            break;
        case 2: // Bottom
            x = Phaser.Math.Between(100, 900);
            y = 750;
            velocityX = Phaser.Math.Between(-3, 3);
            velocityY = Phaser.Math.Between(-12, -8); // Fast upward
            break;
        case 3: // Left
            x = -50;
            y = Phaser.Math.Between(100, 600);
            velocityX = Phaser.Math.Between(8, 12); // Fast rightward
            velocityY = Phaser.Math.Between(-3, 3);
            break;
    }

    // Create small laser-like expense projectile
    const expense = this.matter.add.circle(x, y, 12, {
        friction: 0,
        frictionAir: 0,
        restitution: 0.8,
        label: `expense_${categoryKey}`,
        isSensor: false
    });

    this.matter.body.setVelocity(expense, { x: velocityX, y: velocityY });

    // Create laser blast visual
    const container = this.add.container(x, y);
    
    // Outer glow
    const glow = this.add.circle(0, 0, 15, category.color, 0.3);
    
    // Core
    const core = this.add.circle(0, 0, 10, category.color, 1);
    
    // Inner bright spot
    const bright = this.add.circle(0, 0, 5, 0xFFFFFF, 0.8);
    
    // Tail/trail effect
    const trail = this.add.graphics();
    trail.fillStyle(category.color, 0.5);
    const angle = Math.atan2(velocityY, velocityX);
    trail.fillEllipse(-Math.cos(angle) * 15, -Math.sin(angle) * 15, 20, 8);
    trail.rotation = angle;
    
    container.add([trail, glow, core, bright]);

    // Add dollar sign icon
    const icon = this.add.text(0, 0, '💸', {
        fontSize: '14px'
    }).setOrigin(0.5);
    container.add(icon);

    // Pulsing animation
    this.tweens.add({
        targets: glow,
        scale: 1.3,
        alpha: 0.1,
        duration: 300,
        yoyo: true,
        repeat: -1
    });

    incomingExpenses.push({ 
        body: expense, 
        container: container,
        category: categoryKey,
        used: false 
    });
}

function checkGameResult() {
    // Check if player was hit
    const playerHit = checkPlayerCollision.call(this);
    
    gameState = 'result';
    showResultScreen.call(this, !playerHit);
}

function checkPlayerCollision() {
    // Simple distance check between player and expenses
    let hit = false;
    
    incomingExpenses.forEach(expense => {
        const dx = expense.body.position.x - player.body.position.x;
        const dy = expense.body.position.y - player.body.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 40) {
            hit = true;
        }
    });

    return hit;
}

function showResultScreen(success) {
    // Overlay
    const overlay = this.add.rectangle(500, 350, 1000, 700, 0x000000, 0.85);
    overlay.setDepth(200);

    if (success) {
        // Success!
        this.add.text(500, 200, '🎉 BUDGET DEFENDED! 🎉', {
            fontSize: '56px',
            fontFamily: 'Segoe UI',
            color: '#27AE60',
            fontStyle: 'bold',
            stroke: '#fff',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(201);

        remainingBudget = totalBudget;
        totalBudget = 3000 + remainingBudget;

        this.add.text(500, 300, `Month ${currentMonth} Complete!`, {
            fontSize: '32px',
            fontFamily: 'Segoe UI',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201);

        this.add.text(500, 360, `Budget Remaining: $${remainingBudget}`, {
            fontSize: '28px',
            fontFamily: 'Segoe UI',
            color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201);

        this.add.text(500, 410, `Next Month Budget: $${totalBudget}`, {
            fontSize: '24px',
            fontFamily: 'Segoe UI',
            color: '#87CEEB',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201);

        // Next month button
        const nextButton = this.add.rectangle(500, 520, 280, 70, 0x27AE60);
        nextButton.setStrokeStyle(4, 0x1E8449);
        nextButton.setInteractive({ useHandCursor: true });
        nextButton.setDepth(201);

        const nextText = this.add.text(500, 520, 'NEXT MONTH', {
            fontSize: '32px',
            fontFamily: 'Segoe UI',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201);

        nextButton.on('pointerover', () => nextButton.setFillStyle(0x2ECC71));
        nextButton.on('pointerout', () => nextButton.setFillStyle(0x27AE60));
        nextButton.on('pointerdown', () => {
            currentMonth++;
            placedBlocks = [];
            incomingExpenses = [];
            gameState = 'build';
            this.scene.restart();
        });

    } else {
        // Failed
        this.add.text(500, 200, '💥 BUDGET BREACHED! 💥', {
            fontSize: '56px',
            fontFamily: 'Segoe UI',
            color: '#E74C3C',
            fontStyle: 'bold',
            stroke: '#fff',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(201);

        this.add.text(500, 300, `You survived ${currentMonth} month${currentMonth > 1 ? 's' : ''}!`, {
            fontSize: '32px',
            fontFamily: 'Segoe UI',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201);

        this.add.text(500, 360, 'Your budget structure wasn\'t strong enough!', {
            fontSize: '24px',
            fontFamily: 'Segoe UI',
            color: '#FFD700'
        }).setOrigin(0.5).setDepth(201);

        // Retry button
        const retryButton = this.add.rectangle(500, 480, 280, 70, 0xFF6347);
        retryButton.setStrokeStyle(4, 0xC0392B);
        retryButton.setInteractive({ useHandCursor: true });
        retryButton.setDepth(201);

        const retryText = this.add.text(500, 480, 'TRY AGAIN', {
            fontSize: '32px',
            fontFamily: 'Segoe UI',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201);

        retryButton.on('pointerover', () => retryButton.setFillStyle(0xFF4500));
        retryButton.on('pointerout', () => retryButton.setFillStyle(0xFF6347));
        retryButton.on('pointerdown', () => {
            // Reset game
            currentMonth = 1;
            totalBudget = 3000;
            remainingBudget = 0;
            placedBlocks = [];
            incomingExpenses = [];
            gameState = 'build';
            this.scene.restart();
        });
    }

    // Tips
    const tips = [
        'TIP: Build a wide base for stability!',
        'TIP: Use savings (hexagon) as a foundation!',
        'TIP: Balance heavy blocks with lighter ones!',
        'TIP: Prepare for the highest expenses!',
        'TIP: A pyramid structure is very stable!'
    ];

    this.add.text(500, 620, Phaser.Utils.Array.GetRandom(tips), {
        fontSize: '20px',
        fontFamily: 'Segoe UI',
        color: '#87CEEB',
        fontStyle: 'italic'
    }).setOrigin(0.5).setDepth(201);
}

function update() {
    if (gameState === 'expenses' || gameState === 'result') {
        // Update visual positions for physics bodies
        placedBlocks.forEach(block => {
            if (block.body && block.container) {
                const pos = block.body.position;
                const angle = block.body.angle;
                
                block.container.x = pos.x;
                block.container.y = pos.y;
                block.container.rotation = angle;
            }
        });

        incomingExpenses.forEach(expense => {
            if (expense.body && expense.container) {
                const pos = expense.body.position;
                
                expense.container.x = pos.x;
                expense.container.y = pos.y;
            }
        });
    }

    // Update player visual position
    if (player && player.body) {
        player.x = player.body.position.x;
        player.y = player.body.position.y;
    }
}