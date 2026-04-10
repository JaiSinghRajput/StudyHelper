import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorization';
import { studyService } from '../services/study.service';
import { logger } from '../utils/logger';
import { StudyMaterialRequest } from '../types';

const router: Router = Router();

/**
 * POST /study/generate
 * Generate study material with streaming response
 * Requires: authentication
 */
router.post(
  '/generate',
  authMiddleware,
  async (req: Request<{}, {}, StudyMaterialRequest>, res: Response) => {
    try {
      const { question, includeResearch, includeDiagrams } = req.body;

      // Validation
      if (!question || question.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Question is required',
          statusCode: 400,
          timestamp: new Date(),
        });
        return;
      }

      if (question.length > 500) {
        res.status(400).json({
          success: false,
          error: 'Question must be less than 500 characters',
          statusCode: 400,
          timestamp: new Date(),
        });
        return;
      }

      logger.info(`Study material generation started for user: ${req.user?.userId}`, {
        question,
      });

      // Set headers for streaming response
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Generate and stream study material
      const stream = await studyService.generateStudyMaterial(
        {
          question,
          includeResearch: includeResearch !== false,
          includeDiagrams: includeDiagrams !== false,
        },
        req.user!.userId
      );

      // Pipe the stream to the response
      stream.pipe(res);

      // Handle stream errors
      stream.on('error', (error) => {
        logger.error('Stream error during study generation', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Stream error occurred',
            statusCode: 500,
            timestamp: new Date(),
          });
        }
      });
    } catch (error) {
      logger.error('Study generation error', error);
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: errorMessage,
          statusCode: 500,
          timestamp: new Date(),
        });
      }
    }
  }
);

/**
 * GET /study/list
 * List user's study materials
 * Requires: authentication
 */
router.get(
  '/list',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await studyService.listUserMaterials(req.user!.userId, page, limit);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error listing study materials', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to list materials';

      res.status(500).json({
        success: false,
        error: errorMessage,
        statusCode: 500,
        timestamp: new Date(),
      });
    }
  }
);

/**
 * GET /study/:id
 * Get study material by ID
 * Requires: authentication
 */
router.get(
  '/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Material id is required',
          statusCode: 400,
          timestamp: new Date(),
        });
        return;
      }

      const material = await studyService.getStudyMaterial(id, req.user!.userId);

      if (!material) {
        res.status(404).json({
          success: false,
          error: 'Study material not found',
          statusCode: 404,
          timestamp: new Date(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: material,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error retrieving study material', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve material';

      res.status(500).json({
        success: false,
        error: errorMessage,
        statusCode: 500,
        timestamp: new Date(),
      });
    }
  }
);

/**
 * DELETE /study/:id
 * Delete study material by ID
 * Requires: authentication and ownership
 */
router.delete(
  '/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Material id is required',
          statusCode: 400,
          timestamp: new Date(),
        });
        return;
      }

      const deleted = await studyService.deleteStudyMaterial(id, req.user!.userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Study material not found',
          statusCode: 404,
          timestamp: new Date(),
        });
        return;
      }

      logger.info(`Study material deleted: ${id}`, { userId: req.user?.userId });

      res.status(200).json({
        success: true,
        data: { message: 'Study material deleted successfully' },
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error deleting study material', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete material';

      res.status(500).json({
        success: false,
        error: errorMessage,
        statusCode: 500,
        timestamp: new Date(),
      });
    }
  }
);

/**
 * GET /study/stats
 * Get user's study statistics (requires premium)
 * Requires: authentication and premium role
 */
router.get(
  '/stats/user',
  authMiddleware,
  authorize('premium', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const result = await studyService.listUserMaterials(req.user!.userId, 1, 1000);

      const stats = {
        totalMaterials: result.pagination.total,
        averageLength: 0,
        mostRecent: result.data[0] || null,
      };

      if (result.data.length > 0) {
        const totalLength = result.data.reduce(
          (sum, m) => sum + m.content.length,
          0
        );
        stats.averageLength = Math.round(totalLength / result.data.length);
      }

      res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error retrieving user stats', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve stats';

      res.status(500).json({
        success: false,
        error: errorMessage,
        statusCode: 500,
        timestamp: new Date(),
      });
    }
  }
);

export default router;
