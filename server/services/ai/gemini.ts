import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../../utils/logger';

export class GeminiService {
    private client: GoogleGenerativeAI | null = null;

    constructor() {
        if (process.env.GEMINI_API_KEY) {
            this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        } else {
            logger.warn('GEMINI_API_KEY not found in environment variables');
        }
    }

    async generateText(prompt: string, modelName: string = 'gemini-pro') {
        if (!this.client) {
            throw new Error('Gemini client not initialized');
        }

        try {
            const model = this.client.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            logger.error('Gemini generateText error:', error);
            throw error;
        }
    }
}

export const geminiService = new GeminiService();
