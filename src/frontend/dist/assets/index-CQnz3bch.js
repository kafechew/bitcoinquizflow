(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))s(t);new MutationObserver(t=>{for(const o of t)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function n(t){const o={};return t.integrity&&(o.integrity=t.integrity),t.referrerPolicy&&(o.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?o.credentials="include":t.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(t){if(t.ep)return;t.ep=!0;const o=n(t);fetch(t.href,o)}})();class v{constructor(){this.currentQuiz=null,this.currentQuestionIndex=0,this.userAnswers=[],this.score=0,this.quizzes=[]}async init(){this.showLoading(),await this.loadQuizzes()}showLoading(){const e=document.getElementById("quizzes");e.innerHTML=`
      <div class="loading">
        <h3>🔄 Loading Bitcoin quizzes...</h3>
        <p>Fetching the latest quizzes from Storyblok...</p>
      </div>
    `}async loadQuizzes(){try{const e="M0JAw8UDAO4zCoV5Ss6siQtt";console.log("🔍 Loading quizzes from Storyblok...");const n=`https://api.storyblok.com/v2/cdn/stories?token=${e}&filter_query[component][in]=quiz&per_page=25&sort_by=created_at:desc`;console.log("📡 Fetching:",n);const s=await fetch(n);if(console.log("📡 Response status:",s.status),!s.ok){const o=await s.text();throw console.error("❌ Response error:",o),new Error(`HTTP ${s.status}: ${s.statusText}`)}const t=await s.json();console.log("📊 Raw API response:",t),this.quizzes=t.stories||[],console.log(`📚 Found ${this.quizzes.length} quizzes`),this.quizzes.length===0?this.renderNoQuizzes():this.renderQuizList(this.quizzes)}catch(e){console.error("❌ Error loading quizzes:",e),this.renderError(e.message)}}renderNoQuizzes(){const e=document.getElementById("quizzes");e.innerHTML=`
      <div class="no-quizzes">
        <h3>📚 No quizzes available yet</h3>
        <p>The automation system hasn't created any quizzes yet.</p>
        <p>Check back later or run the quiz generation workflow!</p>
        <button onclick="app.loadQuizzes()" class="retry-btn">🔄 Refresh</button>
      </div>
    `}renderQuizList(e){console.log("🎨 Rendering quiz list with quizzes:",e),e.length>0&&(console.log("📋 First quiz structure:",JSON.stringify(e[0],null,2)),console.log("📋 First quiz content:",e[0].content));const n=document.getElementById("quizzes"),s=e.map(o=>{var u,l,p,g,z,f;console.log("🃏 Processing story:",o.name,o.content);const r=((u=o.content)==null?void 0:u.title)||o.name||"Untitled Quiz",i=((l=o.content)==null?void 0:l.difficulty)||"medium",c=((g=(p=o.content)==null?void 0:p.questions)==null?void 0:g.length)||0,d=((z=o.content)==null?void 0:z.source_title)||"",a=((f=o.content)==null?void 0:f.source_url)||"",h=o.created_at||o.published_at||new Date().toISOString();return console.log("🏷️ Quiz details:",{title:r,difficulty:i,questionCount:c,sourceTitle:d}),`
        <div class="quiz-card">
          <div class="quiz-card-header">
            <h3>${r}</h3>
            <span class="difficulty difficulty-${i}">
              ${i.toUpperCase()}
            </span>
          </div>
          <div class="quiz-card-body">
            <p><strong>📝 Questions:</strong> ${c}</p>
            ${d?`<p><strong>📖 Source:</strong> ${d}</p>`:""}
            <p><strong>📅 Created:</strong> ${new Date(h).toLocaleDateString()}</p>
          </div>
          <div class="quiz-card-footer">
            ${a?`<a href="${a}" target="_blank">🔗 Read Original Article</a>`:""}
            <button onclick="app.startQuiz('${o.uuid}')" class="start-quiz-btn">
              🚀 Start Quiz
            </button>
          </div>
        </div>
      `}).join(""),t=`
      <div class="quiz-header">
        <h2>📚 Available Bitcoin Quizzes (${e.length})</h2>
        <button onclick="app.loadQuizzes()" class="refresh-btn">🔄 Refresh</button>
      </div>
      ${s}
    `;console.log("🖼️ Final HTML being rendered:",t),n.innerHTML=t}async startQuiz(e){var n,s,t,o,r,i;try{console.log("🚀 Starting quiz with ID:",e),this.showQuizLoading();const c="M0JAw8UDAO4zCoV5Ss6siQtt",d=[`https://api.storyblok.com/v2/cdn/stories/${e}?token=${c}`,`https://api.storyblok.com/v2/cdn/stories/${e}?token=${c}&version=published`,`https://api.storyblok.com/v2/cdn/stories/${e}?token=${c}&cv=${Date.now()}`];let a,h;for(const l of d)try{if(console.log("📡 Trying URL:",l),a=await fetch(l),a.ok){h=await a.json(),console.log("✅ Success with URL:",l);break}else console.log("❌ Failed with status:",a.status,"trying next URL...")}catch(p){console.log("❌ Error with URL:",l,p)}if(!a||!a.ok){console.log("🔄 Using fallback: finding quiz in existing data");const l=this.quizzes.find(p=>p.uuid===e);if(l)console.log("✅ Found quiz in existing data:",l),h={story:l};else throw new Error("Quiz not found. Tried multiple URLs, all failed.")}console.log("📊 Quiz data received:",h);const u=h.story;if(console.log("📖 Story content:",u.content),this.currentQuiz={id:e,title:((n=u.content)==null?void 0:n.title)||u.name||"Untitled Quiz",difficulty:((s=u.content)==null?void 0:s.difficulty)||"medium",questions:((t=u.content)==null?void 0:t.questions)||[],sourceUrl:(o=u.content)==null?void 0:o.source_url,sourceTitle:(r=u.content)==null?void 0:r.source_title},console.log("🎯 Processed quiz:",this.currentQuiz),this.currentQuiz.questions.length===0)throw new Error("This quiz has no questions");this.currentQuestionIndex=0,this.userAnswers=[],this.score=0,document.getElementById("quiz-list").style.display="none",document.getElementById("quiz-container").style.display="block",this.renderQuestion(),console.log("🎨 UI transition complete"),console.log("📱 Quiz list display:",document.getElementById("quiz-list").style.display),console.log("📱 Quiz container display:",document.getElementById("quiz-container").style.display),console.log("🎯 Current question index:",this.currentQuestionIndex),console.log("❓ Rendering question for:",(i=this.currentQuiz)==null?void 0:i.questions[0])}catch(c){console.error("❌ Error loading quiz:",c),alert(`Error loading quiz: ${c.message}`),this.backToQuizzes()}}showQuizLoading(){document.getElementById("quiz-list").style.display="none",document.getElementById("quiz-container").style.display="block",document.getElementById("quiz-content").innerHTML=`
      <div class="loading">
        <h3>🔄 Loading quiz...</h3>
      </div>
    `}renderQuestion(){console.log("🎨 renderQuestion called"),console.log("📊 Current quiz:",this.currentQuiz),console.log("📍 Question index:",this.currentQuestionIndex);const e=document.getElementById("quiz-header"),n=document.getElementById("quiz-content");if(console.log("🏗️ quiz-header element:",e),console.log("🏗️ quiz-content element:",n),!e){console.error("❌ quiz-header element not found!");return}if(!n){console.error("❌ quiz-content element not found!");return}if(!this.currentQuiz){console.error("❌ No current quiz!");return}const s=this.currentQuiz.questions[this.currentQuestionIndex];let t=s.options;typeof t=="string"&&(t=t.split(`
`).filter(i=>i.trim())),console.log("❓ Current question:",s);const o=this.currentQuestionIndex===this.currentQuiz.questions.length-1,r=(this.currentQuestionIndex+1)/this.currentQuiz.questions.length*100;document.getElementById("quiz-header").innerHTML=`
      <div class="quiz-title">
        <h2>${this.currentQuiz.title}</h2>
        <span class="difficulty difficulty-${this.currentQuiz.difficulty}">
          ${this.currentQuiz.difficulty.toUpperCase()}
        </span>
      </div>
      <div class="quiz-progress">
        <p>Question ${this.currentQuestionIndex+1} of ${this.currentQuiz.questions.length}</p>
        <div class="progress-bar">
          <div class="progress" style="width: ${r}%"></div>
        </div>
      </div>
      ${this.currentQuiz.sourceTitle?`
        <div class="source-info">
          📖 Based on: <strong>${this.currentQuiz.sourceTitle}</strong>
        </div>
      `:""}
    `,document.getElementById("quiz-content").innerHTML=`
      <div class="question">
        <h3>${s.question}</h3>
        <div class="options">
          ${t.map((i,c)=>{const d=i.charAt(0);return`
              <div class="option" onclick="app.selectAnswer('${d}')" data-answer="${d}">
                ${i}
              </div>
            `}).join("")}
        </div>
        <div class="question-actions">
          <button onclick="app.nextQuestion()" id="next-btn" style="display: none;">
            ${o?"🏁 Finish Quiz":"➡️ Next Question"}
          </button>
        </div>
      </div>
    `}selectAnswer(e){console.log("🎯 Selected answer:",e),document.querySelectorAll(".option").forEach(t=>t.classList.remove("selected"));const s=document.querySelector(`[data-answer="${e}"]`);console.log("🎯 Selected option element:",s),s==null||s.classList.add("selected"),document.getElementById("next-btn").style.display="block",this.userAnswers[this.currentQuestionIndex]=e,console.log("🎯 User answers array:",this.userAnswers)}nextQuestion(){if(!this.currentQuiz)return;const e=this.currentQuiz.questions[this.currentQuestionIndex],n=this.userAnswers[this.currentQuestionIndex],s=e.correctAnswer||e.correct_answer;console.log("🔍 Question:",e.question),console.log("🔍 User answer:",n),console.log("🔍 Correct answer:",s),console.log("🔍 Is correct?",n===s);const t=n===s;document.querySelectorAll(".option").forEach(i=>{const c=i.getAttribute("data-answer");i.style.pointerEvents="none",c===s?i.classList.add("correct"):c===n&&!t&&i.classList.add("incorrect")});const r=`
      <div class="explanation ${t?"correct-explanation":"incorrect-explanation"}">
        <div class="result-icon">
          ${t?"✅ Correct!":"❌ Incorrect"}
        </div>
        <h4>Explanation:</h4>
        <p>${e.explanation}</p>
        <div class="answer-details">
          <p><strong>Your answer:</strong> ${n}</p>
          <p><strong>Correct answer:</strong> ${s}</p>
        </div>
        ${t?'<p class="encouragement">Great job! 🎉</p>':'<p class="encouragement">Keep learning! 📚</p>'}
        
        <div class="explanation-controls">
          <button onclick="app.continueToNext()" class="continue-btn">
            ${this.currentQuestionIndex+1<this.currentQuiz.questions.length?"➡️ Next Question":"🏁 See Results"}
          </button>
          <div class="auto-continue">
            Auto-continuing in <span id="countdown">5</span> seconds...
          </div>
        </div>
      </div>
    `;document.getElementById("quiz-content").innerHTML+=r,t&&this.score++,setTimeout(()=>{this.currentQuestionIndex++,this.currentQuestionIndex<this.currentQuiz.questions.length?this.renderQuestion():this.showResults()},3e3)}showResults(){if(!this.currentQuiz)return;const e=Math.round(this.score/this.currentQuiz.questions.length*100);let n="",s="";e>=90?(n="Outstanding! You're a Bitcoin expert! 🏆",s="🏆"):e>=75?(n="Excellent work! You know your Bitcoin! 🌟",s="🌟"):e>=60?(n="Good job! Keep learning about Bitcoin! 👍",s="👍"):e>=40?(n="Not bad! There's more to learn about Bitcoin! 📚",s="📚"):(n="Keep studying! Bitcoin has lots to discover! 🚀",s="🚀"),document.getElementById("quiz-header").innerHTML=`
      <div class="results-header">
        <h2>🎯 Quiz Complete!</h2>
      </div>
    `,document.getElementById("quiz-content").innerHTML=`
      <div class="results">
        <div class="score-display">
          <div class="score-circle">
            <div class="score-number">${e}%</div>
            <div class="score-fraction">${this.score}/${this.currentQuiz.questions.length}</div>
          </div>
        </div>
        
        <div class="result-message">
          <div class="result-emoji">${s}</div>
          <p class="message">${n}</p>
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
            <span class="stat-value">${e}%</span>
          </div>
        </div>
        
        <div class="result-actions">
          <button onclick="app.retakeQuiz()" class="secondary-btn">
            🔄 Retake Quiz
          </button>
          <button onclick="app.backToQuizzes()" class="primary-btn">
            📚 Try Another Quiz
          </button>
          ${this.currentQuiz.sourceUrl?`
            <a href="${this.currentQuiz.sourceUrl}" target="_blank" class="source-btn">
              📖 Read Original Article
            </a>
          `:""}
        </div>
        
        <div class="share-section">
          <p>Share your score:</p>
          <button onclick="app.shareScore()" class="share-btn">
            📱 Share Results
          </button>
        </div>
      </div>
    `}shareScore(){if(!this.currentQuiz)return;const n=`I just scored ${Math.round(this.score/this.currentQuiz.questions.length*100)}% on the "${this.currentQuiz.title}" quiz! 🪙 Test your Bitcoin knowledge too!`;navigator.share?navigator.share({title:"Bitcoin Quiz Results",text:n,url:window.location.href}):navigator.clipboard.writeText(n).then(()=>{alert("Score copied to clipboard! 📋")})}backToQuizzes(){document.getElementById("quiz-container").style.display="none",document.getElementById("quiz-list").style.display="block",this.currentQuiz=null}retakeQuiz(){this.currentQuiz&&this.startQuiz(this.currentQuiz.id)}renderError(e){const n=document.getElementById("quizzes");n.innerHTML=`
      <div class="error">
        <h3>❌ Unable to load quizzes</h3>
        <p><strong>Error:</strong> ${e}</p>
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
    `}}const y=new v;y.init();window.app=y;console.log("🌍 Global app check:",window.app);
