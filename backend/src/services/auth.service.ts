import { cryptoService } from '../utils/crypto';
import { jwtService } from '../utils/jwt';
import { logger } from '../utils/logger';
import { User, AuthPayload, TokenResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

// In-memory user database (replace with real DB in production)
const users: Map<string, User> = new Map();
const emailIndex: Map<string, string> = new Map();

// Demo users
const initializeDemoUsers = async () => {
  const demoUsers = [
    {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin' as const,
    },
    {
      username: 'user',
      email: 'user@example.com',
      password: 'user123',
      role: 'user' as const,
    },
    {
      username: 'premium',
      email: 'premium@example.com',
      password: 'premium123',
      role: 'premium' as const,
    },
  ];

  for (const demoUser of demoUsers) {
    const id = uuidv4();
    const hashedPassword = await cryptoService.hashPassword(demoUser.password);

    const user: User = {
      id,
      username: demoUser.username,
      email: demoUser.email,
      password: hashedPassword,
      role: demoUser.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.set(id, user);
    emailIndex.set(demoUser.email, id);
  }

  logger.info('Demo users initialized');
};

// Initialize on module load
initializeDemoUsers().catch((error) => {
  logger.error('Failed to initialize demo users', error);
});

export class AuthService {
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<Omit<User, 'password'>> {
    try {
      // Check if user already exists
      if (emailIndex.has(email)) {
        throw new Error('Email already registered');
      }

      const userId = uuidv4();
      const hashedPassword = await cryptoService.hashPassword(password);

      const user: User = {
        id: userId,
        username,
        email,
        password: hashedPassword,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      users.set(userId, user);
      emailIndex.set(email, userId);

      logger.info(`User registered: ${email}`);

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      logger.error('Registration error', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    try {
      const userId = emailIndex.get(email);

      if (!userId) {
        throw new Error('Invalid email or password');
      }

      const user = users.get(userId);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await cryptoService.comparePassword(
        password,
        user.password!
      );

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const payload: AuthPayload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      const { accessToken, refreshToken, expiresIn } =
        jwtService.generateTokenPair(payload);

      const { password: _, ...userWithoutPassword } = user;

      logger.info(`User logged in: ${email}`);

      return {
        accessToken,
        refreshToken,
        expiresIn,
        user: userWithoutPassword,
      };
    } catch (error) {
      logger.error('Login error', error);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const decoded = jwtService.verifyRefreshToken(refreshToken);

      const user = users.get(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      const payload: AuthPayload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      const { accessToken, refreshToken: newRefreshToken, expiresIn } =
        jwtService.generateTokenPair(payload);

      const { password: _, ...userWithoutPassword } = user;

      logger.info(`Access token refreshed for user: ${user.email}`);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn,
        user: userWithoutPassword,
      };
    } catch (error) {
      logger.error('Token refresh error', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = users.get(userId);

      if (!user) {
        return null;
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      logger.error('Get user error', error);
      throw error;
    }
  }

  async updateUserRole(
    userId: string,
    newRole: 'user' | 'admin' | 'premium'
  ): Promise<Omit<User, 'password'>> {
    try {
      const user = users.get(userId);

      if (!user) {
        throw new Error('User not found');
      }

      user.role = newRole;
      user.updatedAt = new Date();
      users.set(userId, user);

      logger.info(`User role updated: ${user.email} -> ${newRole}`);

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      logger.error('Update user role error', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
