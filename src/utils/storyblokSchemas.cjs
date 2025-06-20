const StoryblokClient = require('storyblok-js-client');
require('dotenv').config();

const sb = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_OAUTH_TOKEN
});

async function createComponents() {
  console.log('🔧 Creating Storyblok components...');
  
  // Delete existing components first (optional)
  try {
    const components = await sb.get(`spaces/${process.env.STORYBLOK_SPACE_ID}/components`);
    for (const comp of components.data.components) {
      if (comp.name === 'question' || comp.name === 'quiz') {
        console.log(`🗑️ Deleting existing component: ${comp.name}`);
        await sb.delete(`spaces/${process.env.STORYBLOK_SPACE_ID}/components/${comp.id}`);
      }
    }
  } catch (error) {
    console.log('ℹ️ No existing components to delete');
  }
  
  // Create question component
  try {
    const questionComponent = await sb.post(`spaces/${process.env.STORYBLOK_SPACE_ID}/components`, {
      component: {
        name: 'question',
        display_name: 'Question',
        schema: {
          question: {
            type: 'text'
          },
          options: {
            type: 'textarea'
          },
          correct_answer: {
            type: 'text'
          },
          explanation: {
            type: 'textarea'
          }
        },
        is_root: false,
        is_nestable: true
      }
    });
    console.log('✅ Created question component');
  } catch (error) {
    console.error('❌ Failed to create question component:', error.response?.data || error.message);
  }
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Create quiz component
  try {
    const quizComponent = await sb.post(`spaces/${process.env.STORYBLOK_SPACE_ID}/components`, {
      component: {
        name: 'quiz',
        display_name: 'Quiz',
        schema: {
          title: {
            type: 'text'
          },
          difficulty: {
            type: 'text'
          },
          source_url: {
            type: 'text'
          },
          source_title: {
            type: 'text'
          },
          created_date: {
            type: 'text'
          },
          questions: {
            type: 'bloks',
            restrict_components: true,
            component_whitelist: ['question']
          }
        },
        is_root: true,
        is_nestable: false
      }
    });
    console.log('✅ Created quiz component');
  } catch (error) {
    console.error('❌ Failed to create quiz component:', error.response?.data || error.message);
  }
}

createComponents().catch(console.error);