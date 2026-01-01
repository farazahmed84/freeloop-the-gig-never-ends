export default class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  preload() {
    this.load.image('gmtkLogo', 'assets/gmtk-game-jam-2025-logo-white.png');
  }

  create() {
    const centerX = this.scale.width / 2;

    // Title
    this.add.text(centerX, 80, 'FREEL🔁P', {
      fontSize: '48px',
      fill: '#0f0'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, 120, 'The Gig Never Ends', {
      fontSize: '24px',
      fill: '#ccc',
      padding: { bottom: 4 }
    }).setOrigin(0.5, 0.6);

    // Author credit
    this.add.text(centerX, 150, 'Developed by Faraz The Web Guy (www.farazthewebguy.com)', {
      fontSize: '14px',
      fill: '#888',
      align: 'center',
      padding: { bottom: 6 }
    }).setOrigin(0.5, 0.6);

    // Game buttons
    const newGameBtn = this.add.text(centerX, 210, '▶ Start New Game', {
      fontSize: '20px',
      fill: '#fff',
      backgroundColor: '#444',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setInteractive();
    newGameBtn.on('pointerup', () => {
      localStorage.removeItem('freeloopSave');
      this.scene.start('GameScene');
    });

    const savedData = localStorage.getItem('freeloopSave');
    if (savedData) {
      const resumeBtn = this.add.text(centerX, 260, '⏩ Resume Game', {
        fontSize: '20px',
        fill: '#fff',
        backgroundColor: '#555',
        padding: { x: 12, y: 8 }
      }).setOrigin(0.5).setInteractive();
      resumeBtn.on('pointerup', () => {
        this.scene.start('GameScene');
      });
    }

    // Description
    const desc =
      'You are a freelancer stuck in an endless work loop:\n' +
      'Find jobs → Compete → Work → Handle stress → Improve → Repeat\n' +
      'Every day is a decision: work, rest, or grow, but burnout is always near.';
    this.add.text(centerX, 370, desc, {
      fontSize: '16px',
      fill: '#bbbbbb',
      align: 'center',
      wordWrap: { width: 500 },
      lineSpacing: 6
    }).setOrigin(0.5);

    // Logo
    this.add.image(centerX, 520, 'gmtkLogo').setOrigin(0.5);
    // No scaling needed for pre-sized logo
  }
}
