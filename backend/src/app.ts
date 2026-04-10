import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { environment } from './config/environment';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import studyRoutes from './routes/study.routes';

export const createApp = (): Express => {
  const app = express();

  // Middleware: Trust proxy
  app.set('trust proxy', 1);

  // Middleware: CORS
  app.use(
    cors({
      origin: environment.cors.origin,
      credentials: environment.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Middleware: Body parser
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Middleware: Request logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  // Routes: Health check
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime(),
      },
      timestamp: new Date(),
    });
  });

  // Routes: API info
  app.get('/api', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        name: 'Study Material Generator API',
        version: '1.0.0',
        description: 'Secure API with authentication, authorization, and streaming responses',
        endpoints: {
          auth: '/api/auth',
          study: '/api/study',
        },
      },
      timestamp: new Date(),
    });
  });

  // Routes: Authentication
  app.use('/api/auth', authRoutes);

  // Routes: Study Materials
  app.use('/api/study', studyRoutes);

  // Middleware: 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      statusCode: 404,
      path: req.path,
      timestamp: new Date(),
    });
  });

  // Middleware: Error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error', err);

    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error',
      statusCode: err.status || 500,
      timestamp: new Date(),
    });
  });

  return app;
};
