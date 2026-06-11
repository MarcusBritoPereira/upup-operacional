import { Module } from '@nestjs/common';
import { CredentialsController } from './credentials.controller';
import { CredentialsService } from './credentials.service';
import { CredentialEncryptionService } from './credential-encryption.service';

@Module({
  controllers: [CredentialsController],
  providers: [CredentialsService, CredentialEncryptionService],
})
export class CredentialsModule {}
