import StoryblokClient from 'storyblok-js-client';
import { Quiz, StoryblokQuiz } from '../types/quiz.js';

const storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_OAUTH_TOKEN!
});

export async function pushToStoryblok(quizzes: Quiz[]): Promise<any[]> {
  const results = [];
  
  for (const quiz of quizzes) {
    try {
      console.log(`📤 Pushing quiz to Storyblok: ${quiz.title}`);
      
      const storyblokQuiz: StoryblokQuiz = {
        name: quiz.title,
        slug: quiz.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content: {
          component: 'quiz',
          title: quiz.title,
          difficulty: quiz.difficulty,
          source_url: quiz.sourceUrl,
          questions: quiz.questions.map(q => ({
            component: 'question',
            question: q.question,
            options: q.options,
            correct_answer: q.correctAnswer,
            explanation: q.explanation
          }))
        }
      };
      
      const response = await storyblok.post(`spaces/${process.env.STORYBLOK_SPACE_ID}/stories`, {
        story: storyblokQuiz,
        publish: 1
      });
      
      results.push(response.data);
      console.log(`✅ Successfully created quiz in Storyblok`);
      
    } catch (error) {
      console.error(`❌ Error pushing quiz to Storyblok:`, error);
    }
  }
  
  return results;
}