import axios, { AxiosError } from 'axios';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';
import { StudyMaterialRequest, StreamChunk, StudyMaterialResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

// In-memory storage for study materials (replace with DB in production)
const studyMaterials: Map<string, StudyMaterialResponse> = new Map();

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

    return new Readable({
      async read() {
        try {
          // Send request to Python engine
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

          // Stream the response back to client
          response.data.on('data', (chunk: Buffer) => {
            try {
              const data = JSON.parse(chunk.toString('utf-8'));

              const streamChunk: StreamChunk = {
                type: data.type || 'generating',
                data: data.data || data,
                progress: data.progress,
                timestamp: new Date(),
              };

              this.push(JSON.stringify(streamChunk) + '\n');
            } catch (parseError) {
              logger.debug('Could not parse chunk as JSON, treating as text', {
                chunk: chunk.toString('utf-8').substring(0, 100),
              });
              // Send raw text as a generating chunk
              const streamChunk: StreamChunk = {
                type: 'generating',
                data: chunk.toString('utf-8'),
                timestamp: new Date(),
              };
              this.push(JSON.stringify(streamChunk) + '\n');
            }
          });

          response.data.on('end', () => {
            logger.info(`Study material generation completed: ${materialId}`);

            const completeChunk: StreamChunk = {
              type: 'complete',
              data: {
                id: materialId,
                message: 'Study material generation completed',
              },
              timestamp: new Date(),
            };

            this.push(JSON.stringify(completeChunk) + '\n');
            this.push(null); // End stream
          });

          response.data.on('error', (error: any) => {
            logger.error(`Stream error in material generation: ${materialId}`, error);

            const errorChunk: StreamChunk = {
              type: 'error',
              data: {
                id: materialId,
                error: error.message || 'Stream error occurred',
              },
              timestamp: new Date(),
            };

            this.push(JSON.stringify(errorChunk) + '\n');
            this.push(null);
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

          this.push(JSON.stringify(errorChunk) + '\n');
          this.push(null);
        }
      },
    });
  }

  /**
   * Get study material by ID
   */
  async getStudyMaterial(materialId: string): Promise<StudyMaterialResponse | null> {
    try {
      const material = studyMaterials.get(materialId);

      if (!material) {
        logger.warn(`Study material not found: ${materialId}`);
        return null;
      }

      return material;
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
    content: string,
    summary: string,
    request: StudyMaterialRequest
  ): Promise<StudyMaterialResponse> {
    try {
      const material: StudyMaterialResponse = {
        id: materialId,
        question: request.question,
        content,
        summary,
        diagrams: [],
        createdAt: new Date(),
        processedAt: new Date(),
      };

      studyMaterials.set(materialId, material);

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
      const allMaterials = Array.from(studyMaterials.values());

      const total = allMaterials.length;
      const pages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const end = start + limit;

      const data = allMaterials.slice(start, end);

      return {
        data,
        pagination: {
          page,
          limit,
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
  async deleteStudyMaterial(materialId: string): Promise<boolean> {
    try {
      const deleted = studyMaterials.delete(materialId);

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
