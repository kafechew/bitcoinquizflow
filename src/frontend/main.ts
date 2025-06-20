interface Quiz {
  id: string;
  title: string;
  difficulty: string;
  questions: Question[];
  sourceUrl?: string;
  sourceTitle?: string;
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
  private quizzes: any[] = [];

  async init() {
    this.showLoading();
    await this.loadQuizzes();
  }

  showLoading() {
    const container = document.getElementById('quizzes')!;
    container.innerHTML = `
      <div class="loading">
        <h3>🔄 Loading Bitcoin quizzes...</h3>
        <p>Fetching the latest quizzes from Storyblok...</p>
      </div>
    `;
  }

  async loadQuizzes() {
    try {
      // Use the token directly for now
      const token = 'M0JAw8UDAO4zCoV5Ss6siQtt';
      
      console.log('🔍 Loading quizzes from Storyblok...');
      
      const url = `https://api.storyblok.com/v2/cdn/stories?token=${token}&filter_query[component][in]=quiz&per_page=25&sort_by=created_at:desc`;
      console.log('📡 Fetching:', url);
      
      const response = await fetch(url);
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Raw API response:', data);
      
      this.quizzes = data.stories || [];
      
      console.log(`📚 Found ${this.quizzes.length} quizzes`);
      
      if (this.quizzes.length === 0) {
        this.renderNoQuizzes();
      } else {
        this.renderQuizList(this.quizzes);
      }
      
    } catch (error) {
      console.error('❌ Error loading quizzes:', error);
      this.renderError(error.message);
    }
  }
  

  renderNoQuizzes() {
    const container = document.getElementById('quizzes')!;
    container.innerHTML = `
      <div class="no-quizzes">
        <h3>📚 No quizzes available yet</h3>
        <p>The automation system hasn't created any quizzes yet.</p>
        <p>Check back later or run the quiz generation workflow!</p>
        <button onclick="app.loadQuizzes()" class="retry-btn">🔄 Refresh</button>
      </div>
    `;
  }

  renderQuizList(quizzes: any[]) {
    console.log('🎨 Rendering quiz list with quizzes:', quizzes);
    
    if (quizzes.length > 0) {
      console.log('📋 First quiz structure:', JSON.stringify(quizzes[0], null, 2));
      console.log('📋 First quiz content:', quizzes[0].content);
    }
    
    const container = document.getElementById('quizzes')!;
    
    const quizCards = quizzes.map(story => {
      console.log('🃏 Processing story:', story.name, story.content);
      
      const title = story.content?.title || story.name || 'Untitled Quiz';
      const difficulty = story.content?.difficulty || 'medium';
      const questionCount = story.content?.questions?.length || 0;
      const sourceTitle = story.content?.source_title || '';
      const sourceUrl = story.content?.source_url || '';
      const createdAt = story.created_at || story.published_at || new Date().toISOString();
      
      console.log('🏷️ Quiz details:', { title, difficulty, questionCount, sourceTitle });
      
      return `
        <div class="quiz-card">
          <div class="quiz-card-header">
            <h3>${title}</h3>
            <span class="difficulty difficulty-${difficulty}">
              ${difficulty.toUpperCase()}
            </span>
          </div>
          <div class="quiz-card-body">
            <p><strong>📝 Questions:</strong> ${questionCount}</p>
            ${sourceTitle ? `<p><strong>📖 Source:</strong> ${sourceTitle}</p>` : ''}
            <p><strong>📅 Created:</strong> ${new Date(createdAt).toLocaleDateString()}</p>
          </div>
          <div class="quiz-card-footer">
            ${sourceUrl ? `<a href="${sourceUrl}" target="_blank">🔗 Read Original Article</a>` : ''}
            <button onclick="app.startQuiz('${story.uuid}')" class="start-quiz-btn">
              🚀 Start Quiz
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    const finalHtml = `
      <div class="quiz-header">
        <h2>📚 Available Bitcoin Quizzes (${quizzes.length})</h2>
        <button onclick="app.loadQuizzes()" class="refresh-btn">🔄 Refresh</button>
      </div>
      ${quizCards}
    `;
    
    console.log('🖼️ Final HTML being rendered:', finalHtml);
    container.innerHTML = finalHtml;
  }

  async startQuiz(quizId: string) {
    try {
      console.log('🚀 Starting quiz with ID:', quizId);
      this.showQuizLoading();
      
      const token = 'M0JAw8UDAO4zCoV5Ss6siQtt';
      
      // Try different URL formats
      const urls = [
        `https://api.storyblok.com/v2/cdn/stories/${quizId}?token=${token}`,
        `https://api.storyblok.com/v2/cdn/stories/${quizId}?token=${token}&version=published`,
        `https://api.storyblok.com/v2/cdn/stories/${quizId}?token=${token}&cv=${Date.now()}`
      ];
      
      let response;
      let data;
      
      for (const url of urls) {
        try {
          console.log('📡 Trying URL:', url);
          response = await fetch(url);
          
          if (response.ok) {
            data = await response.json();
            console.log('✅ Success with URL:', url);
            break;
          } else {
            console.log('❌ Failed with status:', response.status, 'trying next URL...');
          }
        } catch (error) {
          console.log('❌ Error with URL:', url, error);
        }
      }
      
      if (!response || !response.ok) {
        // Fallback: use the quiz data we already have from the list
        console.log('🔄 Using fallback: finding quiz in existing data');
        const existingQuiz = this.quizzes.find(q => q.uuid === quizId);
        
        if (existingQuiz) {
          console.log('✅ Found quiz in existing data:', existingQuiz);
          data = { story: existingQuiz };
        } else {
          throw new Error(`Quiz not found. Tried multiple URLs, all failed.`);
        }
      }
      
      console.log('📊 Quiz data received:', data);
      
      const story = data.story;
      console.log('📖 Story content:', story.content);
      
      this.currentQuiz = {
        id: quizId,
        title: story.content?.title || story.name || 'Untitled Quiz',
        difficulty: story.content?.difficulty || 'medium',
        questions: story.content?.questions || [],
        sourceUrl: story.content?.source_url,
        sourceTitle: story.content?.source_title
      };
      
      console.log('🎯 Processed quiz:', this.currentQuiz);
      
      if (this.currentQuiz.questions.length === 0) {
        throw new Error('This quiz has no questions');
      }
      
      this.currentQuestionIndex = 0;
      this.userAnswers = [];
      this.score = 0;
      
      document.getElementById('quiz-list')!.style.display = 'none';
      document.getElementById('quiz-container')!.style.display = 'block';
      
      this.renderQuestion();
      console.log('🎨 UI transition complete');
      console.log('📱 Quiz list display:', document.getElementById('quiz-list')!.style.display);
      console.log('📱 Quiz container display:', document.getElementById('quiz-container')!.style.display);
      console.log('🎯 Current question index:', this.currentQuestionIndex);
      console.log('❓ Rendering question for:', this.currentQuiz?.questions[0]);
      
    } catch (error) {
      console.error('❌ Error loading quiz:', error);
      alert(`Error loading quiz: ${error.message}`);
      
      // Return to quiz list on error
      this.backToQuizzes();
    }
  }

  showQuizLoading() {
    document.getElementById('quiz-list')!.style.display = 'none';
    document.getElementById('quiz-container')!.style.display = 'block';
    document.getElementById('quiz-content')!.innerHTML = `
      <div class="loading">
        <h3>🔄 Loading quiz...</h3>
      </div>
    `;
  }

  renderQuestion() {
    console.log('🎨 renderQuestion called');
    console.log('📊 Current quiz:', this.currentQuiz);
    console.log('📍 Question index:', this.currentQuestionIndex);
    
    // Check if HTML elements exist
    const quizHeader = document.getElementById('quiz-header');
    const quizContent = document.getElementById('quiz-content');
    console.log('🏗️ quiz-header element:', quizHeader);
    console.log('🏗️ quiz-content element:', quizContent);
    
    if (!quizHeader) {
      console.error('❌ quiz-header element not found!');
      return;
    }
    
    if (!quizContent) {
      console.error('❌ quiz-content element not found!');
      return;
    }
    
    if (!this.currentQuiz) {
      console.error('❌ No current quiz!');
      return;
    }
    
    const question = this.currentQuiz.questions[this.currentQuestionIndex];

    // Handle options as either array or string
    let options = question.options;
    if (typeof options === 'string') {
      options = options.split('\n').filter(opt => opt.trim());
    }

    console.log('❓ Current question:', question);
    const isLastQuestion = this.currentQuestionIndex === this.currentQuiz.questions.length - 1;
    const progress = ((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100;
    
    document.getElementById('quiz-header')!.innerHTML = `
      <div class="quiz-title">
        <h2>${this.currentQuiz.title}</h2>
        <span class="difficulty difficulty-${this.currentQuiz.difficulty}">
          ${this.currentQuiz.difficulty.toUpperCase()}
        </span>
      </div>
      <div class="quiz-progress">
        <p>Question ${this.currentQuestionIndex + 1} of ${this.currentQuiz.questions.length}</p>
        <div class="progress-bar">
          <div class="progress" style="width: ${progress}%"></div>
        </div>
      </div>
      ${this.currentQuiz.sourceTitle ? `
        <div class="source-info">
          📖 Based on: <strong>${this.currentQuiz.sourceTitle}</strong>
        </div>
      ` : ''}
    `;
    
    document.getElementById('quiz-content')!.innerHTML = `
      <div class="question">
        <h3>${question.question}</h3>
        <div class="options">
          ${options.map((option, index) => {
            const letter = option.charAt(0);
            return `
              <div class="option" onclick="app.selectAnswer('${letter}')" data-answer="${letter}">
                ${option}
              </div>
            `;
          }).join('')}
        </div>
        <div class="question-actions">
          <button onclick="app.nextQuestion()" id="next-btn" style="display: none;">
            ${isLastQuestion ? '🏁 Finish Quiz' : '➡️ Next Question'}
          </button>
        </div>
      </div>
    `;
  }

  selectAnswer(answer: string) {
    console.log('🎯 Selected answer:', answer);
    
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));
    
    const selectedOption = document.querySelector(`[data-answer="${answer}"]`);
    console.log('🎯 Selected option element:', selectedOption);
    
    selectedOption?.classList.add('selected');
    
    document.getElementById('next-btn')!.style.display = 'block';
    this.userAnswers[this.currentQuestionIndex] = answer;
    
    console.log('🎯 User answers array:', this.userAnswers);
  }

  nextQuestion() {
    if (!this.currentQuiz) return;
    
    const question = this.currentQuiz.questions[this.currentQuestionIndex];
    const userAnswer = this.userAnswers[this.currentQuestionIndex];
    const correctAnswer = question.correctAnswer || question.correct_answer; // Handle both formats
    
    console.log('🔍 Question:', question.question);
    console.log('🔍 User answer:', userAnswer);
    console.log('🔍 Correct answer:', correctAnswer);
    console.log('🔍 Is correct?', userAnswer === correctAnswer);
    
    const isCorrect = userAnswer === correctAnswer;
    
    // Show correct answer
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
      const answer = option.getAttribute('data-answer');
      option.style.pointerEvents = 'none'; // Disable clicking
      
      if (answer === correctAnswer) {
        option.classList.add('correct');
      } else if (answer === userAnswer && !isCorrect) {
        option.classList.add('incorrect');
      }
    });
    
    // Show explanation
    const explanationHtml = `
      <div class="explanation ${isCorrect ? 'correct-explanation' : 'incorrect-explanation'}">
        <div class="result-icon">
          ${isCorrect ? '✅ Correct!' : '❌ Incorrect'}
        </div>
        <h4>Explanation:</h4>
        <p>${question.explanation}</p>
        <div class="answer-details">
          <p><strong>Your answer:</strong> ${userAnswer}</p>
          <p><strong>Correct answer:</strong> ${correctAnswer}</p>
        </div>
        ${isCorrect ? '<p class="encouragement">Great job! 🎉</p>' : '<p class="encouragement">Keep learning! 📚</p>'}
        
        <div class="explanation-controls">
          <button onclick="app.continueToNext()" class="continue-btn">
            ${this.currentQuestionIndex + 1 < this.currentQuiz!.questions.length ? '➡️ Next Question' : '🏁 See Results'}
          </button>
          <div class="auto-continue">
            Auto-continuing in <span id="countdown">5</span> seconds...
          </div>
        </div>
      </div>
    `;

    document.getElementById('quiz-content')!.innerHTML += explanationHtml;
    
    if (isCorrect) {
      this.score++;
    }
    
    // Auto-advance after showing explanation
    setTimeout(() => {
      this.currentQuestionIndex++;
      if (this.currentQuestionIndex < this.currentQuiz!.questions.length) {
        this.renderQuestion();
      } else {
        this.showResults();
      }
    }, 3000);
  }

  showResults() {
    if (!this.currentQuiz) return;
    
    const percentage = Math.round((this.score / this.currentQuiz.questions.length) * 100);
    let message = '';
    let emoji = '';
    
    if (percentage >= 90) {
      message = 'Outstanding! You\'re a Bitcoin expert! 🏆';
      emoji = '🏆';
    } else if (percentage >= 75) {
      message = 'Excellent work! You know your Bitcoin! 🌟';
      emoji = '🌟';
    } else if (percentage >= 60) {
      message = 'Good job! Keep learning about Bitcoin! 👍';
      emoji = '👍';
    } else if (percentage >= 40) {
      message = 'Not bad! There\'s more to learn about Bitcoin! 📚';
      emoji = '📚';
    } else {
      message = 'Keep studying! Bitcoin has lots to discover! 🚀';
      emoji = '🚀';
    }
    
    document.getElementById('quiz-header')!.innerHTML = `
      <div class="results-header">
        <h2>🎯 Quiz Complete!</h2>
      </div>
    `;
    
    document.getElementById('quiz-content')!.innerHTML = `
      <div class="results">
        <div class="score-display">
          <div class="score-circle">
            <div class="score-number">${percentage}%</div>
            <div class="score-fraction">${this.score}/${this.currentQuiz.questions.length}</div>
          </div>
        </div>
        
        <div class="result-message">
          <div class="result-emoji">${emoji}</div>
          <p class="message">${message}</p>
        </div>
        
        <div class="quiz-stats">
          <div class="stat">
            <span class="stat-label">Correct Answers</span>
            <span class="stat-value">${this.score}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Total Questions</span>
            <span class="stat-value">${this.currentQuiz.questions.length}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Accuracy</span>
            <span class="stat-value">${percentage}%</span>
          </div>
        </div>
        
        <div class="result-actions">
          <button onclick="app.retakeQuiz()" class="secondary-btn">
            🔄 Retake Quiz
          </button>
          <button onclick="app.backToQuizzes()" class="primary-btn">
            📚 Try Another Quiz
          </button>
          ${this.currentQuiz.sourceUrl ? `
            <a href="${this.currentQuiz.sourceUrl}" target="_blank" class="source-btn">
              📖 Read Original Article
            </a>
          ` : ''}
        </div>
        
        <div class="share-section">
          <p>Share your score:</p>
          <button onclick="app.shareScore()" class="share-btn">
            📱 Share Results
          </button>
        </div>
      </div>
    `;
  }

  shareScore() {
    if (!this.currentQuiz) return;
    
    const percentage = Math.round((this.score / this.currentQuiz.questions.length) * 100);
    const text = `I just scored ${percentage}% on the "${this.currentQuiz.title}" quiz! 🪙 Test your Bitcoin knowledge too!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Bitcoin Quiz Results',
        text: text,
        url: window.location.href
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(text).then(() => {
        alert('Score copied to clipboard! 📋');
      });
    }
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

  renderError(message: string) {
    const container = document.getElementById('quizzes')!;
    container.innerHTML = `
      <div class="error">
        <h3>❌ Unable to load quizzes</h3>
        <p><strong>Error:</strong> ${message}</p>
        <div class="error-help">
          <h4>Setup Steps:</h4>
          <ol>
            <li><strong>Get Storyblok Preview Token:</strong>
              <ul>
                <li>Go to your Storyblok space</li>
                <li>Settings → Access Tokens</li>
                <li>Copy the "Preview" token</li>
              </ul>
            </li>
            <li><strong>Add to .env file:</strong>
              <pre>VITE_STORYBLOK_TOKEN=your_preview_token_here</pre>
            </li>
            <li><strong>Restart the frontend:</strong>
              <pre>npm run frontend</pre>
            </li>
            <li><strong>Generate some quizzes:</strong>
              <pre>npm run generate</pre>
            </li>
          </ol>
        </div>
        <button onclick="app.loadQuizzes()" class="retry-btn">🔄 Try Again</button>
      </div>
    `;
  }
}

// Initialize app
const app = new QuizApp();
app.init();

// Make app globally available for onclick handlers
(window as any).app = app;

// Add this at the very end of main.ts, after the existing code:

// Test if app is globally available
console.log('🌍 Global app check:', (window as any).app);
