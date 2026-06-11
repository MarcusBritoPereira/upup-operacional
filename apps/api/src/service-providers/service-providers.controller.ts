import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServiceProvidersService } from './service-providers.service';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { UpdateServiceProviderDto } from './dto/update-service-provider.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('service-providers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceProvidersController {
  constructor(private readonly serviceProvidersService: ServiceProvidersService) {}

  @Post()
  @Roles('admin', 'diretoria', 'gerencia')
  create(@Body() createServiceProviderDto: CreateServiceProviderDto) {
    return this.serviceProvidersService.create(createServiceProviderDto);
  }

  @Get()
  findAll() {
    return this.serviceProvidersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceProvidersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'diretoria', 'gerencia')
  update(@Param('id') id: string, @Body() updateServiceProviderDto: UpdateServiceProviderDto) {
    return this.serviceProvidersService.update(id, updateServiceProviderDto);
  }

  @Delete(':id')
  @Roles('admin', 'diretoria', 'gerencia')
  remove(@Param('id') id: string) {
    return this.serviceProvidersService.remove(id);
  }
}
