export default {
  name: "BitcoinQuizFlow",
  description: "Auto-generate Bitcoin quizzes from kheai.com blog posts",
  schedule: "0 0 * * 0", // Every Sunday
  agents: [
    {
      name: "scrapeBlogPosts",
      description: "Scrape latest Bitcoin posts from kheai.com",
      inputs: [],
      outputs: ["blogPosts"]
    },
    {
      name: "generateQuiz",
      description: "Generate quiz questions using Gemini AI",
      inputs: ["blogPosts"],
      outputs: ["quizData"]
    },
    {
      name: "pushToStoryblok",
      description: "Create/update quiz entries in Storyblok",
      inputs: ["quizData"],
      outputs: ["storyblokResponse"]
    }
  ],
  workflow: [
    "scrapeBlogPosts",
    "generateQuiz", 
    "pushToStoryblok"
  ]
}