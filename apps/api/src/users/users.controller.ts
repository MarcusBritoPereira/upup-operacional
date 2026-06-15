import { Controller, Get, Param, Req, UseGuards, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import type { RequestWithAuth } from '../auth/interfaces/auth-user.interface';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me/password')
  @Roles('admin', 'diretoria', 'gerencia', 'gestor_cliente', 'colaborador')
  async updatePassword(@Req() req: RequestWithAuth, @Body() data: UpdatePasswordDto) {
    await this.usersService.updatePassword(req.user.id, data);
    return { success: true };
  }

  @Get()
  @Roles('admin', 'diretoria', 'gerencia', 'gestor_cliente')
  findAll(@Req() req: RequestWithAuth) {
    return this.usersService.findAll(req.user);
  }

  @Get(':id')
  @Roles('admin', 'diretoria', 'gerencia', 'gestor_cliente')
  findOne(@Param('id') id: string, @Req() req: RequestWithAuth) {
    return this.usersService.findOne(id, req.user);
  }
}
