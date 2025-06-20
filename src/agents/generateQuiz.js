import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateQuiz(blogPosts) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const quizzes = [];
  
  for (const post of blogPosts) {
    try {
      console.log(`🧠 Generating quiz for: ${post.title}`);
      
      const prompt = `
You are a Bitcoin education expert. Create a quiz based on this blog post:

Title: ${post.title}
Content: ${post.content.substring(0, 1500)}

Generate exactly 4 multiple choice questions that test understanding of the key concepts from this content.

Requirements:
- Questions should be clear and specific to the content
- Each question should have 4 options (A, B, C, D)
- Only one correct answer per question
- Include a brief explanation for why the correct answer is right
- Focus on Bitcoin concepts, technology, or practical knowledge

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "What is the main purpose of Bitcoin's blockchain?",
      "options": [
        "A) To store personal information",
        "B) To record and verify transactions",
        "C) To mine new cryptocurrencies", 
        "D) To replace traditional banks"
      ],
      "correctAnswer": "B",
      "explanation": "The blockchain serves as a public ledger that records and verifies all Bitcoin transactions in a decentralized manner."
    }
  ]
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('🔍 Raw AI response preview:', text.substring(0, 200) + '...');
      
      // Extract JSON from response
      let jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Try to find JSON between code blocks
        jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonMatch[0] = jsonMatch[1];
        }
      }

      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      let quizData;
      try {
        // Clean up the JSON before parsing
        let jsonString = jsonMatch[0];
        
        // Remove trailing commas before closing brackets/braces
        jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
        
        // Remove any extra commas in arrays
        jsonString = jsonString.replace(/,(\s*,)/g, ',');
        
        console.log('🧹 Cleaned JSON:', jsonString.substring(0, 200) + '...');
        
        quizData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Attempted to parse:', jsonMatch[0]);
        throw new Error('Invalid JSON format from AI');
      }
      
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Invalid quiz structure - missing questions array');
      }
      
      // Validate each question
      const validQuestions = quizData.questions.filter(q => {
        return q.question && 
               Array.isArray(q.options) && 
               q.options.length === 4 &&
               q.correctAnswer && 
               q.explanation;
      });
      
      if (validQuestions.length === 0) {
        throw new Error('No valid questions generated');
      }
      
      const quiz = {
        title: `Bitcoin Quiz: ${post.title}`,
        difficulty: 'medium',
        sourceUrl: post.url,
        questions: validQuestions,
        createdDate: new Date().toISOString(),
        sourceTitle: post.title
      };
      
      quizzes.push(quiz);
      console.log(`✅ Generated quiz with ${validQuestions.length} questions`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Error generating quiz for "${post.title}":`, error.message);
      
      // Create fallback quiz for testing
      const fallbackQuiz = {
        title: `Bitcoin Quiz: ${post.title}`,
        difficulty: 'medium',
        sourceUrl: post.url,
        questions: [
          {
            question: "What is Bitcoin?",
            options: [
              "A) A traditional bank",
              "B) A decentralized digital currency",
              "C) A government institution",
              "D) A physical coin"
            ],
            correctAnswer: "B",
            explanation: "Bitcoin is a decentralized digital currency that operates without a central authority."
          },
          {
            question: "Who created Bitcoin?",
            options: [
              "A) Elon Musk",
              "B) Bill Gates",
              "C) Satoshi Nakamoto",
              "D) Mark Zuckerberg"
            ],
            correctAnswer: "C",
            explanation: "Bitcoin was created by the pseudonymous person or group known as Satoshi Nakamoto."
          },
          {
            question: "What technology underlies Bitcoin?",
            options: [
              "A) Artificial Intelligence",
              "B) Blockchain",
              "C) Cloud Computing",
              "D) Social Media"
            ],
            correctAnswer: "B",
            explanation: "Bitcoin operates on blockchain technology, which is a distributed ledger system."
          },
          {
            question: "What is the maximum supply of Bitcoin?",
            options: [
              "A) Unlimited",
              "B) 100 million",
              "C) 21 million",
              "D) 1 billion"
            ],
            correctAnswer: "C",
            explanation: "Bitcoin has a fixed maximum supply of 21 million coins, making it deflationary."
          }
        ],
        createdDate: new Date().toISOString(),
        sourceTitle: post.title
      };
      
      quizzes.push(fallbackQuiz);
      console.log(`🔄 Created fallback quiz for "${post.title}"`);
    }
  }
  
  return quizzes;
}

// Test function
if (import.meta.url === `file://${process.argv[1]}`) {
  const samplePost = {
    title: "Understanding Bitcoin Basics",
    content: "Bitcoin is a decentralized digital currency that was created in 2009 by an unknown person using the alias Satoshi Nakamoto. Transactions are made with no middle men – meaning, no banks! Bitcoin can be used to book hotels on Expedia, shop for furniture on Overstock and buy Xbox games. But much of the hype is about getting rich by trading it. The price of bitcoin skyrocketed into the thousands in 2017."
  };
  
  generateQuiz([samplePost]).then(quizzes => {
    console.log('📊 Generated quizzes:', JSON.stringify(quizzes, null, 2));
  });
}