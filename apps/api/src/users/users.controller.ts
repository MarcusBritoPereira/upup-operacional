import { Controller, Get, Param, Req, UseGuards, Patch, Body, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import type { RequestWithAuth } from '../auth/interfaces/auth-user.interface';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me/password')
  @Roles('super_admin', 'admin', 'diretoria', 'gerencia', 'gestor_cliente', 'colaborador')
  async updatePassword(@Req() req: RequestWithAuth, @Body() data: UpdatePasswordDto) {
    await this.usersService.updatePassword(req.user.id, data);
    return { success: true };
  }

  @Patch('me/profile')
  @Roles('super_admin', 'admin', 'diretoria', 'gerencia', 'gestor_cliente', 'colaborador')
  async updateProfile(@Req() req: RequestWithAuth, @Body() data: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, data);
  }

  @Post('me/avatar')
  @Roles('super_admin', 'admin', 'diretoria', 'gerencia', 'gestor_cliente', 'colaborador')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(__dirname, '..', '..', 'uploads');
          import('fs').then(fs => {
            if (!fs.existsSync(uploadPath)) {
              fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
          });
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${(req as unknown as RequestWithAuth).user.id}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new BadRequestException('Apenas imagens são permitidas'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadAvatar(@Req() req: RequestWithAuth, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');
    const avatarUrl = `/uploads/${file.filename}`;
    return this.usersService.updateAvatar(req.user.id, avatarUrl);
  }

  @Get()
  @Roles('super_admin', 'admin', 'diretoria', 'gerencia', 'gestor_cliente')
  findAll(@Req() req: RequestWithAuth) {
    return this.usersService.findAll(req.user);
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'diretoria', 'gerencia', 'gestor_cliente')
  findOne(@Param('id') id: string, @Req() req: RequestWithAuth) {
    return this.usersService.findOne(id, req.user);
  }
}
