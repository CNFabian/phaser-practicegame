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

// Category Configuration - Each has unique shape and properties
const categories = {
    housing: {
        name: 'Housing',
        color: 0x8B4513,
        shape: 'rectangle',
        width: 120,
        height: 80,
        cost: 100,
        icon: '🏠'
    },
    food: {
        name: 'Food',
        color: 0xFF6347,
        shape: 'circle',
        radius: 45,
        cost: 80,
        icon: '🍔'
    },
    transport: {
        name: 'Transport',
        color: 0x4169E1,
        shape: 'trapezoid',
        width: 100,
        height: 70,
        cost: 70,
        icon: '🚗'
    },
    utilities: {
        name: 'Utilities',
        color: 0xFFD700,
        shape: 'triangle',
        size: 90,
        cost: 60,
        icon: '💡'
    },
    entertainment: {
        name: 'Entertainment',
        color: 0xFF1493,
        shape: 'pentagon',
        radius: 50,
        cost: 50,
        icon: '🎮'
    },
    savings: {
        name: 'Savings',
        color: 0x32CD32,
        shape: 'hexagon',
        radius: 45,
        cost: 90,
        icon: '💰'
    }
};

// Player/Character
let player;
let placedBlocks = [];
let selectedCategory = null;
let ghostBlock = null;

// UI Elements
let budgetText;
let monthText;
let phaseText;
let categoryButtons = {};
let startBuildButton;
let finishBuildButton;

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
        '🏗️ BUILD PHASE: Place budget blocks to protect your character',
        '💸 EXPENSE PHASE: Incoming expenses attack specific categories',
        '🎯 GOAL: Build a stable structure that survives all expenses',
        '',
        '📦 Each shape = different budget category:',
        '   🏠 Housing (Rectangle) • 🍔 Food (Circle) • 🚗 Transport (Trapezoid)',
        '   💡 Utilities (Triangle) • 🎮 Entertainment (Pentagon) • 💰 Savings (Hexagon)',
        '',
        '💡 TIP: Balance your structure - use all categories wisely!',
        '✨ Leftover budget carries to next month!'
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

    // Create category selection buttons
    let yPos = 150;
    Object.keys(categories).forEach((key, index) => {
        const cat = categories[key];
        const button = createCategoryButton.call(this, key, cat, 850, yPos);
        categoryButtons[key] = button;
        yPos += 100;
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
        if (selectedCategory && ghostBlock && gameState === 'build') {
            ghostBlock.x = pointer.x;
            ghostBlock.y = pointer.y;
        }
    });

    this.input.on('pointerdown', (pointer) => {
        if (selectedCategory && pointer.x < 800 && gameState === 'build') {
            placeBlock.call(this, pointer.x, pointer.y);
        }
    });
}

