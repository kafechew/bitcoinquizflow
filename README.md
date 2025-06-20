# BitcoinQuizFlow

Auto-generate interactive Bitcoin quizzes from blog posts using Storyblok CMS + AI automation

## 🚀 Quick Start

# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# 3. Test individual components
npm run scrape  # Test blog scraping
node src/agents/generateQuiz.js  # Test AI generation
node src/agents/pushToStoryblok.js  # Test Storyblok push

# 4. Run full workflow
npm run generate

# 5. Start frontend
npm run frontend
# Visit http://localhost:3000

# 6. Run with scheduler (for production)
npm run dev schedule