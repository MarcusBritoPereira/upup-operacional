import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { RevealCredentialDto } from './dto/reveal-credential.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('credentials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post()
  @Roles('admin', 'diretoria')
  create(
    @Body() createCredentialDto: CreateCredentialDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.credentialsService.create(createCredentialDto, req.user.id);
  }

  @Get()
  @Roles('admin', 'diretoria')
  findAll(@Query('clientId') clientId: string | undefined) {
    if (!clientId) {
      throw new BadRequestException('clientId é obrigatório.');
    }

    return this.credentialsService.findAll(clientId);
  }

  @Post(':id/reveal')
  @Roles('admin', 'diretoria')
  revealPassword(
    @Param('id') id: string,
    @Body() revealCredentialDto: RevealCredentialDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.credentialsService.revealPassword(
      id,
      req.user.id,
      revealCredentialDto.password,
    );
  }

  @Get(':id')
  @Roles('admin', 'diretoria')
  findOne(@Param('id') id: string) {
    return this.credentialsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'diretoria')
  update(
    @Param('id') id: string,
    @Body() updateCredentialDto: UpdateCredentialDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.credentialsService.update(id, updateCredentialDto, req.user.id);
  }

  @Delete(':id')
  @Roles('admin', 'diretoria')
  remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.credentialsService.remove(id, req.user.id);
  }
}
