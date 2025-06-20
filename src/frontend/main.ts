interface Quiz {
  id: string;
  title: string;
  difficulty: string;
  questions: Question[];
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

class QuizApp {
  private currentQuiz: Quiz | null = null;
  private currentQuestionIndex = 0;
  private userAnswers: string[] = [];
  private score = 0;

  async init() {
    await this.loadQuizzes();
  }

  async loadQuizzes() {
    try {
      // Replace with your Storyblok space details
      const response = await fetch(`https://api.storyblok.com/v2/cdn/stories?token=${import.meta.env.VITE_STORYBLOK_TOKEN}&filter_query[component][in]=quiz`);
      const data = await response.json();
      
      this.renderQuizList(data.stories);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      this.renderError();
    }
  }

  renderQuizList(quizzes: any[]) {
    const container = document.getElementById('quizzes')!;
    container.innerHTML = quizzes.map(story => `
      <div class="quiz-card" onclick="app.startQuiz('${story.uuid}')">
        <h3>${story.content.title}</h3>
        <p><strong>Difficulty:</strong> ${story.content.difficulty}</p>
        <p><strong>Questions:</strong> ${story.content.questions.length}</p>
        <p><a href="${story.content.source_url}" target="_blank">Source Article</a></p>
      </div>
    `).join('');
  }

  async startQuiz(quizId: string) {
    try {
      const response = await fetch(`https://api.storyblok.com/v2/cdn/stories/${quizId}?token=${import.meta.env.VITE_STORYBLOK_TOKEN}`);
      const data = await response.json();
      
      this.currentQuiz = {
        id: quizId,
        title: data.story.content.title,
        difficulty: data.story.content.difficulty,
        questions: data.story.content.questions
      };
      
      this.currentQuestionIndex = 0;
      this.userAnswers = [];
      this.score = 0;
      
      document.getElementById('quiz-list')!.style.display = 'none';
      document.getElementById('quiz-container')!.style.display = 'block';
      
      this.renderQuestion();
    } catch (error) {
      console.error('Error loading quiz:', error);
    }
  }

  renderQuestion() {
    if (!this.currentQuiz) return;
    
    const question = this.currentQuiz.questions[this.currentQuestionIndex];
    const isLastQuestion = this.currentQuestionIndex === this.currentQuiz.questions.length - 1;
    
    document.getElementById('quiz-header')!.innerHTML = `
      <h2>${this.currentQuiz.title}</h2>
      <p>Question ${this.currentQuestionIndex + 1} of ${this.currentQuiz.questions.length}</p>
      <div class="progress-bar">
        <div class="progress" style="width: ${((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100}%"></div>
      </div>
    `;
    
    document.getElementById('quiz-content')!.innerHTML = `
      <div class="question">
        <h3>${question.question}</h3>
        <div class="options">
          ${question.options.map((option, index) => `
            <div class="option" onclick="app.selectAnswer('${option.charAt(0)}')" data-answer="${option.charAt(0)}">
              ${option}
            </div>
          `).join('')}
        </div>
        <button onclick="app.nextQuestion()" id="next-btn" style="display: none;">
          ${isLastQuestion ? 'Finish Quiz' : 'Next Question'}
        </button>
      </div>
    `;
  }

  selectAnswer(answer: string) {
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));
    
    const selectedOption = document.querySelector(`[data-answer="${answer}"]`);
    selectedOption?.classList.add('selected');
    
    document.getElementById('next-btn')!.style.display = 'block';
    this.userAnswers[this.currentQuestionIndex] = answer;
  }

  nextQuestion() {
    if (!this.currentQuiz) return;
    
    const question = this.currentQuiz.questions[this.currentQuestionIndex];
    const userAnswer = this.userAnswers[this.currentQuestionIndex];
    
    // Show correct answer
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
      const answer = option.getAttribute('data-answer');
      if (answer === question.correctAnswer) {
        option.classList.add('correct');
      } else if (answer === userAnswer && answer !== question.correctAnswer) {
        option.classList.add('incorrect');
      }
    });
    
    // Show explanation
    document.getElementById('quiz-content')!.innerHTML += `
      <div class="explanation">
        <h4>Explanation:</h4>
        <p>${question.explanation}</p>
      </div>
    `;
    
    if (userAnswer === question.correctAnswer) {
      this.score++;
    }
    
    setTimeout(() => {
      this.currentQuestionIndex++;
      if (this.currentQuestionIndex < this.currentQuiz.questions.length) {
        this.renderQuestion();
      } else {
        this.showResults();
      }
    }, 2000);
  }

  showResults() {
    if (!this.currentQuiz) return;
    
    const percentage = Math.round((this.score / this.currentQuiz.questions.length) * 100);
    let message = '';
    
    if (percentage >= 80) message = '🏆 Excellent! You really know your Bitcoin!';
    else if (percentage >= 60) message = '👍 Good job! Keep learning about Bitcoin!';
    else message = '📚 Keep studying! Bitcoin has lots to learn!';
    
    document.getElementById('quiz-content')!.innerHTML = `
      <div class="score">
        <h2>Quiz Complete!</h2>
        <p class="score-display">${this.score} / ${this.currentQuiz.questions.length}</p>
        <p class="percentage">${percentage}%</p>
        <p class="message">${message}</p>
        <button onclick="app.backToQuizzes()">Try Another Quiz</button>
        <button onclick="app.retakeQuiz()">Retake This Quiz</button>
      </div>
    `;
  }

  backToQuizzes() {
    document.getElementById('quiz-container')!.style.display = 'none';
    document.getElementById('quiz-list')!.style.display = 'block';
    this.currentQuiz = null;
  }

  retakeQuiz() {
    if (this.currentQuiz) {
      this.startQuiz(this.currentQuiz.id);
    }
  }

  renderError() {
    document.getElementById('quizzes')!.innerHTML = `
      <div class="error">
        <h3>Unable to load quizzes</h3>
        <p>Please check your Storyblok configuration and try again.</p>
      </div>
    `;
  }
}

// Initialize app
const app = new QuizApp();
app.init();

// Make app globally available for onclick handlers
(window as any).app = app;