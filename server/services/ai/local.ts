import axios from 'axios';
import { logger } from '../../utils/logger';

export class LocalLLMService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.LOCAL_LLM_URL || 'http://localhost:11434';
    }

    async generateText(prompt: string, model: string = 'llama3') {
        try {
            // Assuming Ollama format, but can be adapted
            const response = await axios.post(`${this.baseUrl}/api/generate`, {
                model,
                prompt,
                stream: false,
            });
            return response.data.response;
        } catch (error) {
            logger.error('Local LLM generateText error:', error);
            throw error;
        }
    }

    async chat(messages: any[], model: string = 'llama3') {
        try {
            const response = await axios.post(`${this.baseUrl}/api/chat`, {
                model,
                messages,
                stream: false,
            });
            return response.data.message;
        } catch (error) {
            logger.error('Local LLM chat error:', error);
            throw error;
        }
    }
}

export const localLLMService = new LocalLLMService();
