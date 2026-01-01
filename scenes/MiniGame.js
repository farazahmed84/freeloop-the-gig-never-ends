export default class MiniGame extends Phaser.Scene {
  constructor() {
    super('MiniGame');
    this.funnyNamesPool = [
      'PixelGuru', 'Devzilla', 'KarenUX', 'CSSSultan', 'BudgetBobby',
      'NodeNinja', 'JuniorSenior', 'FloatyMcBug', 'ClickWhisperer', 'AltF4Andy'
    ];
  }

  init(data) {
    this.selectedJob = data.selectedJob;
    this.playerData = JSON.parse(localStorage.getItem('freeloopSave'));

    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    this.timeLeft = 10;

    this.questions = [];
    this.uiElements = []; // Track UI elements for cleanup
    this.timerEvent = null;

    const shuffled = Phaser.Utils.Array.Shuffle([...this.funnyNamesPool]);
    this.rivalA = shuffled[0];
    this.rivalB = shuffled[1];
    this.rivalC = 'Faraz The Web Guy';
  }

  create() {
    // Black background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000).setOrigin(0);

    // Instruction text
    this.instructionText = this.add.text(this.scale.width / 2, 40, `Write a good proposal and win the job! (Answer 3 questions correctly)`, {
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
    for (let i = 0; i < 3; i++) {
      const a = Phaser.Math.Between(1, 10);
      const b = Phaser.Math.Between(1, 10);
      const op = Phaser.Math.RND.pick(['+', '-', '*']);
      const answer = eval(`${a} ${op} ${b}`);
      const options = Phaser.Utils.Array.Shuffle([
        answer,
        answer + Phaser.Math.Between(1, 3),
        answer - Phaser.Math.Between(1, 3),
        answer + Phaser.Math.Between(4, 6)
      ]);
      this.questions.push({
        text: `${a} ${op} ${b}`,
        answer,
        options
      });
    }
  }

  renderQuestion() {
    // Clear existing UI elements
    this.clearUI();

    const q = this.questions[this.currentQuestionIndex];
    if (!q) return;

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const cardWidth = 200;
    const cardHeight = 280;
    const cardSpacing = 30;

    // Create card container background with margins
    const containerWidth = cardWidth * 4 + cardSpacing * 3 + 40; // Add 40px total margin
    const containerBg = this.add.rectangle(centerX, centerY, containerWidth, cardHeight + cardSpacing + 20, 0x333333, 0.8);
    this.uiElements.push(containerBg);

    const names = ['You', this.rivalA, this.rivalB, this.rivalC];
    const contents = [q.text, '?\n(Thinking...)', '?\n(Busy typing...)', '?\n(Smirking...)'];
    const emojis = ['👤', '👨‍💻', '👩‍💻', '👨‍💼'];

    names.forEach((name, i) => {
      const cardX = centerX - (cardWidth * 1.5 + cardSpacing * 1.5) + (cardWidth + cardSpacing) * i;
      const cardY = centerY;

      // Card background
      const cardBg = this.add.rectangle(cardX, cardY, cardWidth, cardHeight, 0x444444);
      cardBg.setStrokeStyle(2, 0x666666);
      this.uiElements.push(cardBg);

      // Emoji inside card (top area)
      const emojiText = this.add.text(cardX, cardY - 120, emojis[i], {
        fontSize: '24px',
        align: 'center'
      }).setOrigin(0.5);
      this.uiElements.push(emojiText);

      // Name title
      const nameText = this.add.text(cardX, cardY - 100, name, {
        fontSize: '16px',
        fill: '#ffffff',
        align: 'center',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.uiElements.push(nameText);

      if (i === 0) {
        // Question text
        const questionText = this.add.text(cardX, cardY - 50, q.text, {
          fontSize: '18px',
          fill: '#ffffff',
          align: 'center'
        }).setOrigin(0.5);
        this.uiElements.push(questionText);

        // Answer buttons - positioned close to question
        q.options.forEach((opt, optIndex) => {
          const buttonY = cardY + 10 + (optIndex * 35);
          const buttonBg = this.add.rectangle(cardX, buttonY, cardWidth - 20, 30, 0x555555);
          buttonBg.setStrokeStyle(1, 0x777777);
          this.uiElements.push(buttonBg);

          const buttonText = this.add.text(cardX, buttonY, opt.toString(), {
            fontSize: '14px',
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
              this.failMiniGame();
            }
          });
          buttonText.setInteractive();
          buttonText.on('pointerup', () => {
            if (opt === q.answer) {
              this.correctAnswers++;
              this.nextQuestion();
            } else {
              this.failMiniGame();
            }
          });
        });
      } else {
        // Rival content
        const rivalText = this.add.text(cardX, cardY + 80, contents[i], {
          fontSize: '14px',
          fill: '#cccccc',
          align: 'center',
          wordWrap: { width: cardWidth - 20 }
        }).setOrigin(0.5);
        this.uiElements.push(rivalText);
      }
    });
  }

  startTimer() {
    this.timeLeft = 10;
    if (this.timerEvent) this.timerEvent.remove();

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      repeat: 9,
      callback: () => {
        this.timeLeft--;
        this.instructionText.setText(`Write a good proposal and win the job! (Answer 3 questions correctly) (${this.timeLeft}s)`);
        if (this.timeLeft <= 0) {
          this.failMiniGame();
        }
      }
    });
  }

  nextQuestion() {
    if (this.timerEvent) this.timerEvent.remove();
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex >= this.questions.length) {
      this.checkResult();
    } else {
      this.renderQuestion();
      // Immediately update the display to show the new default time
      this.timeLeft = 10;
      this.instructionText.setText(`Write a good proposal and win the job! (Answer 3 questions correctly) (${this.timeLeft}s)`);
      this.startTimer();
    }
  }

  checkResult() {
    const skillType = this.selectedJob.skill;
    const playerSkill = this.playerData[`${skillType}Skill`];
    const jobRequirement = this.selectedJob.required;

    if (playerSkill < jobRequirement) {
      this.scene.start('SkillChallenge', { selectedJob: this.selectedJob });
    } else {
      this.scene.start('JobResult', { selectedJob: this.selectedJob, success: true });
    }
  }

  failMiniGame() {
    if (this.timerEvent) this.timerEvent.remove();
    this.scene.start('JobResult', { selectedJob: this.selectedJob, success: false });
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
