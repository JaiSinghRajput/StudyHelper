import axios, { AxiosError } from 'axios';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';
import { StudyMaterialRequest, StreamChunk, StudyMaterialResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import { getDb } from '../config/database';

type StudyMaterialRow = {
  id: string;
  user_id: string;
  question: string;
  content: string;
  summary: string;
  diagrams: string | null;
  created_at: string;
  processed_at: string;
};

function toStudyMaterial(row: StudyMaterialRow): StudyMaterialResponse {
  return {
    id: row.id,
    question: row.question,
    content: row.content,
    summary: row.summary,
    diagrams: row.diagrams ? JSON.parse(row.diagrams) : [],
    createdAt: new Date(row.created_at),
    processedAt: new Date(row.processed_at),
  };
}

export class StudyService {
  /**
   * Generate study material with streaming response
   * Streams chunks back to client as they're received from the Python engine
   */
  async generateStudyMaterial(
    request: StudyMaterialRequest,
    userId: string
  ): Promise<Readable> {
    const materialId = uuidv4();

    logger.info(`Starting study material generation: ${materialId}`, {
      userId,
      question: request.question,
    });

    const output = new Readable({ read() {} });

    setImmediate(async () => {
      try {
        const pythonEngineUrl = `${environment.pythonEngine.url}/generate`;
        logger.debug(`Calling Python engine at: ${pythonEngineUrl}`);

        const response = await axios.get(pythonEngineUrl, {
          params: {
            question: request.question,
            include_research: request.includeResearch !== false,
            include_diagrams: request.includeDiagrams !== false,
          },
          timeout: environment.pythonEngine.timeout,
          responseType: 'stream',
        });

        let buffer = '';
        let generatedText = '';

        response.data.on('data', (chunk: Buffer) => {
          buffer += chunk.toString('utf-8');
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) {
              continue;
            }

            try {
              const data = JSON.parse(line) as {
                type?: StreamChunk['type'];
                data?: unknown;
                progress?: number;
              };

              if (
                data.type === 'generating' &&
                data.data &&
                typeof data.data === 'object' &&
                'content' in (data.data as Record<string, unknown>)
              ) {
                const content = (data.data as { content?: unknown }).content;
                if (typeof content === 'string') {
                  generatedText += content;
                }
              }

              const streamChunk: StreamChunk = {
                type: data.type || 'generating',
                data: data.data ?? data,
                progress: data.progress,
                timestamp: new Date(),
              };
              output.push(JSON.stringify(streamChunk) + '\n');
            } catch {
              generatedText += line + '\n';
              const streamChunk: StreamChunk = {
                type: 'generating',
                data: line,
                timestamp: new Date(),
              };
              output.push(JSON.stringify(streamChunk) + '\n');
            }
          }
        });

        response.data.on('end', async () => {
          try {
            if (buffer.trim()) {
              generatedText += buffer;
            }

            const summary = generatedText
              ? generatedText.slice(0, 280)
              : `Study material for: ${request.question}`;

            await this.saveStudyMaterial(materialId, userId, generatedText || request.question, summary, request);

            logger.info(`Study material generation completed: ${materialId}`);
            const completeChunk: StreamChunk = {
              type: 'complete',
              data: {
                id: materialId,
                message: 'Study material generation completed',
              },
              timestamp: new Date(),
            };

            output.push(JSON.stringify(completeChunk) + '\n');
            output.push(null);
          } catch (error) {
            logger.error(`Error finalizing material generation: ${materialId}`, error);
            const errorChunk: StreamChunk = {
              type: 'error',
              data: {
                id: materialId,
                error: 'Failed to persist generated material',
              },
              timestamp: new Date(),
            };
            output.push(JSON.stringify(errorChunk) + '\n');
            output.push(null);
          }
        });

        response.data.on('error', (error: Error) => {
          logger.error(`Stream error in material generation: ${materialId}`, error);
          const errorChunk: StreamChunk = {
            type: 'error',
            data: {
              id: materialId,
              error: error.message || 'Stream error occurred',
            },
            timestamp: new Date(),
          };

          output.push(JSON.stringify(errorChunk) + '\n');
          output.push(null);
        });
      } catch (error) {
        logger.error(`Error in study material generation: ${materialId}`, error);
        const errorMessage = error instanceof AxiosError ? error.message : 'Unknown error';
        const errorChunk: StreamChunk = {
          type: 'error',
          data: {
            id: materialId,
            error: errorMessage,
          },
          timestamp: new Date(),
        };

        output.push(JSON.stringify(errorChunk) + '\n');
        output.push(null);
      }
    });

    return output;
  }

  /**
   * Get study material by ID
   */
  async getStudyMaterial(materialId: string, userId: string): Promise<StudyMaterialResponse | null> {
    try {
      const db = await getDb();
      const row = await db.get<StudyMaterialRow>(
        'SELECT * FROM study_materials WHERE id = ? AND user_id = ?',
        materialId,
        userId
      );

      if (!row) {
        logger.warn(`Study material not found: ${materialId}`);
        return null;
      }

      return toStudyMaterial(row);
    } catch (error) {
      logger.error('Error retrieving study material', error);
      throw error;
    }
  }

  /**
   * Save study material (called after generation completes)
   */
  async saveStudyMaterial(
    materialId: string,
    userId: string,
    content: string,
    summary: string,
    request: StudyMaterialRequest
  ): Promise<StudyMaterialResponse> {
    try {
      const db = await getDb();
      const material: StudyMaterialResponse = {
        id: materialId,
        question: request.question,
        content,
        summary,
        diagrams: [],
        createdAt: new Date(),
        processedAt: new Date(),
      };

      await db.run(
        `INSERT INTO study_materials (id, user_id, question, content, summary, diagrams, created_at, processed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        material.id,
        userId,
        material.question,
        material.content,
        material.summary,
        JSON.stringify(material.diagrams || []),
        material.createdAt.toISOString(),
        material.processedAt.toISOString()
      );

      logger.info(`Study material saved: ${materialId}`);

      return material;
    } catch (error) {
      logger.error('Error saving study material', error);
      throw error;
    }
  }

  /**
   * List user's study materials
   */
  async listUserMaterials(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: StudyMaterialResponse[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    try {
      const db = await getDb();
      const safePage = Math.max(page, 1);
      const safeLimit = Math.max(limit, 1);
      const offset = (safePage - 1) * safeLimit;

      const countRow = await db.get<{ total: number }>(
        'SELECT COUNT(*) as total FROM study_materials WHERE user_id = ?',
        userId
      );
      const total = countRow?.total || 0;

      const rows = await db.all<StudyMaterialRow[]>(
        `SELECT * FROM study_materials
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        userId,
        safeLimit,
        offset
      );

      const data = rows.map(toStudyMaterial);
      const pages = Math.ceil(total / safeLimit);

      return {
        data,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          pages,
        },
      };
    } catch (error) {
      logger.error('Error listing study materials', error);
      throw error;
    }
  }

  /**
   * Delete study material by ID
   */
  async deleteStudyMaterial(materialId: string, userId: string): Promise<boolean> {
    try {
      const db = await getDb();
      const result = await db.run(
        'DELETE FROM study_materials WHERE id = ? AND user_id = ?',
        materialId,
        userId
      );
      const deleted = (result.changes || 0) > 0;

      if (deleted) {
        logger.info(`Study material deleted: ${materialId}`);
      }

      return deleted;
    } catch (error) {
      logger.error('Error deleting study material', error);
      throw error;
    }
  }
}

export const studyService = new StudyService();
