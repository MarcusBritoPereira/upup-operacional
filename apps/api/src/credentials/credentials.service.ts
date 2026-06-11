import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CredentialEncryptionService } from './credential-encryption.service';

type CredentialRecord = Awaited<ReturnType<PrismaService['credential']['findUnique']>>;

@Injectable()
export class CredentialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: CredentialEncryptionService,
  ) {}

  async create(createCredentialDto: CreateCredentialDto) {
    const credential = await this.prisma.credential.create({
      data: {
        ...createCredentialDto,
        password: this.encryption.encrypt(createCredentialDto.password),
      },
    });

    return this.sanitizeCredential(credential);
  }

  async findAll(clientId: string) {
    const credentials = await this.prisma.credential.findMany({
      where: { clientId },
      orderBy: { systemName: 'asc' },
    });

    return credentials.map((credential) => this.sanitizeCredential(credential));
  }

  async findOne(id: string) {
    const credential = await this.getCredential(id);
    return this.sanitizeCredential(credential);
  }

  async revealPassword(id: string, userId: string) {
    const credential = await this.getCredential(id);

    await this.prisma.credentialAccessLog.create({
      data: {
        credentialId: credential.id,
        userId,
        action: 'reveal_password',
      },
    });

    return { password: this.encryption.decrypt(credential.password) };
  }

  async update(id: string, updateCredentialDto: UpdateCredentialDto) {
    await this.getCredential(id);
    const data = {
      ...updateCredentialDto,
      ...(updateCredentialDto.password
        ? { password: this.encryption.encrypt(updateCredentialDto.password) }
        : {}),
    };

    const credential = await this.prisma.credential.update({
      where: { id },
      data,
    });

    return this.sanitizeCredential(credential);
  }

  async remove(id: string) {
    await this.getCredential(id);
    const credential = await this.prisma.credential.delete({
      where: { id },
    });

    return this.sanitizeCredential(credential);
  }

  private async getCredential(id: string) {
    const credential = await this.prisma.credential.findUnique({
      where: { id },
    });
    if (!credential) {
      throw new NotFoundException(`Credencial com ID ${id} não encontrada`);
    }
    return credential;
  }

  private sanitizeCredential(credential: NonNullable<CredentialRecord>) {
    const { password: _password, ...safeCredential } = credential;
    return safeCredential;
  }
}
