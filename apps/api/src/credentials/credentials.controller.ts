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
} from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('credentials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post()
  @Roles('admin', 'diretoria')
  create(@Body() createCredentialDto: CreateCredentialDto) {
    return this.credentialsService.create(createCredentialDto);
  }

  @Get()
  @Roles('admin', 'diretoria')
  findAll(@Query('clientId') clientId: string) {
    return this.credentialsService.findAll(clientId);
  }

  @Get(':id/reveal')
  @Roles('admin', 'diretoria')
  revealPassword(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.credentialsService.revealPassword(id, req.user.id);
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
  ) {
    return this.credentialsService.update(id, updateCredentialDto);
  }

  @Delete(':id')
  @Roles('admin', 'diretoria')
  remove(@Param('id') id: string) {
    return this.credentialsService.remove(id);
  }
}
