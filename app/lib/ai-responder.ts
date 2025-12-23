import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function generateAIResponse(context: string, tone: 'professional' | 'casual' | 'sales' = 'casual') {
    if (!process.env.GOOGLE_AI_API_KEY) {
        console.warn('GOOGLE_AI_API_KEY is not set. Returning fallback.');
        return "Thanks for the info! (AI Key missing)";
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        let prompt = `You are a helpful Facebook group member. Write a short, engaging comment in response to the following post content.
    
    Context/Post Content: "${context}"
    
    Tone: ${tone}
    Language: Spanish (Mexico)
    Length: Under 280 characters.
    Restrictions: No hashtags, no emojis overkill, look organic.`;

        if (tone === 'sales') {
            prompt += ' Include a subtle call to action.';
        }

        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Error generating AI response:', error);
        return "Interesante contenido! Gracias por compartir."; // Fallback
    }
}
