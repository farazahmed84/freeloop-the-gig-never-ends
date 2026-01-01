export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.actionTaken = false;
    this.uiElements = []; // Track UI elements for cleanup

    const savedData = JSON.parse(localStorage.getItem('freeloopSave'));
    this.playerData = savedData || {
      designSkill: 1.0,
      devSkill: 1.0,
      qaSkill: 1.0,
      stress: 0,
      money: 100,
      pcLevel: 1,
      day: 1,
      skippedJobDays: 0
    };

    if (this.playerData.skippedJobDays === undefined) {
      this.playerData.skippedJobDays = 0;
    }

    if (this.playerData.day > 1) {
      this.playerData.money -= 10;
      if (this.playerData.money < 0) {
        this.gameOver("You ran out of money and couldn't find any work. The freelancing journey ends here.");
        return;
      }
    }

    if (this.playerData.stress >= 10) {
      this.gameOver('You burned out from stress. The gig is over.');
      return;
    }

    const statsText = `
📅 Day: ${this.playerData.day}
🎨 Design: ${this.playerData.designSkill.toFixed(1)}
💻 Dev: ${this.playerData.devSkill.toFixed(1)}
🧪 QA: ${this.playerData.qaSkill.toFixed(1)}
🧠 PC Level: ${this.playerData.pcLevel}
😫 Stress: ${this.playerData.stress}/10
💵 Money: $${this.playerData.money.toFixed(2)}
    `;

    this.statsDisplay = this.add.text(20, 20, statsText, {
      fontSize: '16px',
      fill: '#ffffff',
      align: 'left'
    }).setOrigin(0, 0);
    this.uiElements.push(this.statsDisplay);

    this.backBtn = this.add.text(this.scale.width - 20, 20, '⏪ Back', {
      fontSize: '16px',
      fill: '#ffcc00',
      backgroundColor: '#333',
      padding: { x: 12, y: 8 }
    }).setOrigin(1, 0).setInteractive();
    this.uiElements.push(this.backBtn);

    this.backBtn.on('pointerup', () => {
      localStorage.setItem('freeloopSave', JSON.stringify(this.playerData));
      this.scene.start('MainMenu');
    });

    this.renderCards();
    localStorage.setItem('freeloopSave', JSON.stringify(this.playerData));
  }

  renderCards() {
    // Clear existing UI elements
    this.clearUI();

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const cardWidth = 180;
    const cardHeight = 80;
    const cardSpacing = 20;

    // Create card container background for 4 cards in one line
    const containerWidth = cardWidth * 4 + cardSpacing * 3 + 40; // Add 40px total margin
    const containerBg = this.add.rectangle(centerX, centerY, containerWidth, cardHeight + cardSpacing + 20, 0x333333, 0.8);
    this.uiElements.push(containerBg);

    const cards = [
      { id: 'findJob', text: '🧾 Find a Job', x: centerX - (cardWidth * 1.5 + cardSpacing * 1.5), y: centerY },
      { id: 'relax', text: '🛀 Relax', x: centerX - (cardWidth * 0.5 + cardSpacing * 0.5), y: centerY },
      { id: 'upgrade', text: '🖥️ Upgrade PC', x: centerX + (cardWidth * 0.5 + cardSpacing * 0.5), y: centerY },
      { id: 'learn', text: '📚 Learn', x: centerX + (cardWidth * 1.5 + cardSpacing * 1.5), y: centerY }
    ];

    cards.forEach(card => {
      // Card background
      const cardBg = this.add.rectangle(card.x, card.y, cardWidth, cardHeight, 0x444444);
      cardBg.setStrokeStyle(2, 0x666666);
      this.uiElements.push(cardBg);

      // Card text
      const cardText = this.add.text(card.x, card.y, card.text, {
        fontSize: '18px',
        fill: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
      this.uiElements.push(cardText);

      // Make card interactive
      cardBg.setInteractive();
      cardBg.on('pointerup', () => this.handleCardClick(card.id));
      cardText.setInteractive();
      cardText.on('pointerup', () => this.handleCardClick(card.id));
    });

    // Add helpful instructions beneath the cards
    const instructionsY = centerY + cardHeight + cardSpacing + 60;
    const instructionsText = `
💡 Helpful Tips:
• 🧾 Find a Job: Look for freelance work (no cost)
• 🛀 Relax: Reduces stress by 1 (-$30)
• 🖥️ Upgrade PC: Increases work efficiency (cost varies by level)
• 📚 Learn: Randomly improves a skill (-$100)
• 💰 Daily expenses: -$10 deducted each day
• ⚠️ Skipping jobs for 3+ days reduces skills
    `;

    const instructions = this.add.text(centerX, instructionsY, instructionsText, {
      fontSize: '14px',
      fill: '#cccccc',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);
    this.uiElements.push(instructions);
  }

  handleCardClick(cardId) {
    if (this.actionTaken) return;

    switch (cardId) {
      case 'findJob':
        this.playerData.skippedJobDays = 0;
        localStorage.setItem('freeloopSave', JSON.stringify(this.playerData));
        this.scene.start('JobScene', { returningFromGameScene: true });
        break;

      case 'relax':
        if (this.playerData.money < 30) {
          this.showMessage("You can't afford to relax today. Maybe tomorrow.", false);
          return;
        }
        this.playerData.money -= 30;
        this.playerData.stress = Math.max(0, this.playerData.stress - 1);
        this.playerData.day += 1;
        this.playerData.skippedJobDays += 1;
        this.finalizeAction("You decided to take the day off and unwind. Stress decreased by 1.");
        this.actionTaken = true;
        break;

      case 'upgrade':
        if (this.playerData.pcLevel >= 100) {
          this.showMessage("Your PC is already at the highest level. Nothing more to upgrade.", false);
          return;
        }
        const cost = (this.playerData.pcLevel + 1) * 100;
        if (this.playerData.money < cost) {
          this.showMessage(`You need $${cost} to upgrade to level ${this.playerData.pcLevel + 1}. Try again later.`, false);
          return;
        }
        this.playerData.money -= cost;
        this.playerData.pcLevel += 1;
        this.playerData.day += 1;
        this.playerData.skippedJobDays += 1;
        this.finalizeAction(`Upgrade successful! Your PC is now level ${this.playerData.pcLevel}.`);
        this.actionTaken = true;
        break;

      case 'learn':
        if (this.playerData.money < 100) {
          this.showMessage("You don't have $100 to invest in learning today.", false);
          return;
        }
        const skills = ['designSkill', 'devSkill', 'qaSkill'];
        const chosen = Phaser.Math.RND.pick(skills);
        const gain = +(Phaser.Math.FloatBetween(0.5, 1.0)).toFixed(2);
        this.playerData[chosen] = +(this.playerData[chosen] + gain).toFixed(2);
        this.playerData.money -= 100;
        this.playerData.day += 1;
        this.playerData.skippedJobDays += 1;
        const skillName = chosen === 'designSkill' ? 'Design' :
                          chosen === 'devSkill' ? 'Development' : 'QA';
        this.finalizeAction(`You took a course in ${skillName}. Skill increased by +${gain}.`);
        this.actionTaken = true;
        break;
    }
  }

  checkSkillDecay() {
    if (this.playerData.skippedJobDays >= 3) {
      const skills = ['designSkill', 'devSkill', 'qaSkill'];
      const chosen = Phaser.Math.RND.pick(skills);
      this.playerData[chosen] = Math.max(0, +(this.playerData[chosen] - 0.1).toFixed(2));
      this.playerData.skippedJobDays = 0;
      this.showMessage(`You've been skipping jobs for days. Your ${chosen.replace('Skill', '')} skill decreased by 0.10.`);
      return true;
    }
    return false;
  }

  finalizeAction(message) {
    const penaltyShown = this.checkSkillDecay();
    localStorage.setItem('freeloopSave', JSON.stringify(this.playerData));
    if (this.playerData.money < 0) {
      this.gameOver("You ran out of money and couldn't find any work. The freelancing journey ends here.");
      return;
    }
    if (!penaltyShown) {
      this.showMessage(message);
    }
  }

  showMessage(msg, allowRestart = true) {
    this.clearUI();

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const cardWidth = 400;
    const cardHeight = 150;

    // Message card background
    const messageBg = this.add.rectangle(centerX, centerY, cardWidth, cardHeight, 0x444444);
    messageBg.setStrokeStyle(2, 0x666666);
    this.uiElements.push(messageBg);

    // Message text
    const messageText = this.add.text(centerX, centerY - 20, msg, {
      fontSize: '16px',
      fill: '#ffffff',
      align: 'center',
      wordWrap: { width: cardWidth - 20 }
    }).setOrigin(0.5);
    this.uiElements.push(messageText);

    // Continue button
    const continueBtn = this.add.text(centerX, centerY + 30, '➡️ Continue', {
      fontSize: '18px',
      fill: '#ffcc00',
      backgroundColor: '#333',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();
    this.uiElements.push(continueBtn);

    continueBtn.on('pointerup', () => {
      if (allowRestart) {
        this.scene.restart();
      } else {
        this.renderCards();
      }
    });
  }

  gameOver(reason) {
    this.clearUI();

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const cardWidth = 400;
    const cardHeight = 150;

    // Game over card background
    const gameOverBg = this.add.rectangle(centerX, centerY, cardWidth, cardHeight, 0x8B0000);
    gameOverBg.setStrokeStyle(2, 0x666666);
    this.uiElements.push(gameOverBg);

    // Game over text
    const gameOverText = this.add.text(centerX, centerY - 20, `💀 Game Over\n\n${reason}`, {
      fontSize: '16px',
      fill: '#ffffff',
      align: 'center',
      wordWrap: { width: cardWidth - 20 }
    }).setOrigin(0.5);
    this.uiElements.push(gameOverText);

    // Restart button
    const restartBtn = this.add.text(centerX, centerY + 50, '🔁 Restart', {
      fontSize: '18px',
      fill: '#ffcc00',
      backgroundColor: '#333',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();
    this.uiElements.push(restartBtn);

    restartBtn.on('pointerup', () => {
      localStorage.removeItem('freeloopSave');
      this.scene.start('MainMenu');
    });
  }

  clearUI() {
    // Remove all UI elements except stats display and back button
    this.uiElements.forEach(element => {
      if (element !== this.statsDisplay && element !== this.backBtn) {
        element.destroy();
      }
    });
    this.uiElements = this.uiElements.filter(element => 
      element === this.statsDisplay || element === this.backBtn
    );
  }

  update() {}

  shutdown() {
    this.clearUI();
  }

  destroy() {
    this.clearUI();
  }
}
