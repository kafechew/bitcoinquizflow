import axios from 'axios';
import * as cheerio from 'cheerio';
import { BlogPost } from '../types/quiz.js';

export async function scrapeBlogPosts(): Promise<BlogPost[]> {
  try {
    console.log('🔍 Scraping Bitcoin posts from kheai.com...');
    
    const response = await axios.get('https://kheai.com/tags/bitcoin');
    const $ = cheerio.load(response.data);
    
    const posts: BlogPost[] = [];
    
    // Adjust selectors based on actual kheai.com structure
    $('.post-item').each((index, element) => {
      const title = $(element).find('.post-title').text().trim();
      const url = $(element).find('.post-link').attr('href');
      const excerpt = $(element).find('.post-excerpt').text().trim();
      const publishedDate = $(element).find('.post-date').text().trim();
      
      if (title && url) {
        posts.push({
          title,
          url: url.startsWith('http') ? url : `https://kheai.com${url}`,
          content: '', // Will be filled by scraping individual posts
          publishedDate,
          excerpt
        });
      }
    });
    
    // Scrape full content for each post
    for (const post of posts.slice(0, 3)) { // Limit to 3 posts for testing
      try {
        const postResponse = await axios.get(post.url);
        const post$ = cheerio.load(postResponse.data);
        post.content = post$('.post-content').text().trim();
      } catch (error) {
        console.warn(`Failed to scrape content for ${post.url}`);
      }
    }
    
    console.log(`✅ Found ${posts.length} Bitcoin posts`);
    return posts;
    
  } catch (error) {
    console.error('❌ Error scraping blog posts:', error);
    throw error;
  }
}