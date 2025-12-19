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

export default router;
