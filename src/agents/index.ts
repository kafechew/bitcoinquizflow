import { scrapeBlogPosts } from './scrapeBlogPosts.js';
import { generateQuiz } from './generateQuiz.js';
import { pushToStoryblok } from './pushToStoryblok.js';

export async function runWorkflow() {
  console.log('🚀 Starting BitcoinQuizFlow workflow...');
  
  try {
    // Step 1: Scrape blog posts
    const blogPosts = await scrapeBlogPosts();
    
    if (blogPosts.length === 0) {
      console.log('⚠️ No blog posts found, exiting...');
      return;
    }
    
    // Step 2: Generate quizzes
    const quizzes = await generateQuiz(blogPosts);
    
    if (quizzes.length === 0) {
      console.log('⚠️ No quizzes generated, exiting...');
      return;
    }
    
    // Step 3: Push to Storyblok
    const results = await pushToStoryblok(quizzes);
    
    console.log(`✅ Workflow complete! Created ${results.length} quizzes in Storyblok`);
    
  } catch (error) {
    console.error('❌ Workflow failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runWorkflow();
}