import { ConfigService } from '@nestjs/config';
import { CredentialEncryptionService } from './credential-encryption.service';

describe('CredentialEncryptionService', () => {
  function createService() {
    const config = new ConfigService({
      NODE_ENV: 'test',
      CREDENTIALS_ENCRYPTION_KEY:
        'test-secret-with-at-least-32-characters',
    });
    return new CredentialEncryptionService(config);
  }

  it('encrypts and decrypts a credential secret', () => {
    const service = createService();
    const encrypted = service.encrypt('super-secret');

    expect(encrypted).not.toBe('super-secret');
    expect(encrypted.startsWith('enc:v1:')).toBe(true);
    expect(service.decrypt(encrypted)).toBe('super-secret');
  });

  it('keeps legacy plaintext decryptable for migration compatibility', () => {
    const service = createService();

    expect(service.decrypt('legacy-secret')).toBe('legacy-secret');
  });
});
