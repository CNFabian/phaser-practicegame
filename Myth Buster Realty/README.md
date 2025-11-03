# Phaser Game Setup

This is a basic Phaser 3 game template using CDN for easy setup.

## Project Structure
```
phaser-game/
├── index.html    # Main HTML file
├── game.js       # Game logic
└── README.md     # This file
```

## How to Run

### Option 1: Using VS Code Live Server (Recommended)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 2: Using Python
```bash
python -m http.server 8000
```
Then open: http://localhost:8000

### Option 3: Using Node.js http-server
```bash
npx http-server
```

## Getting Started

The game is set up with:
- **Phaser 3.80.1** loaded via CDN
- **Arcade Physics** enabled
- Basic scene structure (preload, create, update)
- 800x600 canvas size

## Next Steps

1. **Add sprites/images**: Create an `assets` folder and add images
2. **Load assets**: Use `this.load.image()` in the `preload()` function
3. **Create game objects**: Add sprites, text, etc. in the `create()` function
4. **Add game logic**: Write your game logic in the `update()` function
5. **Handle input**: Use `this.input` for keyboard/mouse controls

## Useful Resources

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Phaser Examples](https://phaser.io/examples)
- [Phaser Tutorials](https://phaser.io/tutorials)

## Common Game Elements

### Add a sprite:
```javascript
const player = this.physics.add.sprite(400, 300, 'player');
```

### Keyboard input:
```javascript
this.cursors = this.input.keyboard.createCursorKeys();
```

### Collision detection:
```javascript
this.physics.add.collider(player, platforms);
```

Happy game development! 🎮
