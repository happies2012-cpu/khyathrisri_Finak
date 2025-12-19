import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { openAIService } from '../services/ai/openai';
import { geminiService } from '../services/ai/gemini';
import { localLLMService } from '../services/ai/local';
import { logger } from '../utils/logger';

const router = Router();

const handleValidationErrors = (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new CustomError('Validation failed', 400));
    }
    next();
};

// OpenAI Chat
router.post('/openai/chat', authenticate, [
    body('prompt').notEmpty().isString(),
    body('model').optional().isString(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
    const { prompt, model } = req.body;
    try {
        const result = await openAIService.generateText(prompt, model);

        // Log usage
        logger.info('OpenAI usage', { userId: req.user!.id, model });

        res.json({ success: true, data: result });
    } catch (error: any) {
        throw new CustomError(error.message || 'OpenAI Error', 500);
    }
}));

// Gemini Chat
router.post('/gemini/chat', authenticate, [
    body('prompt').notEmpty().isString(),
    body('model').optional().isString(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
    const { prompt, model } = req.body;
    try {
        const result = await geminiService.generateText(prompt, model);

        // Log usage
        logger.info('Gemini usage', { userId: req.user!.id, model });

        res.json({ success: true, data: result });
    } catch (error: any) {
        throw new CustomError(error.message || 'Gemini Error', 500);
    }
}));

// Local LLM Chat
router.post('/local/chat', authenticate, [
    body('prompt').optional().isString(),
    body('messages').optional().isArray(),
    body('model').optional().isString(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
    const { prompt, messages, model } = req.body;
    try {
        let result;
        if (messages) {
            result = await localLLMService.chat(messages, model);
        } else {
            result = await localLLMService.generateText(prompt, model);
        }

        // Log usage
        logger.info('Local LLM usage', { userId: req.user!.id, model });

        res.json({ success: true, data: result });
    } catch (error: any) {
        throw new CustomError(error.message || 'Local LLM Error', 500);
    }
}));

// Knowledge Base (RAG) - Train/Add
router.post('/knowledge/add', authenticate, [
    body('content').notEmpty().isString(),
    body('title').optional().isString(),
    body('tags').optional().isArray(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
    const { content, title, tags } = req.body;
    // If user is admin, allow adding global knowledge (userId: null) if specified? 
    // For now, let's just associate with user for personalization or standard user uploads.
    try {
        // Import lazily or at top. I'll need to add import.
        const doc = await import('../services/ai/knowledgeBase').then(m => m.knowledgeBaseService.addDocument(content, title, req.user!.id, tags));
        logger.info('Knowledge document added', { userId: req.user!.id, docId: doc.id });
        res.json({ success: true, data: doc });
    } catch (error: any) {
        throw new CustomError(error.message || 'Error adding document', 500);
    }
}));

// Knowledge Base (RAG) - Search/Query
router.post('/knowledge/search', authenticate, [
    body('query').notEmpty().isString(),
    body('limit').optional().isInt(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
    const { query, limit } = req.body;
    try {
        const results = await import('../services/ai/knowledgeBase').then(m => m.knowledgeBaseService.search(query, limit || 5, req.user!.id));
        logger.info('Knowledge base searched', { userId: req.user!.id, query });
        res.json({ success: true, data: results });
    } catch (error: any) {
        throw new CustomError(error.message || 'Error searching knowledge base', 500);
    }
}));

export default router;
