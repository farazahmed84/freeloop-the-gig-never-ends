import BootScene from './scenes/BootScene.js';
import MainMenu from './scenes/MainMenu.js';
import GameScene from './scenes/GameScene.js';
import JobScene from './scenes/JobScene.js';
import MiniGame from './scenes/MiniGame.js';
import JobResult from './scenes/JobResult.js';
import SkillChallenge from './scenes/SkillChallenge.js';

const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 640,
  backgroundColor: '#222',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, MainMenu, GameScene, JobScene, MiniGame, JobResult, SkillChallenge],
  parent: 'game-container'
};

const game = new Phaser.Game(config);
