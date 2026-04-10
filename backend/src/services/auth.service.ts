import { cryptoService } from '../utils/crypto';
import { jwtService } from '../utils/jwt';
import { logger } from '../utils/logger';
import { User, AuthPayload, TokenResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../config/database';

type UserRow = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'premium';
  created_at: string;
  updated_at: string;
};

function toUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    password: row.password,
    role: row.role,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class AuthService {
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<Omit<User, 'password'>> {
    try {
      const db = await getDb();
      const existing = await db.get<{ id: string }>('SELECT id FROM users WHERE email = ?', email);

      if (existing) {
        throw new Error('Email already registered');
      }

      const userId = uuidv4();
      const hashedPassword = await cryptoService.hashPassword(password);
      const now = new Date();

      const user: User = {
        id: userId,
        username,
        email,
        password: hashedPassword,
        role: 'user',
        createdAt: now,
        updatedAt: now,
      };

      await db.run(
        `INSERT INTO users (id, username, email, password, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        user.id,
        user.username,
        user.email,
        user.password,
        user.role,
        user.createdAt.toISOString(),
        user.updatedAt.toISOString()
      );

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
      const db = await getDb();
      const row = await db.get<UserRow>('SELECT * FROM users WHERE email = ?', email);

      if (!row) {
        throw new Error('Invalid email or password');
      }

      const user = toUser(row);

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
      const db = await getDb();
      const decoded = jwtService.verifyRefreshToken(refreshToken);

      const row = await db.get<UserRow>('SELECT * FROM users WHERE id = ?', decoded.userId);

      if (!row) {
        throw new Error('User not found');
      }

      const user = toUser(row);

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
      const db = await getDb();
      const row = await db.get<UserRow>('SELECT * FROM users WHERE id = ?', userId);

      if (!row) {
        return null;
      }

      const user = toUser(row);

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
      const db = await getDb();
      const row = await db.get<UserRow>('SELECT * FROM users WHERE id = ?', userId);

      if (!row) {
        throw new Error('User not found');
      }

      const user = toUser(row);

      user.role = newRole;
      user.updatedAt = new Date();

      await db.run(
        'UPDATE users SET role = ?, updated_at = ? WHERE id = ?',
        user.role,
        user.updatedAt.toISOString(),
        user.id
      );

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
