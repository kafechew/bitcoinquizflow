import dotenv from 'dotenv';
import cron from 'node-cron';
import { scrapeBlogPosts } from './agents/scrapeBlogPosts.js';
import { generateQuiz } from './agents/generateQuiz.js';
import { pushToStoryblok } from './agents/pushToStoryblok.js';

dotenv.config();

export async function runWorkflow() {
  console.log('🚀 Starting BitcoinQuizFlow workflow...');
  console.log('⏰', new Date().toISOString());
  
  try {
    // Step 1: Scrape blog posts
    console.log('\n📰 Step 1: Scraping blog posts...');
    const blogPosts = await scrapeBlogPosts();
    
    if (blogPosts.length === 0) {
      console.log('⚠️ No new blog posts found, exiting...');
      return { success: true, message: 'No new posts to process' };
    }
    
    console.log(`✅ Found ${blogPosts.length} blog posts`);
    
    // Step 2: Generate quizzes
    console.log('\n🧠 Step 2: Generating quizzes with AI...');
    const quizzes = await generateQuiz(blogPosts);
    
    if (quizzes.length === 0) {
      console.log('⚠️ No quizzes generated, exiting...');
      return { success: false, message: 'Failed to generate quizzes' };
    }
    
    console.log(`✅ Generated ${quizzes.length} quizzes`);
    
    // Step 3: Push to Storyblok
    console.log('\n📤 Step 3: Pushing to Storyblok...');
    const results = await pushToStoryblok(quizzes);
    
    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Successfully created ${successCount}/${results.length} quizzes in Storyblok`);
    
    return { 
      success: true, 
      message: `Workflow complete! Created ${successCount} quizzes`,
      stats: {
        postsScraped: blogPosts.length,
        quizzesGenerated: quizzes.length,
        quizzesCreated: successCount
      }
    };
    
  } catch (error) {
    console.error('❌ Workflow failed:', error);
    return { success: false, error: error.message };
  }
}

// Schedule to run every Sunday at midnight
export function startScheduler() {
  console.log('📅 Starting BitcoinQuizFlow scheduler...');
  console.log('⏰ Will run every Sunday at 00:00');
  
  // Run every Sunday at midnight
  cron.schedule('0 0 * * 0', async () => {
    console.log('\n🔔 Scheduled run triggered');
    await runWorkflow();
  });
  
  // Also run immediately for testing
  console.log('🧪 Running initial test...');
  runWorkflow();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'schedule') {
    startScheduler();
  } else {
    runWorkflow().then(result => {
      console.log('\n📊 Final Result:', result);
      process.exit(result.success ? 0 : 1);
    });
  }
}