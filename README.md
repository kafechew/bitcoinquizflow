# BitcoinQuizFlow

**Auto-generate interactive Bitcoin quizzes from blog posts using Storyblok CMS + AI**

Transform Bitcoin educational content into engaging quizzes automatically. Scrapes blog posts, generates questions with AI, stores in Storyblok, and delivers through a responsive quiz interface.

## ✨ Features

- 🤖 **AI Quiz Generation** - Gemini AI creates contextual questions from blog content
- 📚 **Storyblok CMS** - Structured content management with custom components
- 🎮 **Interactive Interface** - Responsive quiz experience with real-time feedback
- 🔄 **Automated Workflow** - End-to-end content transformation pipeline
- 📊 **Performance Analytics** - Detailed results with achievement badges
- 📱 **Social Sharing** - Share quiz results on Twitter/LinkedIn



## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/kheAI/bitcoinquizflow
cd bitcoinquizflow
npm install
```



### 2. Environment Setup

```bash
cp .env.example .env
```

Add your API keys to `.env`:

```env
STORYBLOK_OAUTH_TOKEN=your_oauth_token
STORYBLOK_SPACE_ID=your_space_id  
STORYBLOK_ACCESS_TOKEN=your_access_token 
GEMINI_API_KEY=your_gemini_key
VITE_STORYBLOK_TOKEN=your_preview_token
```



### 3. Setup Storyblok Schema

```bash
node src/utils/storyblokSchemas.cjs
```



### 4. Generate Quizzes

```bash
npm run generate
```



### 5. Start Frontend

```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000/)** 🎉



## 🏗️ How It Works

```
Blog Posts → AI Processing → Storyblok CMS → Interactive Quiz
```

1. **Scrapes** Bitcoin content from kheai.com
2. **Generates** 4 multiple-choice questions using Gemini AI
3. **Stores** structured quiz data in Storyblok
4. **Delivers** interactive quiz experience



## 🛠️ Tech Stack

- **Backend:** Node.js, TypeScript, Cheerio (scraping)
- **AI:** Google Gemini API for question generation
- **CMS:** Storyblok for content management
- **Frontend:** Vite, TypeScript, Vanilla JS
- **Deployment:** Vercel (frontend), GitHub Actions (automation)



## 📁 Project Structure

```
src/
├── agents/
│   ├── scrapeBlogPosts.js     # Content scraping
│   ├── generateQuiz.js        # AI quiz generation  
│   └── pushToStoryblok.js     # CMS integration
├── frontend/
│   ├── index.html             # Quiz interface
│   ├── main.ts                # App logic
│   └── style.css              # Responsive styling
├── utils/
│   └── storyblokSchemas.cjs   # Schema management
└── workflow.js                # Main automation
```



## 🎯 Storyblok Integration

### Custom Components

- **Quiz:** Title, difficulty, source info, questions array
- **Question:** Question text, options, correct answer, explanation

### API Usage

- **Management API:** Automated content creation
- **Delivery API:** Fast content retrieval for frontend
- **Component Schema:** Structured, validated content types



## 🔧 Available Scripts

```bash
# Test individual components
npm run scrape  # Test blog scraping
node src/agents/generateQuiz.js  # Test AI generation
node src/agents/pushToStoryblok.js  # Test Storyblok push

# for Real
npm run generate    # Generate quizzes from blog content
npm run dev        # Start frontend development server
npm run build      # Build for production
npm run dev schedule # Run with scheduler (for production)
```



## 🚀 Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import repo in Vercel dashboard
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_STORYBLOK_TOKEN`



### Automation (GitHub Actions)

Scheduled workflow runs weekly to generate new quizzes automatically.



## 🎮 Quiz Features

- **Progressive Questions** - One question at a time with smooth transitions
- **Instant Feedback** - Visual indicators for correct/incorrect answers
- **Detailed Explanations** - Educational content for each question
- **Performance Tracking** - Score, accuracy, time metrics
- **Achievement System** - Unlock badges based on performance
- **Social Sharing** - Share results with custom messages



## 🔍 Example Quiz Flow

1. **Select Quiz** from available Bitcoin topics
2. **Answer Questions** with immediate visual feedback
3. **Read Explanations** for educational value
4. **View Results** with detailed analytics
5. **Share Achievement** on social media



## 📊 Content Management

- **Automated Generation** - New blog posts become quizzes automatically
- **Duplicate Prevention** - Tracks processed content to avoid duplicates
- **Quality Validation** - Ensures AI-generated content meets standards
- **Manual Override** - Edit quizzes directly in Storyblok interface



## 📄 License

MIT License - Free to use and modify

**Built with ❤️ for Bitcoin education