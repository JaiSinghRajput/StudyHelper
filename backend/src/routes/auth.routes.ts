import { Router, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { logger } from '../utils/logger';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Username, email, and password are required',
        statusCode: 400,
        timestamp: new Date(),
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        error: 'Passwords do not match',
        statusCode: 400,
        timestamp: new Date(),
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
        statusCode: 400,
        timestamp: new Date(),
      });
      return;
    }

    const user = await authService.register(username, email, password);

    logger.info(`User registered successfully: ${email}`);

    res.status(201).json({
      success: true,
      data: user,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Registration error', error);
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';

    res.status(400).json({
      success: false,
      error: errorMessage,
      statusCode: 400,
      timestamp: new Date(),
    });
  }
});

/**
 * POST /auth/login
 * Login user and return tokens
 */
router.post('/login', async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
        statusCode: 400,
        timestamp: new Date(),
      });
      return;
    }

    const tokenResponse = await authService.login(email, password);

    logger.info(`User login successful: ${email}`);

    res.status(200).json({
      success: true,
      data: tokenResponse,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Login error', error);
    const errorMessage = error instanceof Error ? error.message : 'Login failed';

    res.status(401).json({
      success: false,
      error: errorMessage,
      statusCode: 401,
      timestamp: new Date(),
    });
  }
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  async (req: Request<{}, {}, RefreshTokenRequest>, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token is required',
          statusCode: 400,
          timestamp: new Date(),
        });
        return;
      }

      const tokenResponse = await authService.refreshAccessToken(refreshToken);

      logger.info('Access token refreshed successfully');

      res.status(200).json({
        success: true,
        data: tokenResponse,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Token refresh error', error);
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';

      res.status(401).json({
        success: false,
        error: errorMessage,
        statusCode: 401,
        timestamp: new Date(),
      });
    }
  }
);

/**
 * POST /auth/validate
 * Validate current access token (requires auth)
 */
router.post('/validate', authMiddleware, (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
        statusCode: 401,
        timestamp: new Date(),
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        userId: req.user.userId,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Token validation error', error);

    res.status(500).json({
      success: false,
      error: 'Token validation failed',
      statusCode: 500,
      timestamp: new Date(),
    });
  }
});

export default router;
