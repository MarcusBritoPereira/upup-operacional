import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CredentialEncryptionService } from './credential-encryption.service';

type CredentialRecord = Awaited<
  ReturnType<PrismaService['credential']['findUnique']>
>;

@Injectable()
export class CredentialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: CredentialEncryptionService,
  ) {}

  async create(createCredentialDto: CreateCredentialDto, userId: string) {
    const credential = await this.prisma.credential.create({
      data: {
        ...createCredentialDto,
        password: this.encryption.encrypt(createCredentialDto.password),
      },
    });

    await this.logAccess(credential.id, userId, 'create');
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

  async revealPassword(id: string, userId: string, currentPassword: string) {
    const credential = await this.getCredential(id);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isPasswordValid = user
      ? await bcrypt.compare(currentPassword, user.passwordHash)
      : false;

    if (!isPasswordValid) {
      await this.logAccess(credential.id, userId, 'reveal_password_denied');
      throw new UnauthorizedException('Senha atual inválida.');
    }

    await this.logAccess(credential.id, userId, 'reveal_password');
    return { password: this.encryption.decrypt(credential.password) };
  }

  async update(
    id: string,
    updateCredentialDto: UpdateCredentialDto,
    userId: string,
  ) {
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

    await this.logAccess(credential.id, userId, 'update');
    return this.sanitizeCredential(credential);
  }

  async remove(id: string, userId: string) {
    const existing = await this.getCredential(id);
    await this.logAccess(existing.id, userId, 'delete');

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

  private async logAccess(
    credentialId: string,
    userId: string,
    action: string,
  ) {
    await this.prisma.credentialAccessLog.create({
      data: {
        credentialId,
        userId,
        action,
      },
    });
  }

  private sanitizeCredential(credential: NonNullable<CredentialRecord>) {
    const { password: _password, ...safeCredential } = credential;
    return safeCredential;
  }
}
