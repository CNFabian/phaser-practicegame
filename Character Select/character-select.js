// Character Select Screen Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    backgroundColor: '#0a0a0a',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    render: {
        pixelArt: false,
        antialias: true
    }
};

// Game variables
let characters = [];
let selectedCharacter = null;
let hoveredCharacter = null;
let spotlight;
let backgroundOverlay;
let characterPositions = [];
let titleText;
let selectText;
let characterNameText;
let characterDescText;

// Character data - you can replace these with your actual GIF assets
const characterData = [
    {
        name: "WARRIOR",
        description: "A fierce fighter with unmatched strength",
        staticImage: "warrior_static",
        animatedImage: "warrior_animated",
        color: 0xff4444
    },
    {
        name: "MAGE",
        description: "Master of ancient magical arts",
        staticImage: "mage_static", 
        animatedImage: "mage_animated",
        color: 0x4444ff
    },
    {
        name: "ARCHER",
        description: "Swift and deadly with precision shots",
        staticImage: "archer_static",
        animatedImage: "archer_animated", 
        color: 0x44ff44
    },
    {
        name: "ROGUE",
        description: "Silent assassin who strikes from shadows",
        staticImage: "rogue_static",
        animatedImage: "rogue_animated",
        color: 0xff44ff
    },
    {
        name: "PALADIN",
        description: "Holy warrior blessed with divine power",
        staticImage: "paladin_static",
        animatedImage: "paladin_animated",
        color: 0xffff44
    }
];

const game = new Phaser.Game(config);

function preload() {
    // Remove loading text
    document.querySelector('.loading').style.display = 'none';
    
    // Create placeholder character assets since we don't have actual GIFs
    // In a real implementation, you would load your GIF assets here like this:
    // this.load.image('warrior_static', 'assets/warrior_idle.png');
    // this.load.spritesheet('warrior_animated', 'assets/warrior_animated.gif', { frameWidth: 128, frameHeight: 128 });
    
    createPlaceholderAssets.call(this);
}

function createPlaceholderAssets() {
    // Create placeholder graphics for each character
    characterData.forEach((char, index) => {
        // Static version (darker, less detailed)
        const staticGraphics = this.add.graphics();
        staticGraphics.fillStyle(char.color, 0.6);
        staticGraphics.fillRoundedRect(0, 0, 120, 160, 10);
        staticGraphics.fillStyle(0xffffff, 0.3);
        staticGraphics.fillCircle(60, 40, 20); // Head
        staticGraphics.fillRect(45, 60, 30, 60); // Body
        staticGraphics.fillRect(35, 120, 15, 40); // Left leg
        staticGraphics.fillRect(70, 120, 15, 40); // Right leg
        staticGraphics.fillRect(20, 70, 15, 30); // Left arm
        staticGraphics.fillRect(85, 70, 15, 30); // Right arm
        
        // Generate texture from graphics
        staticGraphics.generateTexture(char.staticImage, 120, 160);
        staticGraphics.destroy();
        
        // Animated version (brighter, more detailed)
        const animGraphics = this.add.graphics();
        animGraphics.fillStyle(char.color, 1.0);
        animGraphics.fillRoundedRect(0, 0, 120, 160, 10);
        animGraphics.lineStyle(3, 0xffffff, 1);
        animGraphics.strokeRoundedRect(0, 0, 120, 160, 10);
        
        // More detailed character
        animGraphics.fillStyle(0xffd4a3, 1); // Skin tone
        animGraphics.fillCircle(60, 40, 22); // Head
        
        animGraphics.fillStyle(0x333333, 1); // Dark details
        animGraphics.fillCircle(52, 35, 3); // Left eye
        animGraphics.fillCircle(68, 35, 3); // Right eye
        animGraphics.fillRect(55, 45, 10, 2); // Mouth
        
        animGraphics.fillStyle(char.color, 1);
        animGraphics.fillRect(40, 60, 40, 65); // Body
        animGraphics.fillRect(30, 125, 20, 35); // Left leg
        animGraphics.fillRect(70, 125, 20, 35); // Right leg
        animGraphics.fillRect(15, 70, 20, 35); // Left arm
        animGraphics.fillRect(85, 70, 20, 35); // Right arm
        
        // Add glowing effect
        animGraphics.lineStyle(2, 0xffffff, 0.8);
        animGraphics.strokeCircle(60, 80, 70);
        
        animGraphics.generateTexture(char.animatedImage, 120, 160);
        animGraphics.destroy();
    });
}

