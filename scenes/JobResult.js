export default class JobResult extends Phaser.Scene {
  constructor() {
    super('JobResult');
  }

  init(data) {
    this.selectedJob = data.selectedJob;
    this.success = data.success;
    this.fromSkillChallenge = data.fromSkillChallenge || false;
    this.playerData = JSON.parse(localStorage.getItem('freeloopSave'));
  }

  create() {
    const { skill, required, maxPay } = this.selectedJob;
    let message = '';
    let payout = 0;
    let bonus = 0;
    let quality = 0;
    let pcBonus = 1 + this.playerData.pcLevel * 0.05;
    let skillGain = 0;

    if (this.success) {
      const playerSkill = this.playerData[`${skill}Skill`];
      const qa = this.playerData.qaSkill;

      // Calculate quality based on skill vs requirement
      quality = Math.min(1.0, playerSkill / required);
      
      // Calculate payout based on quality
      payout = Math.round(quality * maxPay * pcBonus);
      
      // Bonuses for high quality work
      if (quality >= 0.9) {
        bonus += 25; // High quality bonus
        if (qa >= 80.0) bonus += 25; // QA bonus for good QA skill (80+)
      }

      // Dynamic skill gain based on job difficulty
      const skillOptions = [`${skill}Skill`, 'qaSkill'];
      const selectedSkill = Phaser.Math.RND.pick(skillOptions);
      const currentSkill = this.playerData[selectedSkill];
      const skillGap = Math.abs(required - currentSkill);
      
      if (this.fromSkillChallenge) {
        // Skill challenge gives higher base gains
        const baseGain = 0.3;
        const skillGainMultiplier = 1 + (skillGap / 50); // Up to 2x for very hard jobs
        skillGain = +(baseGain * skillGainMultiplier).toFixed(2);
      } else {
        // Normal jobs give lower base gains
        const baseGain = 0.1;
        const skillGainMultiplier = 1 + (skillGap / 50); // Up to 2x for very hard jobs
        skillGain = +(baseGain * skillGainMultiplier).toFixed(2);
      }
      
      // Cap skill at 100
      this.playerData[selectedSkill] = Math.min(100, +(this.playerData[selectedSkill] + skillGain).toFixed(2));

      message = `✅ You won and completed the job\nSkill: ${skill.toUpperCase()}\nWork Quality: ${(quality * 100).toFixed(0)}%\nClient Paid: $${payout}`;
      if (bonus > 0) message += `\nBonus: +$${bonus}`;
      const skillName = selectedSkill === 'qaSkill' ? 'QA' : skill.toUpperCase();
      message += `\n+${skillGain} ${skillName} Skill${this.fromSkillChallenge ? ' (Bonus)' : ''}`;
      
      this.playerData.money += payout + bonus;
      this.playerData.stress += 1;
    } else {
      message = `❌ You failed to win the job\nYou earned nothing.\nStress increased.`;
      this.playerData.stress += 3;
    }

    this.playerData.day += 1;

    // Save changes
    localStorage.setItem('freeloopSave', JSON.stringify(this.playerData));

    // Display result
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000).setOrigin(0);
    this.add.text(50, 80, message, {
      fontSize: '18px',
      fill: '#ffffff',
      lineSpacing: 8
    });

    const continueBtn = this.add.text(this.scale.width / 2, this.scale.height - 60, 'Continue', {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#444',
      padding: { x: 12, y: 6 }
    })
      .setOrigin(0.5)
      .setInteractive();

    continueBtn.on('pointerup', () => {
      this.scene.start('GameScene');
    });
  }
}
