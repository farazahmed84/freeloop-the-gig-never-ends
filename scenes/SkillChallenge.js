export default class SkillChallenge extends Phaser.Scene {
  constructor() {
    super('SkillChallenge');
  }

  init(data) {
    this.selectedJob = data.selectedJob;
    this.playerData = JSON.parse(localStorage.getItem('freeloopSave'));

    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    this.timeLeft = 5;

    this.questions = [];
    this.uiElements = []; // Track UI elements for cleanup
    this.timerEvent = null;
  }

  create() {
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000).setOrigin(0);

    // Instruction text
    this.instructionText = this.add.text(this.scale.width / 2, 40, 'It\'s a difficult task! Answer 5 questions quickly (4s each)', {
      fontSize: '18px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    this.uiElements.push(this.instructionText);

    this.generateQuestions();
    this.renderQuestion();
    this.startTimer();
  }

  generateQuestions() {
    // Dynamic question count based on job difficulty
    const skillGap = Math.abs(this.selectedJob.required - this.playerData[`${this.selectedJob.skill}Skill`]);
    const questionCount = Math.min(8, Math.max(5, Math.floor(skillGap / 10) + 5));
    
    for (let i = 0; i < questionCount; i++) {
      const a = Phaser.Math.Between(2, 12);
      const b = Phaser.Math.Between(2, 12);
      const op = Phaser.Math.RND.pick(['+', '-', '*']);
      const answer = eval(`${a} ${op} ${b}`);
      const options = Phaser.Utils.Array.Shuffle([
        answer,
        answer + Phaser.Math.Between(1, 3),
        answer - Phaser.Math.Between(1, 3),
        answer + Phaser.Math.Between(4, 6)
      ]);
      this.questions.push({ text: `${a} ${op} ${b}`, answer, options });
    }
  }

  renderQuestion() {
    // Clear existing UI elements
    this.clearUI();

    const q = this.questions[this.currentQuestionIndex];
    if (!q) return;

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const cardWidth = 300;
    const cardHeight = 350; // Increased height to provide bottom margin

    // Card background
    const cardBg = this.add.rectangle(centerX, centerY, cardWidth, cardHeight, 0x444444);
    cardBg.setStrokeStyle(2, 0x666666);
    this.uiElements.push(cardBg);

    // Question title
    const titleText = this.add.text(centerX, centerY - 140, `Question ${this.currentQuestionIndex + 1} of 5`, {
      fontSize: '18px',
      fill: '#ffffff',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.uiElements.push(titleText);

    // Question text
    const questionText = this.add.text(centerX, centerY - 100, q.text, {
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    this.uiElements.push(questionText);

    // Answer buttons
    q.options.forEach((opt, optIndex) => {
      const buttonY = centerY - 30 + (optIndex * 50);
      const buttonBg = this.add.rectangle(centerX, buttonY, cardWidth - 40, 40, 0x555555);
      buttonBg.setStrokeStyle(1, 0x777777);
      this.uiElements.push(buttonBg);

      const buttonText = this.add.text(centerX, buttonY, opt.toString(), {
        fontSize: '16px',
        fill: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
      this.uiElements.push(buttonText);

      // Make button interactive
      buttonBg.setInteractive();
      buttonBg.on('pointerup', () => {
        if (opt === q.answer) {
          this.correctAnswers++;
          this.nextQuestion();
        } else {
          this.failChallenge();
        }
      });
      buttonText.setInteractive();
      buttonText.on('pointerup', () => {
        if (opt === q.answer) {
          this.correctAnswers++;
          this.nextQuestion();
        } else {
          this.failChallenge();
        }
      });
    });
  }

  startTimer() {
    this.timeLeft = 5;
    if (this.timerEvent) this.timerEvent.remove();

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      repeat: 4,
      callback: () => {
        this.timeLeft--;
        this.instructionText.setText(`It's a difficult task! Answer 5 questions quickly (${this.timeLeft}s left)`);
        if (this.timeLeft <= 0) {
          this.failChallenge();
        }
      }
    });
  }

  nextQuestion() {
    if (this.timerEvent) this.timerEvent.remove();
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex >= this.questions.length) {
      this.completeChallenge();
    } else {
      this.renderQuestion();
      // Immediately update the display to show the new default time
      this.timeLeft = 5;
      this.instructionText.setText(`It's a difficult task! Answer 5 questions quickly (${this.timeLeft}s left)`);
      this.startTimer();
    }
  }

  completeChallenge() {
    this.scene.start('JobResult', {
      selectedJob: this.selectedJob,
      success: true,
      fromSkillChallenge: true
    });
  }

  failChallenge() {
    if (this.timerEvent) this.timerEvent.remove();
    this.scene.start('JobResult', {
      selectedJob: this.selectedJob,
      success: false
    });
  }

  clearUI() {
    // Remove all UI elements except instruction text
    this.uiElements.forEach(element => {
      if (element !== this.instructionText) {
        element.destroy();
      }
    });
    this.uiElements = this.uiElements.filter(element => element === this.instructionText);
  }

  shutdown() {
    this.clearUI();
    if (this.timerEvent) this.timerEvent.remove();
  }

  destroy() {
    this.clearUI();
    if (this.timerEvent) this.timerEvent.remove();
  }
}
