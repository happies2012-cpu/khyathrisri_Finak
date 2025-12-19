import OpenAI from 'openai';
import { logger } from '../../utils/logger';

export class OpenAIService {
    private client: OpenAI | null = null;

    constructor() {
        if (process.env.OPENAI_API_KEY) {
            this.client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
        } else {
            logger.warn('OPENAI_API_KEY not found in environment variables');
        }
    }

    async generateText(prompt: string, model: string = 'gpt-4-turbo-preview') {
        if (!this.client) {
            throw new Error('OpenAI client not initialized');
        }

        try {
            const response = await this.client.chat.completions.create({
                model,
                messages: [{ role: 'user', content: prompt }],
            });
            return response.choices[0].message.content;
        } catch (error) {
            logger.error('OpenAI generateText error:', error);
            throw error;
        }
    }

    async generateJSON(prompt: string, model: string = 'gpt-4-turbo-preview') {
        if (!this.client) {
            throw new Error('OpenAI client not initialized');
        }

        try {
            const response = await this.client.chat.completions.create({
                model,
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
            });
            return JSON.parse(response.choices[0].message.content || '{}');
        } catch (error) {
            logger.error('OpenAI generateJSON error:', error);
            throw error;
        }
    }

    async generateEmbedding(text: string) {
        if (!this.client) {
            throw new Error('OpenAI client not initialized');
        }

        try {
            const response = await this.client.embeddings.create({
                model: "text-embedding-3-small",
                input: text,
            });
            return response.data[0].embedding;
        } catch (error) {
            logger.error('OpenAI generateEmbedding error:', error);
            throw error;
        }
    }
}

export const openAIService = new OpenAIService();
