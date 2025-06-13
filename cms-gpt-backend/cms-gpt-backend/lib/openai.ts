import { OpenAI } from 'openai';
import { SEOResponse } from '../types/page';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GenerateInput {
  title: string;
  content: string;
  category?: string;
}

export async function generateSEOMetadata({
  title,
  content,
  category,
}: GenerateInput): Promise<SEOResponse | null> {
  // Construct the prompt string with dynamic input
  console.log(title,content,category,"=======<>")
  const prompt = `Generate SEO metadata for a page with title "${title}", content "${content}"${
    category ? `, and category "${category}"` : ''
  }. Return meta_title, meta_description and 3 keywords in JSON format.`;

  try {
    // Make the API request to OpenAI
    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    
    // Ensure content exists and is a string before parsing
    const contentStr = res.choices?.[0]?.message?.content;
    console.log(res.choices?.[0]?.message)

    if (!contentStr || typeof contentStr !== 'string') {
      console.error('Invalid or empty OpenAI content:', contentStr);
      return null;
    }

    // Safely parse JSON
    try {
      const parsed: SEOResponse = JSON.parse(contentStr.trim());
      return parsed;
    } catch (jsonError) {
      console.error('Error parsing OpenAI response:', jsonError);
      console.error('Raw response content:', contentStr);
      return null;
    }
  } catch (err) {
    console.error('OpenAI API error:', err);
    return null;
  }
}
