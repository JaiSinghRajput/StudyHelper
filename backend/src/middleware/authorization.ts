import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export type RoleType = 'user' | 'admin' | 'premium';

export const authorize =
  (...allowedRoles: RoleType[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        logger.warn('Authorization failed: no user in request');
        res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated',
          statusCode: 401,
          timestamp: new Date(),
        });
        return;
      }

      if (!allowedRoles.includes(req.user.role as RoleType)) {
        logger.warn(
          `Authorization failed: user role ${req.user.role} not in allowed roles`,
          { userId: req.user.userId }
        );
        res.status(403).json({
          success: false,
          error: `Forbidden: This action requires one of the following roles: ${allowedRoles.join(', ')}`,
          statusCode: 403,
          timestamp: new Date(),
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Authorization middleware error', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        statusCode: 500,
        timestamp: new Date(),
      });
    }
  };

export const isAdmin = authorize('admin');
export const isPremium = authorize('premium', 'admin');
export const isUser = authorize('user', 'premium', 'admin');
