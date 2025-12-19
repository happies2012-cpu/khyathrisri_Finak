import { prisma } from '../../utils/prisma';
import { embeddingService } from './embedding';
import { logger } from '../../utils/logger';
import similarity from 'compute-cosine-similarity';

export class KnowledgeBaseService {
    async addDocument(content: string, title?: string, userId?: string, tags: string[] = []) {
        try {
            // 1. Generate embedding
            // Chunking usually happens here for large docs, but for simplicity we assume content is a "chunk" or "snippet"
            const embedding = await embeddingService.generateEmbedding(content);

            // 2. Store in DB
            const doc = await prisma.knowledgeDocument.create({
                data: {
                    content,
                    title,
                    userId,
                    tags,
                    embedding: embedding as any // Store as JSON
                }
            });

            return doc;
        } catch (error) {
            logger.error('Error adding knowledge document:', error);
            throw error;
        }
    }

    async search(query: string, limit: number = 5, userId?: string) {
        try {
            // 1. Generate embedding for query
            const queryEmbedding = await embeddingService.generateEmbedding(query);

            // 2. Fetch relevant docs
            // Optimization: Fetch only docs that might match (by tag?) or all if small.
            // For proper scale, use pgvector. Here we fetch all and rank in memory (ok for < 1000 docs).
            const where: any = {};
            if (userId) {
                where.OR = [{ userId }, { userId: null }]; // specific user + global docs
            } else {
                where.userId = null; // only global docs if no user provided
            }

            const docs = await prisma.knowledgeDocument.findMany({
                where,
                select: { id: true, content: true, title: true, embedding: true }
            });

            // 3. Compute Similarity
            const scoredDocs = docs.map(doc => {
                if (!doc.embedding || !Array.isArray(doc.embedding)) return { ...doc, score: 0 };

                const s = similarity(queryEmbedding, doc.embedding as unknown as number[]);
                return { ...doc, score: s || 0 };
            });

            // 4. Sort and return top K
            return scoredDocs
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

        } catch (error) {
            logger.error('Error searching knowledge base:', error);
            throw error;
        }
    }
}

export const knowledgeBaseService = new KnowledgeBaseService();
