import jwt from 'jsonwebtoken';
import { environment } from '../config/environment';
import { AuthPayload } from '../types';
import { logger } from './logger';

export class JwtService {
  generateAccessToken(payload: AuthPayload): string {
    try {
      const token = jwt.sign(payload, environment.jwt.secret as jwt.Secret, {
        expiresIn: environment.jwt.expiry as jwt.SignOptions['expiresIn'],
        algorithm: 'HS256',
      } as jwt.SignOptions);
      return token;
    } catch (error) {
      logger.error('Error generating access token', error);
      throw error;
    }
  }

  generateRefreshToken(payload: AuthPayload): string {
    try {
      const token = jwt.sign(payload, environment.jwt.refreshSecret as jwt.Secret, {
        expiresIn: environment.jwt.refreshExpiry as jwt.SignOptions['expiresIn'],
        algorithm: 'HS256',
      } as jwt.SignOptions);
      return token;
    } catch (error) {
      logger.error('Error generating refresh token', error);
      throw error;
    }
  }

  generateTokenPair(payload: AuthPayload): {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Parse expiry to seconds
    const expiryStr = environment.jwt.expiry;
    const expiresIn = this.parseExpiry(expiryStr);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  verifyAccessToken(token: string): AuthPayload {
    try {
      const decoded = jwt.verify(token, environment.jwt.secret) as AuthPayload;
      return decoded;
    } catch (error) {
      logger.error('Error verifying access token', error);
      throw error;
    }
  }

  verifyRefreshToken(token: string): AuthPayload {
    try {
      const decoded = jwt.verify(token, environment.jwt.refreshSecret) as AuthPayload;
      return decoded;
    } catch (error) {
      logger.error('Error verifying refresh token', error);
      throw error;
    }
  }

  private parseExpiry(expiryStr: string): number {
    const match = expiryStr.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }
}

export const jwtService = new JwtService();
