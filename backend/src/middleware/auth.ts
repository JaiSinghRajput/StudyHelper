import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../utils/jwt';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedRequest;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or malformed authorization header');
      res.status(401).json({
        success: false,
        error: 'Missing authorization header',
        statusCode: 401,
        timestamp: new Date(),
      });
      return;
    }

    const token = authHeader.substring(7);

    const decoded = jwtService.verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.error('Authentication failed', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      statusCode: 401,
      timestamp: new Date(),
    });
  }
};

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwtService.verifyAccessToken(token);

      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    logger.debug('Optional authentication token invalid, proceeding without auth');
    next();
  }
};
