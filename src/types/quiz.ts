export interface BlogPost {
  title: string;
  url: string;
  content: string;
  publishedDate: string;
  excerpt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sourceUrl: string;
  questions: QuizQuestion[];
  createdDate: string;
}

export interface StoryblokQuiz {
  name: string;
  slug: string;
  content: {
    component: 'quiz';
    title: string;
    difficulty: string;
    source_url: string;
    questions: Array<{
      component: 'question';
      question: string;
      options: string[];
      correct_answer: string;
      explanation: string;
    }>;
  };
}