function createCategoryButton(key, category, x, y) {
    const container = this.add.container(x, y);

    // Button background
    const bg = this.add.rectangle(0, 0, 140, 80, category.color, 0.8);
    bg.setStrokeStyle(3, 0xffffff);
    bg.setInteractive({ useHandCursor: true });

    // Icon and name
    const icon = this.add.text(0, -15, category.icon, {
        fontSize: '32px'
    }).setOrigin(0.5);

    const name = this.add.text(0, 15, category.name, {
        fontSize: '14px',
        fontFamily: 'Segoe UI',
        color: '#ffffff',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    const cost = this.add.text(0, 30, `$${category.cost}`, {
        fontSize: '12px',
        fontFamily: 'Segoe UI',
        color: '#FFD700',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, icon, name, cost]);

    bg.on('pointerdown', () => {
        if (totalBudget >= category.cost) {
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
    selectedCategory = key;
    
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

function createGhostBlock(categoryKey) {
    const cat = categories[categoryKey];
    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0xFFFFFF, 0.8);
    graphics.fillStyle(cat.color, 0.3);

    drawCategoryShape(graphics, cat, 0, 0);
    graphics.setDepth(100);

    return graphics;
}

function drawCategoryShape(graphics, category, x, y) {
    switch(category.shape) {
        case 'rectangle':
            graphics.fillRect(x - category.width/2, y - category.height/2, category.width, category.height);
            graphics.strokeRect(x - category.width/2, y - category.height/2, category.width, category.height);
            break;
        case 'circle':
            graphics.fillCircle(x, y, category.radius);
            graphics.strokeCircle(x, y, category.radius);
            break;
        case 'triangle':
            graphics.beginPath();
            graphics.moveTo(x, y - category.size/2);
            graphics.lineTo(x - category.size/2, y + category.size/2);
            graphics.lineTo(x + category.size/2, y + category.size/2);
            graphics.closePath();
            graphics.fillPath();
            graphics.strokePath();
            break;
        case 'trapezoid':
            graphics.beginPath();
            graphics.moveTo(x - category.width/3, y - category.height/2);
            graphics.lineTo(x + category.width/3, y - category.height/2);
            graphics.lineTo(x + category.width/2, y + category.height/2);
            graphics.lineTo(x - category.width/2, y + category.height/2);
            graphics.closePath();
            graphics.fillPath();
            graphics.strokePath();
            break;
        case 'pentagon':
            drawPolygon(graphics, x, y, category.radius, 5);
            break;
        case 'hexagon':
            drawPolygon(graphics, x, y, category.radius, 6);
            break;
    }
}

function drawPolygon(graphics, x, y, radius, sides) {
    graphics.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        if (i === 0) {
            graphics.moveTo(px, py);
        } else {
            graphics.lineTo(px, py);
        }
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
}

function placeBlock(x, y) {
    if (!selectedCategory || totalBudget < categories[selectedCategory].cost) return;

    const cat = categories[selectedCategory];
    
    // Create physics body based on shape
    let body;
    const options = {
        friction: 0.8,
        restitution: 0.1,
        label: selectedCategory
    };

    switch(cat.shape) {
        case 'rectangle':
            body = this.matter.add.rectangle(x, y, cat.width, cat.height, options);
            break;
        case 'circle':
            body = this.matter.add.circle(x, y, cat.radius, options);
            break;
        case 'triangle':
            const triangleVertices = [
                { x: 0, y: -cat.size/2 },
                { x: -cat.size/2, y: cat.size/2 },
                { x: cat.size/2, y: cat.size/2 }
            ];
            body = this.matter.add.fromVertices(x, y, triangleVertices, options);
            break;
        case 'trapezoid':
            const trapVertices = [
                { x: -cat.width/3, y: -cat.height/2 },
                { x: cat.width/3, y: -cat.height/2 },
                { x: cat.width/2, y: cat.height/2 },
                { x: -cat.width/2, y: cat.height/2 }
            ];
            body = this.matter.add.fromVertices(x, y, trapVertices, options);
            break;
        case 'pentagon':
            body = this.matter.add.polygon(x, y, 5, cat.radius, options);
            break;
        case 'hexagon':
            body = this.matter.add.polygon(x, y, 6, cat.radius, options);
            break;
    }

    // Create visual
    const graphics = this.add.graphics();
    graphics.fillStyle(cat.color, 1);
    graphics.lineStyle(3, 0x000000);
    drawCategoryShape(graphics, cat, x, y);

    // Add icon
    const icon = this.add.text(x, y, cat.icon, {
        fontSize: '24px'
    }).setOrigin(0.5);

    placedBlocks.push({ body, graphics, icon, category: selectedCategory });

    // Deduct from budget
    totalBudget -= cat.cost;
    budgetText.setText(`Budget: $${totalBudget}`);

    // Clear selection if no budget left
    if (totalBudget < cat.cost) {
        selectedCategory = null;
        if (ghostBlock) {
            ghostBlock.destroy();
            ghostBlock = null;
        }
    }
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
    if (ghostBlock) ghostBlock.destroy();

    // Clear any visuals and start expense phase
    this.time.delayedCall(500, () => {
        startExpensePhase.call(this);
    });
}

function startExpensePhase() {
    phaseText.setText('💸 EXPENSE PHASE - Brace Yourself!');

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

function launchExpense(categoryKey, category) {
    // Random side: 0=top, 1=right, 2=bottom, 3=left
    const side = Phaser.Math.Between(0, 3);
    let x, y, velocityX, velocityY;

    switch(side) {
        case 0: // Top
            x = Phaser.Math.Between(100, 900);
            y = -50;
            velocityX = Phaser.Math.Between(-2, 2);
            velocityY = Phaser.Math.Between(4, 7);
            break;
        case 1: // Right
            x = 1050;
            y = Phaser.Math.Between(100, 600);
            velocityX = Phaser.Math.Between(-7, -4);
            velocityY = Phaser.Math.Between(-2, 2);
            break;
        case 2: // Bottom
            x = Phaser.Math.Between(100, 900);
            y = 750;
            velocityX = Phaser.Math.Between(-2, 2);
            velocityY = Phaser.Math.Between(-7, -4);
            break;
        case 3: // Left
            x = -50;
            y = Phaser.Math.Between(100, 600);
            velocityX = Phaser.Math.Between(4, 7);
            velocityY = Phaser.Math.Between(-2, 2);
            break;
    }

    // Create expense projectile
    const expense = this.matter.add.circle(x, y, 20, {
        friction: 0.1,
        restitution: 0.8,
        label: `expense_${categoryKey}`
    });

    this.matter.body.setVelocity(expense, { x: velocityX, y: velocityY });

    // Visual
    const graphics = this.add.graphics();
    graphics.fillStyle(category.color, 1);
    graphics.lineStyle(2, 0x000000);
    graphics.fillCircle(0, 0, 20);
    graphics.strokeCircle(0, 0, 20);

    const icon = this.add.text(0, 0, '💸', {
        fontSize: '20px'
    }).setOrigin(0.5);

    incomingExpenses.push({ body: expense, graphics, icon, category: categoryKey });
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
            if (block.body && block.graphics) {
                const pos = block.body.position;
                const angle = block.body.angle;
                
                block.graphics.x = pos.x;
                block.graphics.y = pos.y;
                block.graphics.rotation = angle;
                
                block.icon.x = pos.x;
                block.icon.y = pos.y;
                block.icon.rotation = angle;
            }
        });

        incomingExpenses.forEach(expense => {
            if (expense.body && expense.graphics) {
                const pos = expense.body.position;
                
                expense.graphics.x = pos.x;
                expense.graphics.y = pos.y;
                
                expense.icon.x = pos.x;
                expense.icon.y = pos.y;
            }
        });
    }

    // Update player visual position
    if (player && player.body) {
        player.x = player.body.position.x;
        player.y = player.body.position.y;
    }
}