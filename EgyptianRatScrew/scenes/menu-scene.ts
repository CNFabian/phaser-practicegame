import * as Phaser from 'phaser';
import { SCENE_KEYS, COLORS } from '../common';

export class MenuScene extends Phaser.Scene {
  private startButton!: Phaser.GameObjects.Container;
  private instructionsVisible = false;
  private instructionsContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SCENE_KEYS.MENU });
  }

  public create(): void {
    this.createBackground();
    this.createTitle();
    this.createMainMenu();
    this.createInstructions();
    this.setupInput();
  }

  private createBackground(): void {
    // Create felt-like background
    this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x0a5f38
    );

    // Add some texture with subtle patterns
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x1a8e5a, 0.3);
    
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * this.cameras.main.width;
      const y = Math.random() * this.cameras.main.height;
      graphics.strokeCircle(x, y, Math.random() * 50 + 10);
    }
  }

  private createTitle(): void {
    const centerX = this.cameras.main.centerX;
    
    // Main title
    const title = this.add.text(centerX, 120, 'EGYPTIAN', {
      fontSize: '64px',
      color: COLORS.GOLD,
      fontStyle: 'bold',
      stroke: COLORS.BLACK,
      strokeThickness: 3
    }).setOrigin(0.5);

    const subtitle = this.add.text(centerX, 190, 'RATSCREW', {
      fontSize: '64px',
      color: COLORS.GOLD,
      fontStyle: 'bold',
      stroke: COLORS.BLACK,
      strokeThickness: 3
    }).setOrigin(0.5);

    // Add glow effect
    title.setPostPipeline('Glow');
    subtitle.setPostPipeline('Glow');

    // Subtitle
    this.add.text(centerX, 240, 'The Fast-Paced Card Slapping Game', {
      fontSize: '24px',
      color: COLORS.WHITE,
      fontStyle: 'italic'
    }).setOrigin(0.5);
  }

  private createMainMenu(): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Start Game Button
    this.startButton = this.createButton(centerX, centerY + 50, 'START GAME', () => {
      this.startGame();
    });

    // Instructions Button
    const instructionsButton = this.createButton(centerX, centerY + 120, 'HOW TO PLAY', () => {
      this.toggleInstructions();
    });

    // Controls hint
    this.add.text(centerX, this.cameras.main.height - 50, 'Press SPACE to start or ESC for instructions', {
      fontSize: '18px',
      color: COLORS.WHITE,
      alpha: 0.8
    }).setOrigin(0.5);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);

    // Button background
    const bg = this.add.rectangle(0, 0, 300, 60, 0x8B4513);
    bg.setStrokeStyle(3, 0xffd700);
    
    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '24px',
      color: COLORS.GOLD,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    button.add([bg, buttonText]);
    button.setSize(300, 60);
    button.setInteractive();

    // Hover effects
    button.on('pointerover', () => {
      bg.setFillStyle(0xa0522d);
      button.setScale(1.05);
    });

    button.on('pointerout', () => {
      bg.setFillStyle(0x8B4513);
      button.setScale(1);
    });

    button.on('pointerdown', () => {
      button.setScale(0.95);
    });

    button.on('pointerup', () => {
      button.setScale(1.05);
      callback();
    });

    return button;
  }

  private createInstructions(): void {
    this.instructionsContainer = this.add.container(0, 0);
    
    // Semi-transparent background
    const overlay = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.8
    );

    // Instructions panel
    const panel = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      700,
      600,
      0x1a1a1a
    );
    panel.setStrokeStyle(3, 0xffd700);

    // Instructions title
    const title = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 270,
      'HOW TO PLAY EGYPTIAN RATSCREW',
      {
        fontSize: '28px',
        color: COLORS.GOLD,
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Instructions text
    const instructions = [
      'OBJECTIVE:',
      'Be the first player to collect all 52 cards!',
      '',
      'BASIC GAMEPLAY:',
      '• Players take turns playing cards from their deck',
      '• Cards are played face-up to a center pile',
      '• Player 1 uses Q to play, A to slap',
      '• Player 2 uses P to play, L to slap',
      '',
      'FACE CARD CHALLENGES:',
      '• When a face card is played, the opponent must respond',
      '• Jack = 1 chance, Queen = 2, King = 3, Ace = 4',
      '• Play another face card to continue, or lose the pile',
      '',
      'SLAPPING:',
      '• DOUBLES: Two consecutive cards of same rank (5-5)',
      '• SANDWICH: Same rank with one card between (5-7-5)',
      '• First to slap correctly wins the entire pile',
      '• Wrong slap = lose one card to the center',
      '',
      'Press ESC to close this menu'
    ];

    let yOffset = -200;
    instructions.forEach(line => {
      const color = line.endsWith(':') ? COLORS.GOLD : COLORS.WHITE;
      const fontSize = line.endsWith(':') ? '20px' : '16px';
      const fontStyle = line.endsWith(':') ? 'bold' : 'normal';
      
      this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + yOffset,
        line,
        {
          fontSize,
          color,
          fontStyle
        }
      ).setOrigin(0.5).setParent(this.instructionsContainer);
      
      yOffset += line === '' ? 10 : 25;
    });

    this.instructionsContainer.add([overlay, panel, title]);
    this.instructionsContainer.setVisible(false);
  }

  private setupInput(): void {
    // Keyboard controls
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (!this.instructionsVisible) {
        this.startGame();
      }
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.toggleInstructions();
    });

    // Click outside instructions to close
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.instructionsVisible) {
        // Check if click is outside the instructions panel
        const panelBounds = new Phaser.Geom.Rectangle(
          this.cameras.main.centerX - 350,
          this.cameras.main.centerY - 300,
          700,
          600
        );
        
        if (!Phaser.Geom.Rectangle.Contains(panelBounds, pointer.x, pointer.y)) {
          this.toggleInstructions();
        }
      }
    });
  }

  private toggleInstructions(): void {
    this.instructionsVisible = !this.instructionsVisible;
    this.instructionsContainer.setVisible(this.instructionsVisible);
  }

  private startGame(): void {
    // Fade out effect
    this.cameras.main.fadeOut(500, 0, 0, 0);
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENE_KEYS.GAME);
    });
  }
}