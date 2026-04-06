import bcryptjs from 'bcryptjs';
import { logger } from './logger';

export class CryptoService {
  private saltRounds = 10;

  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcryptjs.genSalt(this.saltRounds);
      const hash = await bcryptjs.hash(password, salt);
      return hash;
    } catch (error) {
      logger.error('Error hashing password', error);
      throw error;
    }
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      const match = await bcryptjs.compare(password, hash);
      return match;
    } catch (error) {
      logger.error('Error comparing password', error);
      throw error;
    }
  }

  generateRandomString(length: number = 32): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  generateApiKey(): string {
    return `sk_${this.generateRandomString(32)}`;
  }
}

export const cryptoService = new CryptoService();
