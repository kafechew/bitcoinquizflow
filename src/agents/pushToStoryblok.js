import StoryblokClient from 'storyblok-js-client';
import dotenv from 'dotenv';

dotenv.config();

const storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_OAUTH_TOKEN
});

export async function pushToStoryblok(quizzes) {
  const results = [];
  
  for (const quiz of quizzes) {
    try {
      console.log(`📤 Pushing quiz to Storyblok: ${quiz.title}`);
      
      // Create slug from title
      const slug = quiz.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      
      // Check if quiz already exists
      try {
        const existingStories = await storyblok.get(`spaces/${process.env.STORYBLOK_SPACE_ID}/stories`, {
          filter_query: {
            slug: {
              in: slug
            }
          }
        });
        
        if (existingStories.data.stories.length > 0) {
          console.log(`⚠️ Quiz with slug "${slug}" already exists, skipping...`);
          results.push({ success: false, reason: 'Already exists', slug });
          continue;
        }
      } catch (checkError) {
        console.log('Could not check for existing stories, proceeding...');
      }
      
      const storyblokQuiz = {
        name: quiz.title,
        slug: slug,
        content: {
          component: 'quiz',
          title: quiz.title,
          difficulty: quiz.difficulty,
          source_url: quiz.sourceUrl || '',
          source_title: quiz.sourceTitle || '',
          created_date: quiz.createdDate,
          questions: quiz.questions.map(q => ({
            component: 'question',
            question: q.question,
            options: q.options.join('\n'), // Convert array to newline-separated string
            correct_answer: q.correctAnswer,
            explanation: q.explanation
          }))
        }
      };

      console.log('📋 Storyblok quiz structure:', JSON.stringify(storyblokQuiz, null, 2));
      
      const response = await storyblok.post(`spaces/${process.env.STORYBLOK_SPACE_ID}/stories`, {
        story: storyblokQuiz,
        publish: 1
      });
      
      results.push({ 
        success: true, 
        id: response.data.story.id, 
        slug: slug,
        title: quiz.title 
      });
      
      console.log(`✅ Successfully created quiz in Storyblok (ID: ${response.data.story.id})`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error pushing quiz "${quiz.title}" to Storyblok:`, error.message);
      
      results.push({ 
        success: false, 
        error: error.message, 
        title: quiz.title 
      });
    }
  }
  
  return results;
}

// Test function
if (import.meta.url === `file://${process.argv[1]}`) {
  const sampleQuiz = {
    title: "Test Bitcoin Quiz",
    difficulty: "medium",
    sourceUrl: "https://example.com/test",
    sourceTitle: "Test Article",
    questions: [
      {
        question: "What is Bitcoin?",
        options: ["A) Bank", "B) Currency", "C) Company", "D) Website"],
        correctAnswer: "B",
        explanation: "Bitcoin is a digital currency."
      }
    ],
    createdDate: new Date().toISOString()
  };
  
  pushToStoryblok([sampleQuiz]).then(results => {
    console.log('📊 Push results:', results);
  });
}