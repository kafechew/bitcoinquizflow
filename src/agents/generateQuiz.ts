import { GoogleGenerativeAI } from '@google/generative-ai';
import { BlogPost, Quiz, QuizQuestion } from '../types/quiz.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateQuiz(blogPosts: BlogPost[]): Promise<Quiz[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const quizzes: Quiz[] = [];
  
  for (const post of blogPosts) {
    try {
      console.log(`🧠 Generating quiz for: ${post.title}`);
      
      const prompt = `
Create a Bitcoin quiz based on this blog post:

Title: ${post.title}
Content: ${post.content.substring(0, 2000)}...

Generate exactly 4 multiple choice questions with:
- Clear, specific questions about the content
- 4 answer options (A, B, C, D)
- One correct answer
- Brief explanation for the correct answer

Format as JSON:
{
  "questions": [
    {
      "question": "What is...",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A",
      "explanation": "Brief explanation..."
    }
  ]
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const quizData = JSON.parse(jsonMatch[0]);
      
      const quiz: Quiz = {
        title: `Bitcoin Quiz: ${post.title}`,
        difficulty: 'medium',
        sourceUrl: post.url,
        questions: quizData.questions,
        createdDate: new Date().toISOString()
      };
      
      quizzes.push(quiz);
      console.log(`✅ Generated quiz with ${quiz.questions.length} questions`);
      
    } catch (error) {
      console.error(`❌ Error generating quiz for ${post.title}:`, error);
    }
  }
  
  return quizzes;
}