function create() {
    // Create dark background overlay
    backgroundOverlay = this.add.rectangle(600, 400, 1200, 800, 0x000000, 0.85);
    
    // Create title
    titleText = this.add.text(600, 100, 'CHARACTER SELECT', {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#00aaff',
        fontStyle: 'bold',
        stroke: '#003366',
        strokeThickness: 4
    }).setOrigin(0.5);
    
    // Add glowing effect to title
    titleText.setBlendMode(Phaser.BlendModes.ADD);
    
    // Create spotlight (initially invisible)
    spotlight = this.add.graphics();
    spotlight.setDepth(10);
    spotlight.setVisible(false);
    
    // Calculate character positions
    const startX = 150;
    const spacing = 200;
    const yPos = 400;
    
    characterData.forEach((charData, index) => {
        const x = startX + (index * spacing);
        characterPositions.push({ x: x, y: yPos });
    });
    
    // Create characters
    createCharacters.call(this);
    
    // Create UI text
    characterNameText = this.add.text(600, 650, '', {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    characterDescText = this.add.text(600, 700, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#cccccc',
        wordWrap: { width: 600 }
    }).setOrigin(0.5);
    
    selectText = this.add.text(600, 750, 'Hover over characters to see them come alive!', {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#888888',
        fontStyle: 'italic'
    }).setOrigin(0.5);
    
    // Add floating particles for ambiance
    createAmbientParticles.call(this);
}

function createCharacters() {
    characterData.forEach((charData, index) => {
        const pos = characterPositions[index];
        
        // Create character container
        const characterContainer = this.add.container(pos.x, pos.y);
        
        // Static character image (always visible but dim)
        const staticChar = this.add.image(0, 0, charData.staticImage);
        staticChar.setAlpha(0.4);
        staticChar.setScale(1.0);
        
        // Animated character image (only visible when hovered)
        const animatedChar = this.add.image(0, 0, charData.animatedImage);
        animatedChar.setAlpha(0);
        animatedChar.setScale(1.0);
        
        // Character selection area (invisible but interactive)
        const selectionArea = this.add.rectangle(0, 0, 150, 200, 0xffffff, 0);
        selectionArea.setInteractive({ useHandCursor: true });
        
        // Character nameplate
        const nameplate = this.add.rectangle(0, 100, 140, 30, 0x000000, 0.8);
        nameplate.setStrokeStyle(2, charData.color);
        
        const nameText = this.add.text(0, 100, charData.name, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Add everything to container
        characterContainer.add([staticChar, animatedChar, selectionArea, nameplate, nameText]);
        
        // Store references
        const characterObj = {
            container: characterContainer,
            staticImage: staticChar,
            animatedImage: animatedChar,
            selectionArea: selectionArea,
            nameplate: nameplate,
            nameText: nameText,
            data: charData,
            index: index,
            isHovered: false,
            isSelected: false
        };
        
        characters.push(characterObj);
        
        // Set up hover events
        setupCharacterEvents.call(this, characterObj);
    });
}

function setupCharacterEvents(characterObj) {
    const selectionArea = characterObj.selectionArea;
    
    // Hover enter
    selectionArea.on('pointerover', () => {
        if (hoveredCharacter && hoveredCharacter !== characterObj) {
            onCharacterHoverExit.call(this, hoveredCharacter);
        }
        hoveredCharacter = characterObj;
        onCharacterHoverEnter.call(this, characterObj);
    });
    
    // Hover exit
    selectionArea.on('pointerout', () => {
        if (hoveredCharacter === characterObj) {
            onCharacterHoverExit.call(this, characterObj);
            hoveredCharacter = null;
        }
    });
    
    // Click to select
    selectionArea.on('pointerdown', () => {
        onCharacterSelect.call(this, characterObj);
    });
}

function onCharacterHoverEnter(characterObj) {
    characterObj.isHovered = true;
    
    // Activate spotlight
    createSpotlight.call(this, characterObj);
    
    // Animate character activation
    this.tweens.add({
        targets: characterObj.staticImage,
        alpha: 0,
        duration: 300,
        ease: 'Power2'
    });
    
    this.tweens.add({
        targets: characterObj.animatedImage,
        alpha: 1,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 300,
        ease: 'Back.easeOut'
    });
    
    // Enhance nameplate
    this.tweens.add({
        targets: characterObj.nameplate,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        ease: 'Power2'
    });
    
    // Update UI text
    characterNameText.setText(characterObj.data.name);
    characterDescText.setText(characterObj.data.description);
    
    // Character name glow effect
    this.tweens.add({
        targets: characterNameText,
        alpha: 1,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200
    });
    
    // Add floating effect to character
    this.tweens.add({
        targets: characterObj.container,
        y: characterObj.container.y - 10,
        duration: 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
    });
    
    // Add pulsing glow effect
    const glowTween = this.tweens.add({
        targets: characterObj.animatedImage,
        alpha: 0.8,
        duration: 800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
    });
    
    characterObj.glowTween = glowTween;
    
    // Dim other characters
    characters.forEach(char => {
        if (char !== characterObj && !char.isSelected) {
            this.tweens.add({
                targets: char.container,
                alpha: 0.3,
                duration: 300
            });
        }
    });
}

function onCharacterHoverExit(characterObj) {
    characterObj.isHovered = false;
    
    // Remove spotlight
    spotlight.setVisible(false);
    
    // Deactivate character animation
    this.tweens.add({
        targets: characterObj.staticImage,
        alpha: 0.4,
        duration: 300
    });
    
    this.tweens.add({
        targets: characterObj.animatedImage,
        alpha: 0,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 300
    });
    
    // Reset nameplate
    this.tweens.add({
        targets: characterObj.nameplate,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 200
    });
    
    // Stop floating and glow effects
    this.tweens.killTweensOf(characterObj.container);
    if (characterObj.glowTween) {
        characterObj.glowTween.destroy();
    }
    
    // Reset container position
    characterObj.container.y = characterPositions[characterObj.index].y;
    
    // Restore other characters
    characters.forEach(char => {
        if (!char.isSelected) {
            this.tweens.add({
                targets: char.container,
                alpha: 1.0,
                duration: 300
            });
        }
    });
    
    // Clear UI text if this was the hovered character
    if (!selectedCharacter) {
        characterNameText.setText('');
        characterDescText.setText('');
        this.tweens.add({
            targets: characterNameText,
            alpha: 0.8,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 200
        });
    }
}

function onCharacterSelect(characterObj) {
    // Deselect previous character
    if (selectedCharacter) {
        selectedCharacter.isSelected = false;
        selectedCharacter.container.setAlpha(1.0);
    }
    
    selectedCharacter = characterObj;
    characterObj.isSelected = true;
    
    // Add selection effect
    this.tweens.add({
        targets: characterObj.container,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 200,
        ease: 'Back.easeOut',
        yoyo: true,
        repeat: 1
    });
    
    // Update select text
    selectText.setText(`${characterObj.data.name} selected! Click another to change selection.`);
    selectText.setColor('#00ff00');
    
    // Selection confirmation effect
    const confirmEffect = this.add.graphics();
    confirmEffect.lineStyle(5, characterObj.data.color, 1);
    confirmEffect.strokeCircle(characterObj.container.x, characterObj.container.y, 100);
    confirmEffect.setAlpha(0);
    
    this.tweens.add({
        targets: confirmEffect,
        alpha: 1,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
            confirmEffect.destroy();
        }
    });
}

function createSpotlight(characterObj) {
    spotlight.clear();
    spotlight.setVisible(true);
    
    const centerX = characterObj.container.x;
    const centerY = characterObj.container.y;
    
    // Create radial gradient spotlight effect
    const radius = 120;
    const colors = [
        { stop: 0, color: 0xffffff, alpha: 0.3 },
        { stop: 0.3, color: 0xffffff, alpha: 0.2 },
        { stop: 0.6, color: characterObj.data.color, alpha: 0.1 },
        { stop: 1, color: 0x000000, alpha: 0 }
    ];
    
    // Draw spotlight cone from top
    spotlight.fillStyle(0xffffff, 0.1);
    spotlight.fillTriangle(centerX - 20, 0, centerX + 20, 0, centerX, centerY - 80);
    
    // Draw main spotlight circle
    spotlight.fillGradientStyle(0xffffff, 0xffffff, characterObj.data.color, characterObj.data.color, 0.4, 0.4, 0.1, 0.1);
    spotlight.fillCircle(centerX, centerY, radius);
    
    // Animate spotlight intensity
    this.tweens.add({
        targets: spotlight,
        alpha: 0.7,
        duration: 600,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
    });
}

function createAmbientParticles() {
    // Create floating ambient particles
    for (let i = 0; i < 20; i++) {
        const particle = this.add.graphics();
        const x = Phaser.Math.Between(0, 1200);
        const y = Phaser.Math.Between(0, 800);
        const size = Phaser.Math.Between(1, 3);
        
        particle.fillStyle(0x00aaff, 0.3);
        particle.fillCircle(0, 0, size);
        particle.x = x;
        particle.y = y;
        
        // Animate particle movement
        this.tweens.add({
            targets: particle,
            y: y - Phaser.Math.Between(50, 200),
            alpha: 0,
            duration: Phaser.Math.Between(3000, 8000),
            ease: 'Power1',
            repeat: -1,
            onRepeat: () => {
                particle.x = Phaser.Math.Between(0, 1200);
                particle.y = 850;
                particle.alpha = 0.3;
            }
        });
    }
}

function update() {
    // Add subtle background animation
    if (backgroundOverlay) {
        backgroundOverlay.alpha = 0.85 + Math.sin(this.time.now / 2000) * 0.05;
    }
    
    // Update title glow
    if (titleText) {
        titleText.setTint(Phaser.Display.Color.HSVToRGB(
            (this.time.now / 50) % 1, 
            0.8, 
            1
        ).color);
    }
}