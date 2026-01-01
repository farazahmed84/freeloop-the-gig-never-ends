export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Load fonts or icons if needed
  }

  create() {
    this.scene.start('MainMenu');
  }
}
