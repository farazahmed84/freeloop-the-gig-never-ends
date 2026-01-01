import { allJobs } from './JobData.js';

export default class JobScene extends Phaser.Scene {
  constructor() {
    super('JobScene');
  }

  create() {
    this.uiElements = []; // Track UI elements for cleanup

    this.playerData = JSON.parse(localStorage.getItem('freeloopSave'));
    const playerData = this.playerData;
    const statsText = `
📅 Day: ${playerData.day}
🎨 Design: ${playerData.designSkill.toFixed(1)}
💻 Dev: ${playerData.devSkill.toFixed(1)}
🧪 QA: ${playerData.qaSkill.toFixed(1)}
🧠 PC Level: ${playerData.pcLevel}
😫 Stress: ${playerData.stress}/10
💵 Money: $${playerData.money.toFixed(2)}
    `;

    this.statsDisplay = this.add.text(20, 20, statsText, {
      fontSize: '16px',
      fill: '#ffffff',
      align: 'left'
    }).setOrigin(0, 0);
    this.uiElements.push(this.statsDisplay);

    const shuffledJobs = Phaser.Utils.Array.Shuffle(allJobs);
    const firstJobBase = shuffledJobs[0];
    const secondJobBase = shuffledJobs[1];
    const thirdJobBase = shuffledJobs[2];

    const skillKey = `${firstJobBase.skill}Skill`;
    const playerSkillValue = playerData[skillKey] || 0.1;

    const selectedJobs = [
      this.generateJob(firstJobBase, playerSkillValue), // ensure doable
      this.generateJob(secondJobBase),                  // random
      this.generateJob(thirdJobBase)                    // random
    ];

    this.jobCards = selectedJobs;

    this.renderJobCards(selectedJobs);

    this.backBtn = this.add
      .text(this.scale.width - 20, 20, '⏪ Back', {
        fontSize: '16px',
        fill: '#ffcc00',
        backgroundColor: '#333',
        padding: { x: 12, y: 8 }
      })
      .setOrigin(1, 0)
      .setInteractive();
    this.uiElements.push(this.backBtn);

    this.backBtn.on('pointerup', () => {
      this.scene.start('GameScene');
    });
  }

  renderJobCards(selectedJobs) {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const cardWidth = 250;
    const cardHeight = 200;
    const cardSpacing = 30;

    // Create card container background with margins
    const containerWidth = cardWidth * 3 + cardSpacing * 2 + 40; // Add 40px total margin
    const containerBg = this.add.rectangle(centerX, centerY, containerWidth, cardHeight + cardSpacing + 20, 0x333333, 0.8);
    this.uiElements.push(containerBg);

    selectedJobs.forEach((job, i) => {
      const cardX = centerX - cardWidth - cardSpacing + (cardWidth + cardSpacing) * i;
      const cardY = centerY;

      // Card background
      const cardBg = this.add.rectangle(cardX, cardY, cardWidth, cardHeight, 0x444444);
      cardBg.setStrokeStyle(2, 0x666666);
      this.uiElements.push(cardBg);

      // Job icon
      const icon = job.skill === 'design' ? '🎨' : job.skill === 'dev' ? '💻' : '🧪';
      const iconText = this.add.text(cardX, cardY - 70, icon, {
        fontSize: '32px',
        fill: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
      this.uiElements.push(iconText);

      // Job title
      const titleText = this.add.text(cardX, cardY - 40, job.title, {
        fontSize: '16px',
        fill: '#ffffff',
        align: 'center',
        fontStyle: 'bold',
        wordWrap: { width: cardWidth - 20 }
      }).setOrigin(0.5);
      this.uiElements.push(titleText);

      // Job description
      const descText = this.add.text(cardX, cardY - 10, job.description, {
        fontSize: '12px',
        fill: '#cccccc',
        align: 'center',
        wordWrap: { width: cardWidth - 20 }
      }).setOrigin(0.5);
      this.uiElements.push(descText);

      // Skill info
      const skillText = this.add.text(cardX, cardY + 20, `Skill: ${job.skill.toUpperCase()}`, {
        fontSize: '12px',
        fill: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
      this.uiElements.push(skillText);

      // Required level
      const requiredText = this.add.text(cardX, cardY + 40, `Required: ${job.required.toFixed(1)}`, {
        fontSize: '12px',
        fill: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
      this.uiElements.push(requiredText);

      // Max pay
      const payText = this.add.text(cardX, cardY + 60, `Max Pay: $${job.maxPay}`, {
        fontSize: '12px',
        fill: '#ffcc00',
        align: 'center'
      }).setOrigin(0.5);
      this.uiElements.push(payText);

      // Make card interactive
      cardBg.setInteractive();
      cardBg.on('pointerup', () => this.handleJobSelection(job));
      
      // Make all text elements interactive too
      [iconText, titleText, descText, skillText, requiredText, payText].forEach(text => {
        text.setInteractive();
        text.on('pointerup', () => this.handleJobSelection(job));
      });
    });
  }

  generateJob(baseJob, maxRequired = null) {
    let required;
    if (maxRequired !== null) {
      // First job: matches player skill (1.0 to player's skill)
      required = +(Phaser.Math.FloatBetween(1, Math.max(1, maxRequired))).toFixed(1);
    } else {
      // Other jobs: dynamic range based on player skill
      const skillKey = `${baseJob.skill}Skill`;
      const playerSkill = this.playerData[skillKey] || 1.0;
      const minRequired = Math.max(1, playerSkill * 0.8);  // 80% of player skill
      const maxRequired = Math.min(100, playerSkill * 1.5); // 150% of player skill, capped at 100
      required = +(Phaser.Math.FloatBetween(minRequired, maxRequired)).toFixed(1);
    }

    const maxPay = Math.round(required * 80 + Phaser.Math.Between(0, 50));
    const description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

    return {
      title: baseJob.title,
      skill: baseJob.skill,
      description,
      required,
      maxPay
    };
  }

  handleJobSelection(job) {
    this.clearUI();

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const cardWidth = 400;
    const cardHeight = 200;

    // Selection card background
    const selectionBg = this.add.rectangle(centerX, centerY, cardWidth, cardHeight, 0x444444);
    selectionBg.setStrokeStyle(2, 0x666666);
    this.uiElements.push(selectionBg);

    // Selection text
    const selectionText = this.add.text(centerX, centerY - 40, `You selected:\n\n${job.title}\nSkill: ${job.skill.toUpperCase()}\nRequired Level: ${job.required.toFixed(1)}\nMax Pay: $${job.maxPay}`, {
      fontSize: '16px',
      fill: '#ffffff',
      align: 'center',
      wordWrap: { width: cardWidth - 20 }
    }).setOrigin(0.5);
    this.uiElements.push(selectionText);

    // Apply button
    const applyBtn = this.add.text(centerX - 80, centerY + 40, 'Apply Now', {
      fontSize: '18px',
      fill: '#ffcc00',
      backgroundColor: '#333',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();
    this.uiElements.push(applyBtn);

    applyBtn.on('pointerup', () => {
      this.scene.start('MiniGame', { selectedJob: job });
    });

    // Back button
    const backBtn = this.add.text(centerX + 80, centerY + 40, 'Back', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#666',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();
    this.uiElements.push(backBtn);

    backBtn.on('pointerup', () => {
      this.renderJobCards(this.jobCards);
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

  shutdown() {
    this.clearUI();
  }

  destroy() {
    this.clearUI();
  }
}
