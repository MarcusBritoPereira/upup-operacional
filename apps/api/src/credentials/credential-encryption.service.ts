import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

const PREFIX = 'enc:v1';
const ALGORITHM = 'aes-256-gcm';

@Injectable()
export class CredentialEncryptionService {
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const configuredKey = this.configService.get<string>(
      'CREDENTIALS_ENCRYPTION_KEY',
    );
    const nodeEnv = this.configService.get<string>('NODE_ENV') ?? 'development';

    if (!configuredKey && nodeEnv === 'production') {
      throw new InternalServerErrorException(
        'CREDENTIALS_ENCRYPTION_KEY é obrigatória em produção.',
      );
    }

    this.key = this.normalizeKey(
      configuredKey ??
        'development-only-credential-key-change-before-production',
    );
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
      PREFIX,
      iv.toString('base64url'),
      authTag.toString('base64url'),
      encrypted.toString('base64url'),
    ].join(':');
  }

  decrypt(value: string): string {
    if (!this.isEncrypted(value)) {
      return value;
    }

    const [, , encodedIv, encodedAuthTag, encodedEncrypted] = value.split(':');
    const decipher = createDecipheriv(
      ALGORITHM,
      this.key,
      Buffer.from(encodedIv, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(encodedAuthTag, 'base64url'));

    return Buffer.concat([
      decipher.update(Buffer.from(encodedEncrypted, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }

  isEncrypted(value: string): boolean {
    return value.startsWith(`${PREFIX}:`);
  }

  private normalizeKey(value: string): Buffer {
    if (/^[a-f0-9]{64}$/i.test(value)) {
      return Buffer.from(value, 'hex');
    }

    const base64 = Buffer.from(value, 'base64');
    if (base64.length === 32) {
      return base64;
    }

    return createHash('sha256').update(value).digest();
  }
}
