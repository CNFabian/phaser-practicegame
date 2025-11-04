// Enhanced Character Select with Advanced GIF Support
const config = {
    type: Phaser.AUTO,
    width: 1400,
    height: 900,
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

// Enhanced game variables
let characters = [];
let selectedCharacter = null;
let hoveredCharacter = null;
let spotlightGraphics;
let backgroundLayer;
let foregroundEffects;
let characterPositions = [];
let titleText;
let characterNameText;
let characterDescText;
let characterStatsUI;
let ambientMusic;

// Enhanced character data with more properties
const characterData = [
    {
        name: "SHADOW ASSASSIN",
        description: "Master of stealth and precision strikes",
        staticImage: "assassin_idle",
        animatedGif: "assassin_stealth", // Your actual GIF files
        color: 0x2d1b69,
        accentColor: 0x8b5cf6,
        stats: { attack: 9, defense: 4, magic: 6, speed: 10 },
        voiceLine: "Death from the shadows...",
        unlocked: true
    },
    {
        name: "FLAME SORCERESS", 
        description: "Wielder of devastating fire magic",
        staticImage: "sorceress_idle",
        animatedGif: "sorceress_casting",
        color: 0xff4500,
        accentColor: 0xffa500,
        stats: { attack: 6, defense: 5, magic: 10, speed: 7 },
        voiceLine: "Feel the burn!",
        unlocked: true
    },
    {
        name: "FROST KNIGHT",
        description: "Armored warrior of ice and honor",
        staticImage: "knight_idle", 
        animatedGif: "knight_combat",
        color: 0x1e40af,
        accentColor: 0x60a5fa,
        stats: { attack: 8, defense: 9, magic: 5, speed: 6 },
        voiceLine: "Honor and ice!",
        unlocked: true
    },
    {
        name: "STORM ARCHER",
        description: "Swift hunter who commands lightning",
        staticImage: "archer_idle",
        animatedGif: "archer_shooting", 
        color: 0x059669,
        accentColor: 0x10b981,
        stats: { attack: 8, defense: 6, magic: 7, speed: 9 },
        voiceLine: "Swift as the wind!",
        unlocked: true
    },
    {
        name: "VOID WARLOCK",
        description: "Forbidden magic from beyond reality",
        staticImage: "warlock_idle",
        animatedGif: "warlock_ritual",
        color: 0x7c2d92,
        accentColor: 0xc084fc,
        stats: { attack: 7, defense: 6, magic: 9, speed: 5 },
        voiceLine: "The void consumes all...",
        unlocked: false // Locked character example
    }
];

const game = new Phaser.Game(config);

function preload() {
    // Remove loading indicator
    document.querySelector('.loading').style.display = 'none';
    
    // Load actual assets (replace with your file paths)
    loadCharacterAssets.call(this);
    loadAudioAssets.call(this);
    loadUIAssets.call(this);
    
    // Create placeholder assets if real ones aren't available
    createPlaceholderAssets.call(this);
}

function loadCharacterAssets() {
    characterData.forEach(char => {
        // Load static images 
        this.load.image(char.staticImage, `assets/characters/${char.staticImage}.png`);
        
        // For GIF support, you might need to:
        // 1. Convert GIFs to spritesheets and load as animations
        // 2. Use a GIF loader plugin
        // 3. Load as video files (.webm/.mp4) for better performance
        
        // Example: Loading as spritesheet (if you convert GIF to spritesheet)
        this.load.spritesheet(char.animatedGif, `assets/characters/${char.animatedGif}.png`, {
            frameWidth: 150,
            frameHeight: 200
        });
        
        // Example: Loading as video (converted from GIF for better performance)
        // this.load.video(char.animatedGif, `assets/characters/${char.animatedGif}.mp4`);
    });
}

function loadAudioAssets() {
    this.load.audio('hover_sound', 'assets/audio/hover.mp3');
    this.load.audio('select_sound', 'assets/audio/select.mp3');
    this.load.audio('ambient_music', 'assets/audio/ambient.mp3');
    this.load.audio('unlock_sound', 'assets/audio/unlock.mp3');
}

function loadUIAssets() {
    // You can add custom UI graphics here
    this.load.image('ui_frame', 'assets/ui/character_frame.png');
    this.load.image('ui_lock', 'assets/ui/lock_icon.png');
}

function createPlaceholderAssets() {
    // Create placeholder assets for demo (remove when using real assets)
    characterData.forEach((char, index) => {
        // Enhanced placeholder graphics
        createPlaceholderCharacter.call(this, char, index);
    });
}

function createPlaceholderCharacter(char, index) {
    // Static version
    const staticGraphics = this.add.graphics();
    staticGraphics.fillStyle(char.color, 0.7);
    staticGraphics.fillRoundedRect(0, 0, 150, 200, 15);
    
    // Add character silhouette
    staticGraphics.fillStyle(0x000000, 0.6);
    staticGraphics.fillEllipse(75, 50, 40, 50); // Head
    staticGraphics.fillRect(55, 75, 40, 80); // Body
    staticGraphics.fillRect(45, 155, 20, 45); // Left leg
    staticGraphics.fillRect(85, 155, 20, 45); // Right leg
    staticGraphics.fillRect(30, 85, 20, 40); // Left arm
    staticGraphics.fillRect(100, 85, 20, 40); // Right arm
    
    staticGraphics.generateTexture(char.staticImage, 150, 200);
    staticGraphics.destroy();
    
    // Animated version
    const animGraphics = this.add.graphics();
    animGraphics.fillStyle(char.color, 1.0);
    animGraphics.fillRoundedRect(0, 0, 150, 200, 15);
    
    // Glowing border
    animGraphics.lineStyle(4, char.accentColor, 1);
    animGraphics.strokeRoundedRect(0, 0, 150, 200, 15);
    
    // Enhanced character details
    animGraphics.fillStyle(char.accentColor, 0.8);
    animGraphics.fillEllipse(75, 50, 45, 55); // Glowing head
    animGraphics.fillRect(50, 75, 50, 85); // Enhanced body
    
    // Add energy effects
    for (let i = 0; i < 5; i++) {
        const x = 20 + (i * 25);
        const y = 30 + Math.sin(i) * 10;
        animGraphics.fillStyle(char.accentColor, 0.6);
        animGraphics.fillCircle(x, y, 3);
    }
    
    animGraphics.generateTexture(char.animatedGif, 150, 200);
    animGraphics.destroy();
}

function create() {
    // Multi-layer background setup
    createBackgroundLayers.call(this);
    
    // Main UI
    createUI.call(this);
    
    // Calculate positions for characters
    setupCharacterPositions.call(this);
    
    // Create all characters
    createAllCharacters.call(this);
    
    // Setup audio
    setupAudio.call(this);
    
    // Add atmospheric effects
    createAtmosphericEffects.call(this);
}

function createBackgroundLayers() {
    // Deep background
    backgroundLayer = this.add.graphics();
    backgroundLayer.fillGradientStyle(0x000011, 0x000033, 0x001122, 0x000055, 1, 1, 1, 1);
    backgroundLayer.fillRect(0, 0, 1400, 900);
    
    // Overlay for dimming
    const overlay = this.add.rectangle(700, 450, 1400, 900, 0x000000, 0.7);
    
    // Spotlight graphics layer
    spotlightGraphics = this.add.graphics();
    spotlightGraphics.setDepth(5);
    
    // Foreground effects layer
    foregroundEffects = this.add.container();
    foregroundEffects.setDepth(100);
}

function createUI() {
    // Enhanced title with glow effect
    titleText = this.add.text(700, 80, 'CHARACTER SELECTION', {
        fontSize: '52px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#0099ff',
        strokeThickness: 6
    }).setOrigin(0.5);
    
    // Add title glow
    titleText.setBlendMode(Phaser.BlendModes.ADD);
    
    // Character info panel background
    const infoBg = this.add.rectangle(700, 750, 800, 200, 0x000000, 0.8);
    infoBg.setStrokeStyle(3, 0x333333);
    
    // Character name
    characterNameText = this.add.text(700, 680, '', {
        fontSize: '36px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Character description
    characterDescText = this.add.text(700, 720, '', {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#cccccc',
        wordWrap: { width: 600 },
        align: 'center'
    }).setOrigin(0.5);
    
    // Stats display
    characterStatsUI = this.add.container(700, 780);
    characterStatsUI.setAlpha(0);
}

function setupCharacterPositions() {
    const totalChars = characterData.length;
    const screenWidth = 1400;
    const charWidth = 180;
    const totalWidth = totalChars * charWidth;
    const startX = (screenWidth - totalWidth) / 2 + charWidth / 2;
    
    characterPositions = [];
    for (let i = 0; i < totalChars; i++) {
        characterPositions.push({
            x: startX + (i * charWidth),
            y: 400
        });
    }
}

function createAllCharacters() {
    characterData.forEach((charData, index) => {
        const character = createCharacter.call(this, charData, index);
        characters.push(character);
    });
}

function createCharacter(charData, index) {
    const pos = characterPositions[index];
    
    // Main character container
    const container = this.add.container(pos.x, pos.y);
    
    // Platform/base
    const platform = this.add.ellipse(0, 90, 140, 30, 0x333333, 0.8);
    
    // Character frame
    const frame = this.add.rectangle(0, 0, 160, 220, 0x222222, 0.3);
    frame.setStrokeStyle(2, charData.unlocked ? charData.color : 0x666666);
    
    // Static character image
    const staticChar = this.add.image(0, -10, charData.staticImage);
    staticChar.setScale(0.9);
    staticChar.setAlpha(charData.unlocked ? 0.6 : 0.3);
    
    // Animated character (initially hidden)
    let animatedChar;
    if (this.textures.exists(charData.animatedGif)) {
        animatedChar = this.add.sprite(0, -10, charData.animatedGif);
        
        // Create animation if it's a spritesheet
        if (this.textures.get(charData.animatedGif).frameTotal > 1) {
            this.anims.create({
                key: `${charData.animatedGif}_anim`,
                frames: this.anims.generateFrameNumbers(charData.animatedGif),
                frameRate: 8,
                repeat: -1
            });
        }
    } else {
        animatedChar = this.add.image(0, -10, charData.animatedGif);
    }
    
    animatedChar.setScale(0.9);
    animatedChar.setAlpha(0);
    
    // Character nameplate
    const nameplateBg = this.add.rectangle(0, 85, 150, 25, 0x000000, 0.8);
    nameplateBg.setStrokeStyle(2, charData.color);
    
    const nameText = this.add.text(0, 85, charData.name, {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: charData.unlocked ? '#ffffff' : '#666666',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Lock icon for locked characters
    let lockIcon = null;
    if (!charData.unlocked) {
        lockIcon = this.add.text(0, -10, '🔒', {
            fontSize: '48px'
        }).setOrigin(0.5);
    }
    
    // Interactive area
    const interactiveArea = this.add.rectangle(0, 0, 160, 220, 0xffffff, 0);
    interactiveArea.setInteractive({ useHandCursor: charData.unlocked });
    
    // Add all elements to container
    container.add([platform, frame, staticChar, animatedChar, nameplateBg, nameText, interactiveArea]);
    if (lockIcon) container.add(lockIcon);
    
    // Character object
    const character = {
        container,
        staticImage: staticChar,
        animatedImage: animatedChar,
        nameplate: nameplateBg,
        nameText,
        lockIcon,
        interactiveArea,
        data: charData,
        index,
        isHovered: false,
        isSelected: false
    };
    
    // Setup events only for unlocked characters
    if (charData.unlocked) {
        setupCharacterInteractions.call(this, character);
    }
    
    return character;
}

function setupCharacterInteractions(character) {
    const area = character.interactiveArea;
    
    area.on('pointerover', () => onCharacterHover.call(this, character));
    area.on('pointerout', () => onCharacterUnhover.call(this, character));
    area.on('pointerdown', () => onCharacterSelect.call(this, character));
}

function onCharacterHover(character) {
    if (hoveredCharacter === character) return;
    
    // Clear previous hover
    if (hoveredCharacter) {
        onCharacterUnhover.call(this, hoveredCharacter);
    }
    
    hoveredCharacter = character;
    character.isHovered = true;
    
    // Play hover sound
    if (this.sound.get('hover_sound')) {
        this.sound.play('hover_sound', { volume: 0.3 });
    }
    
    // Create dramatic spotlight
    createDramaticSpotlight.call(this, character);
    
    // Animate character activation
    animateCharacterActivation.call(this, character);
    
    // Update UI
    updateCharacterInfo.call(this, character);
    
    // Dim other characters
    dimOtherCharacters.call(this, character);
}

function onCharacterUnhover(character) {
    if (!character.isHovered) return;
    
    character.isHovered = false;
    hoveredCharacter = null;
    
    // Remove spotlight
    spotlightGraphics.clear();
    
    // Deactivate character
    deactivateCharacter.call(this, character);
    
    // Restore other characters
    restoreOtherCharacters.call(this);
    
    // Clear UI if not selected
    if (selectedCharacter !== character) {
        clearCharacterInfo.call(this);
    }
}

function onCharacterSelect(character) {
    // Deselect previous
    if (selectedCharacter) {
        selectedCharacter.isSelected = false;
        updateCharacterSelection.call(this, selectedCharacter, false);
    }
    
    selectedCharacter = character;
    character.isSelected = true;
    
    // Play select sound
    if (this.sound.get('select_sound')) {
        this.sound.play('select_sound', { volume: 0.5 });
    }
    
    // Selection effects
    updateCharacterSelection.call(this, character, true);
    createSelectionEffect.call(this, character);
}

function createDramaticSpotlight(character) {
    spotlightGraphics.clear();
    
    const x = character.container.x;
    const y = character.container.y;
    
    // Main spotlight beam
    spotlightGraphics.fillGradientStyle(
        character.data.accentColor, character.data.accentColor,
        character.data.color, character.data.color,
        0.3, 0.3, 0.1, 0.1
    );
    spotlightGraphics.fillTriangle(x - 30, 0, x + 30, 0, x, y - 100);
    
    // Spotlight circle
    spotlightGraphics.fillGradientStyle(
        0xffffff, 0xffffff,
        character.data.accentColor, character.data.accentColor,
        0.4, 0.4, 0.0, 0.0
    );
    spotlightGraphics.fillCircle(x, y, 120);
    
    // Animate spotlight intensity
    this.tweens.add({
        targets: spotlightGraphics,
        alpha: 0.8,
        duration: 800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
    });
}

function animateCharacterActivation(character) {
    // Fade out static, fade in animated
    this.tweens.add({
        targets: character.staticImage,
        alpha: 0,
        duration: 400,
        ease: 'Power2'
    });
    
    this.tweens.add({
        targets: character.animatedImage,
        alpha: 1,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
            // Start animation if it's a sprite
            if (character.animatedImage.anims) {
                character.animatedImage.play(`${character.data.animatedGif}_anim`);
            }
        }
    });
    
    // Floating effect
    this.tweens.add({
        targets: character.container,
        y: character.container.y - 15,
        duration: 1500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
    });
    
    // Nameplate glow
    this.tweens.add({
        targets: character.nameplate,
        alpha: 1,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 300
    });
}

function updateCharacterInfo(character) {
    const data = character.data;
    
    // Update name with color
    characterNameText.setText(data.name);
    characterNameText.setColor(`#${data.accentColor.toString(16).padStart(6, '0')}`);
    
    // Update description
    characterDescText.setText(data.description);
    
    // Create stats display
    characterStatsUI.removeAll(true);
    
    const statsTitle = this.add.text(0, -20, 'STATS', {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const statNames = ['ATK', 'DEF', 'MAG', 'SPD'];
    const statValues = [data.stats.attack, data.stats.defense, data.stats.magic, data.stats.speed];
    
    statNames.forEach((name, i) => {
        const x = -150 + (i * 100);
        
        // Stat name
        const statText = this.add.text(x, 0, name, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#cccccc'
        }).setOrigin(0.5);
        
        // Stat value
        const valueText = this.add.text(x, 15, statValues[i], {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: `#${data.accentColor.toString(16).padStart(6, '0')}`,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        characterStatsUI.add([statText, valueText]);
    });
    
    characterStatsUI.add(statsTitle);
    
    // Animate stats in
    this.tweens.add({
        targets: characterStatsUI,
        alpha: 1,
        y: characterStatsUI.y - 10,
        duration: 300,
        ease: 'Power2'
    });
}

function setupAudio() {
    if (this.sound.get('ambient_music')) {
        ambientMusic = this.sound.add('ambient_music', { 
            volume: 0.2, 
            loop: true 
        });
        ambientMusic.play();
    }
}

function createAtmosphericEffects() {
    // Floating particles
    for (let i = 0; i < 30; i++) {
        createFloatingParticle.call(this);
    }
    
    // Subtle screen effects
    const vignette = this.add.graphics();
    vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0.3, 0.3, 0);
    vignette.fillRect(0, 0, 1400, 900);
    vignette.setDepth(50);
}

function createFloatingParticle() {
    const particle = this.add.graphics();
    const x = Phaser.Math.Between(0, 1400);
    const y = Phaser.Math.Between(900, 1000);
    const size = Phaser.Math.FloatBetween(1, 4);
    const color = Phaser.Math.RND.pick([0x00aaff, 0x0066cc, 0x004499]);
    
    particle.fillStyle(color, 0.6);
    particle.fillCircle(0, 0, size);
    particle.x = x;
    particle.y = y;
    particle.setDepth(1);
    
    this.tweens.add({
        targets: particle,
        y: -50,
        x: x + Phaser.Math.Between(-100, 100),
        alpha: 0,
        duration: Phaser.Math.Between(8000, 15000),
        ease: 'Power1',
        onComplete: () => {
            particle.destroy();
            createFloatingParticle.call(this);
        }
    });
}

// Helper functions for character management
function deactivateCharacter(character) {
    this.tweens.killTweensOf(character.container);
    this.tweens.killTweensOf(character.animatedImage);
    
    character.container.y = characterPositions[character.index].y;
    
    this.tweens.add({
        targets: character.staticImage,
        alpha: 0.6,
        duration: 300
    });
    
    this.tweens.add({
        targets: character.animatedImage,
        alpha: 0,
        duration: 300
    });
    
    this.tweens.add({
        targets: character.nameplate,
        alpha: 0.8,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 200
    });
}

function dimOtherCharacters(activeCharacter) {
    characters.forEach(char => {
        if (char !== activeCharacter && !char.isSelected) {
            this.tweens.add({
                targets: char.container,
                alpha: 0.3,
                duration: 400
            });
        }
    });
}

function restoreOtherCharacters() {
    characters.forEach(char => {
        if (!char.isSelected) {
            this.tweens.add({
                targets: char.container,
                alpha: 1.0,
                duration: 400
            });
        }
    });
}

function clearCharacterInfo() {
    characterNameText.setText('');
    characterDescText.setText('');
    
    this.tweens.add({
        targets: characterStatsUI,
        alpha: 0,
        duration: 200
    });
}

function updateCharacterSelection(character, isSelected) {
    // Add selection indicators, persistent effects, etc.
    if (isSelected) {
        character.nameplate.setStrokeStyle(3, 0xffd700);
    } else {
        character.nameplate.setStrokeStyle(2, character.data.color);
    }
}

function createSelectionEffect(character) {
    // Create selection confirmation effect
    const effect = this.add.graphics();
    effect.lineStyle(6, 0xffd700, 1);
    effect.strokeCircle(character.container.x, character.container.y, 100);
    effect.setAlpha(0);
    
    this.tweens.add({
        targets: effect,
        alpha: 1,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 600,
        ease: 'Power2',
        onComplete: () => effect.destroy()
    });
}

function update() {
    // Update title color cycling
    if (titleText) {
        const hue = (this.time.now / 50) % 360;
        titleText.setTint(Phaser.Display.Color.HSVToRGB(hue / 360, 0.8, 1).color);
    }
    
    // Update background animation
    if (backgroundLayer) {
        backgroundLayer.alpha = 0.9 + Math.sin(this.time.now / 3000) * 0.1;
    }
}